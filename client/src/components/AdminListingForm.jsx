import { useEffect, useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { compressImage } from "../imageCompression";

const emptyForm = {
  title: "",
  category: "Lakás",
  price: "",
  priceMin: "",
  priceMax: "",
  city: "",
  address: "",
  size: "",
  sizeMin: "",
  sizeMax: "",
  rooms: "",
  roomsMin: "",
  roomsMax: "",
  availableUnits: "",
  description: "",
  featured: false,
};

let uploadIdCounter = 0;

export default function AdminListingForm({ initial, token, onSubmit, onCancel, submitting, kind = "ingatlan" }) {
  const [form, setForm] = useState(() =>
    initial
      ? {
          title: initial.title || "",
          category: initial.category || "Lakás",
          price: initial.price ?? "",
          priceMin: initial.priceMin ?? "",
          priceMax: initial.priceMax ?? "",
          city: initial.city || "",
          address: initial.address || "",
          size: initial.size ?? "",
          sizeMin: initial.sizeMin ?? "",
          sizeMax: initial.sizeMax ?? "",
          rooms: initial.rooms ?? "",
          roomsMin: initial.roomsMin ?? "",
          roomsMax: initial.roomsMax ?? "",
          availableUnits: initial.availableUnits ?? "",
          description: initial.description || "",
          featured: !!initial.featured,
        }
      : emptyForm
  );

  const [existingImages, setExistingImages] = useState(initial?.images || []);
  const [uploads, setUploads] = useState([]); // { id, previewUrl, status, url?, error? }
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      uploads.forEach((u) => URL.revokeObjectURL(u.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleFilesSelected(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = "";

    for (const file of files) {
      const id = ++uploadIdCounter;
      const previewUrl = URL.createObjectURL(file);
      setUploads((prev) => [...prev, { id, previewUrl, status: "compressing" }]);

      compressImage(file)
        .then((compressed) => {
          setUploads((prev) =>
            prev.map((u) => (u.id === id ? { ...u, status: "uploading" } : u))
          );

          return upload(compressed.name, compressed, {
            access: "public",
            handleUploadUrl: "/api/listings/blob-upload",
            clientPayload: JSON.stringify({ token }),
          });
        })
        .then((blob) => {
          setUploads((prev) =>
            prev.map((u) => (u.id === id ? { ...u, status: "done", url: blob.url } : u))
          );
        })
        .catch((err) => {
          setUploads((prev) =>
            prev.map((u) =>
              u.id === id ? { ...u, status: "error", error: err.message } : u
            )
          );
        });
    }
  }

  function removeExistingImage(url) {
    setExistingImages((prev) => prev.filter((img) => img !== url));
  }

  function removeUpload(id) {
    setUploads((prev) => {
      const target = prev.find((u) => u.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((u) => u.id !== id);
    });
  }

  const isUploading = uploads.some((u) => u.status === "uploading" || u.status === "compressing");

  function handleSubmit(e) {
    e.preventDefault();

    const newImageUrls = uploads.filter((u) => u.status === "done").map((u) => u.url);

    onSubmit({
      ...form,
      kind,
      price: Number(form.price) || 0,
      priceMin: Number(form.priceMin) || 0,
      priceMax: Number(form.priceMax) || 0,
      size: Number(form.size) || 0,
      sizeMin: Number(form.sizeMin) || 0,
      sizeMax: Number(form.sizeMax) || 0,
      rooms: Number(form.rooms) || 0,
      roomsMin: Number(form.roomsMin) || 0,
      roomsMax: Number(form.roomsMax) || 0,
      availableUnits: Number(form.availableUnits) || 0,
      images: [...existingImages, ...newImageUrls],
    });
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <div className="admin-form-grid">
        <div className="field">
          <label htmlFor="af-title">Cím *</label>
          <input
            id="af-title"
            name="title"
            type="text"
            required
            value={form.title}
            onChange={handleChange}
            placeholder="Pl. Napfényes családi ház a Rózsadombon"
          />
        </div>

        <div className="field">
          <label htmlFor="af-category">Kategória</label>
          <select id="af-category" name="category" value={form.category} onChange={handleChange}>
            <option value="Lakás">Lakás</option>
            <option value="Ház">Ház</option>
            <option value="Telek">Telek</option>
            <option value="Iroda">Iroda</option>
            <option value="Nyaraló">Nyaraló</option>
          </select>
        </div>

        {kind === "projekt" ? (
          <>
            <div className="field">
              <label htmlFor="af-price-min">Ártól (Ft) *</label>
              <input
                id="af-price-min"
                name="priceMin"
                type="number"
                min="0"
                required
                value={form.priceMin}
                onChange={handleChange}
                placeholder="Pl. 45000000"
              />
            </div>

            <div className="field">
              <label htmlFor="af-price-max">Árig (Ft) *</label>
              <input
                id="af-price-max"
                name="priceMax"
                type="number"
                min="0"
                required
                value={form.priceMax}
                onChange={handleChange}
                placeholder="Pl. 62000000"
              />
            </div>
          </>
        ) : (
          <div className="field">
            <label htmlFor="af-price">Ár (Ft) *</label>
            <input
              id="af-price"
              name="price"
              type="number"
              min="0"
              required
              value={form.price}
              onChange={handleChange}
              placeholder="Pl. 55000000"
            />
          </div>
        )}

        <div className="field">
          <label htmlFor="af-city">Település *</label>
          <input
            id="af-city"
            name="city"
            type="text"
            required
            value={form.city}
            onChange={handleChange}
            placeholder="Pl. Budapest"
          />
        </div>

        <div className="field">
          <label htmlFor="af-address">Cím / utca</label>
          <input
            id="af-address"
            name="address"
            type="text"
            value={form.address}
            onChange={handleChange}
            placeholder="Pl. Fő utca 12."
          />
        </div>

        {kind === "projekt" ? (
          <>
            <div className="field">
              <label htmlFor="af-size-min">Alapterülettől (m²)</label>
              <input
                id="af-size-min"
                name="sizeMin"
                type="number"
                min="0"
                value={form.sizeMin}
                onChange={handleChange}
                placeholder="Pl. 45"
              />
            </div>

            <div className="field">
              <label htmlFor="af-size-max">Alapterületig (m²)</label>
              <input
                id="af-size-max"
                name="sizeMax"
                type="number"
                min="0"
                value={form.sizeMax}
                onChange={handleChange}
                placeholder="Pl. 85"
              />
            </div>
          </>
        ) : (
          <div className="field">
            <label htmlFor="af-size">Alapterület (m²)</label>
            <input
              id="af-size"
              name="size"
              type="number"
              min="0"
              value={form.size}
              onChange={handleChange}
            />
          </div>
        )}

        {kind === "projekt" ? (
          <>
            <div className="field">
              <label htmlFor="af-rooms-min">Szobák számától</label>
              <input
                id="af-rooms-min"
                name="roomsMin"
                type="number"
                min="0"
                value={form.roomsMin}
                onChange={handleChange}
                placeholder="Pl. 1"
              />
            </div>

            <div className="field">
              <label htmlFor="af-rooms-max">Szobák számáig</label>
              <input
                id="af-rooms-max"
                name="roomsMax"
                type="number"
                min="0"
                value={form.roomsMax}
                onChange={handleChange}
                placeholder="Pl. 4"
              />
            </div>
          </>
        ) : (
          <div className="field">
            <label htmlFor="af-rooms">Szobák száma</label>
            <input
              id="af-rooms"
              name="rooms"
              type="number"
              min="0"
              value={form.rooms}
              onChange={handleChange}
            />
          </div>
        )}

        {kind === "projekt" && (
          <div className="field">
            <label htmlFor="af-available-units">Szabad lakások</label>
            <input
              id="af-available-units"
              name="availableUnits"
              type="number"
              min="0"
              value={form.availableUnits}
              onChange={handleChange}
              placeholder="Pl. 12"
            />
          </div>
        )}

        <div className="field admin-form-span">
          <label>Fényképek</label>

          {(existingImages.length > 0 || uploads.length > 0) && (
            <div className="admin-image-grid">
              {existingImages.map((url) => (
                <div className="admin-image-thumb" key={url}>
                  <img src={url} alt="" />
                  <button
                    type="button"
                    className="admin-image-remove"
                    onClick={() => removeExistingImage(url)}
                    aria-label="Kép eltávolítása"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {uploads.map((u) => (
                <div className="admin-image-thumb" key={u.id}>
                  <img src={u.previewUrl} alt="" />
                  {u.status === "compressing" && (
                    <div className="admin-image-status">Tömörítés…</div>
                  )}
                  {u.status === "uploading" && (
                    <div className="admin-image-status">Feltöltés…</div>
                  )}
                  {u.status === "error" && (
                    <div className="admin-image-status admin-image-status-error">
                      Hiba: {u.error}
                    </div>
                  )}
                  <button
                    type="button"
                    className="admin-image-remove"
                    onClick={() => removeUpload(u.id)}
                    aria-label="Kép eltávolítása"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFilesSelected}
            hidden
          />
          <button
            type="button"
            className="btn btn-outline btn-small"
            onClick={() => fileInputRef.current?.click()}
          >
            + Fényképek hozzáadása
          </button>
        </div>

        <div className="field admin-form-span">
          <label htmlFor="af-description">Leírás</label>
          <textarea
            id="af-description"
            name="description"
            rows={4}
            value={form.description}
            onChange={handleChange}
          />
        </div>

        <label className="admin-checkbox admin-form-span">
          <input
            type="checkbox"
            name="featured"
            checked={form.featured}
            onChange={handleChange}
          />
          {kind === "projekt" ? "Kiemelt projekt a főoldalon" : "Kiemelt ingatlan a főoldalon"}
        </label>
      </div>

      <div className="admin-form-actions">
        <button type="button" className="btn btn-outline" onClick={onCancel}>
          Mégse
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting || isUploading}>
          {isUploading ? "Képek feltöltése…" : submitting ? "Mentés…" : "Mentés"}
        </button>
      </div>
    </form>
  );
}
