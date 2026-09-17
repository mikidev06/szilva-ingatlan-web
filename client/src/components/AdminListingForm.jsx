import { useEffect, useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { compressImage } from "../imageCompression";

const emptyForm = {
  title: "",
  category: "Lakás",
  price: "",
  city: "",
  address: "",
  size: "",
  rooms: "",
  roomsMin: "",
  roomsMax: "",
  availableUnits: "",
  description: "",
  featured: false,
};

const MAX_UNITS = 300;
const MAX_UNIT_IMAGES = 2;

function emptyUnit() {
  return { price: "", size: "", existingImages: [], uploads: [] };
}

// If the project already has itemized apartments, we start from those. When
// editing an old project from before the apartment breakdown, we create empty
// rows to match the already given number of "available apartments", so the
// data can be migrated to the itemized format.
function buildInitialUnits(initial) {
  if (!initial) return [];
  if (Array.isArray(initial.units) && initial.units.length > 0) {
    return initial.units.map((u) => ({
      price: u.price ?? "",
      size: u.size ?? "",
      existingImages: Array.isArray(u.images) ? u.images : [],
      uploads: [],
    }));
  }
  const count = Number(initial.availableUnits) || 0;
  return Array.from({ length: count }, emptyUnit);
}

let uploadIdCounter = 0;

export default function AdminListingForm({ initial, token, onSubmit, onCancel, submitting, kind = "ingatlan" }) {
  const [form, setForm] = useState(() =>
    initial
      ? {
          title: initial.title || "",
          category: initial.category || "Lakás",
          price: initial.price ?? "",
          city: initial.city || "",
          address: initial.address || "",
          size: initial.size ?? "",
          rooms: initial.rooms ?? "",
          roomsMin: initial.roomsMin ?? "",
          roomsMax: initial.roomsMax ?? "",
          availableUnits: initial.availableUnits ?? "",
          description: initial.description || "",
          featured: !!initial.featured,
        }
      : emptyForm
  );

  const [units, setUnits] = useState(() => buildInitialUnits(initial));
  const unitFileInputRefs = useRef({});

  const [existingImages, setExistingImages] = useState(initial?.images || []);
  const [uploads, setUploads] = useState([]); // { id, previewUrl, status, url?, error? }
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      uploads.forEach((u) => URL.revokeObjectURL(u.previewUrl));
      units.forEach((u) => u.uploads.forEach((up) => URL.revokeObjectURL(up.previewUrl)));
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

  // The value of the "Szabad lakások" field decides how many apartment rows
  // appear below it: on increase, empty rows are appended; on decrease, rows
  // are dropped from the end (and the preview URLs of the images of any
  // already uploaded but truncated rows are released).
  function handleAvailableUnitsChange(e) {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, availableUnits: value }));

    const count = Math.max(0, Math.min(MAX_UNITS, Number(value) || 0));
    setUnits((prev) => {
      if (count >= prev.length) {
        return [...prev, ...Array.from({ length: count - prev.length }, emptyUnit)];
      }
      const removed = prev.slice(count);
      removed.forEach((u) => u.uploads.forEach((up) => URL.revokeObjectURL(up.previewUrl)));
      return prev.slice(0, count);
    });
  }

  function handleUnitFieldChange(index, field, value) {
    setUnits((prev) => prev.map((u, i) => (i === index ? { ...u, [field]: value } : u)));
  }

  async function handleUnitFilesSelected(index, e) {
    const unit = units[index];
    const remainingSlots = MAX_UNIT_IMAGES - unit.existingImages.length - unit.uploads.length;
    const files = Array.from(e.target.files || []).slice(0, Math.max(0, remainingSlots));
    e.target.value = "";

    for (const file of files) {
      const id = ++uploadIdCounter;
      const previewUrl = URL.createObjectURL(file);
      setUnits((prev) =>
        prev.map((u, i) =>
          i === index ? { ...u, uploads: [...u.uploads, { id, previewUrl, status: "compressing" }] } : u
        )
      );

      compressImage(file)
        .then((compressed) => {
          setUnits((prev) =>
            prev.map((u, i) =>
              i === index
                ? { ...u, uploads: u.uploads.map((x) => (x.id === id ? { ...x, status: "uploading" } : x)) }
                : u
            )
          );

          return upload(compressed.name, compressed, {
            access: "public",
            handleUploadUrl: "/api/listings/blob-upload",
            clientPayload: JSON.stringify({ token }),
          });
        })
        .then((blob) => {
          setUnits((prev) =>
            prev.map((u, i) =>
              i === index
                ? { ...u, uploads: u.uploads.map((x) => (x.id === id ? { ...x, status: "done", url: blob.url } : x)) }
                : u
            )
          );
        })
        .catch((err) => {
          setUnits((prev) =>
            prev.map((u, i) =>
              i === index
                ? {
                    ...u,
                    uploads: u.uploads.map((x) => (x.id === id ? { ...x, status: "error", error: err.message } : x)),
                  }
                : u
            )
          );
        });
    }
  }

  function removeUnitExistingImage(index, url) {
    setUnits((prev) =>
      prev.map((u, i) => (i === index ? { ...u, existingImages: u.existingImages.filter((img) => img !== url) } : u))
    );
  }

  function removeUnitUpload(index, uploadId) {
    setUnits((prev) =>
      prev.map((u, i) => {
        if (i !== index) return u;
        const target = u.uploads.find((x) => x.id === uploadId);
        if (target) URL.revokeObjectURL(target.previewUrl);
        return { ...u, uploads: u.uploads.filter((x) => x.id !== uploadId) };
      })
    );
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

  const isUploading =
    uploads.some((u) => u.status === "uploading" || u.status === "compressing") ||
    units.some((u) => u.uploads.some((x) => x.status === "uploading" || x.status === "compressing"));

  function handleSubmit(e) {
    e.preventDefault();

    const newImageUrls = uploads.filter((u) => u.status === "done").map((u) => u.url);

    const unitsPayload = units.map((u) => ({
      price: Number(u.price) || 0,
      size: Number(u.size) || 0,
      images: [...u.existingImages, ...u.uploads.filter((x) => x.status === "done").map((x) => x.url)],
    }));

    onSubmit({
      ...form,
      kind,
      price: Number(form.price) || 0,
      size: Number(form.size) || 0,
      rooms: Number(form.rooms) || 0,
      roomsMin: Number(form.roomsMin) || 0,
      roomsMax: Number(form.roomsMax) || 0,
      availableUnits: Number(form.availableUnits) || 0,
      units: kind === "projekt" ? unitsPayload : [],
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

        {kind !== "projekt" && (
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

        {kind !== "projekt" && (
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
              onChange={handleAvailableUnitsChange}
              placeholder="Pl. 12"
            />
          </div>
        )}

        {kind === "projekt" && units.length > 0 && (
          <div className="field admin-form-span">
            <label>Lakások adatai ({units.length})</label>
            <p className="admin-form-hint">
              Az ár és alapterület tartomány a lakások adataiból számolódik automatikusan.
            </p>
            <div className="admin-units-list">
              {units.map((unit, index) => {
                const totalImages = unit.existingImages.length + unit.uploads.length;
                return (
                  <div className="admin-unit-card" key={index}>
                    <div className="admin-unit-header">{index + 1}. lakás</div>

                    <div className="admin-unit-fields">
                      <div className="field">
                        <label htmlFor={`af-unit-price-${index}`}>Ár (Ft)</label>
                        <input
                          id={`af-unit-price-${index}`}
                          type="number"
                          min="0"
                          value={unit.price}
                          onChange={(e) => handleUnitFieldChange(index, "price", e.target.value)}
                          placeholder="Pl. 52000000"
                        />
                      </div>
                      <div className="field">
                        <label htmlFor={`af-unit-size-${index}`}>Alapterület (m²)</label>
                        <input
                          id={`af-unit-size-${index}`}
                          type="number"
                          min="0"
                          value={unit.size}
                          onChange={(e) => handleUnitFieldChange(index, "size", e.target.value)}
                          placeholder="Pl. 62"
                        />
                      </div>
                    </div>

                    {(unit.existingImages.length > 0 || unit.uploads.length > 0) && (
                      <div className="admin-image-grid admin-unit-image-grid">
                        {unit.existingImages.map((url) => (
                          <div className="admin-image-thumb" key={url}>
                            <img src={url} alt="" />
                            <button
                              type="button"
                              className="admin-image-remove"
                              onClick={() => removeUnitExistingImage(index, url)}
                              aria-label="Kép eltávolítása"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                        {unit.uploads.map((u) => (
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
                              onClick={() => removeUnitUpload(index, u.id)}
                              aria-label="Kép eltávolítása"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      hidden
                      ref={(el) => {
                        unitFileInputRefs.current[index] = el;
                      }}
                      onChange={(e) => handleUnitFilesSelected(index, e)}
                    />
                    <button
                      type="button"
                      className="btn btn-outline btn-small"
                      disabled={totalImages >= MAX_UNIT_IMAGES}
                      onClick={() => unitFileInputRefs.current[index]?.click()}
                    >
                      + Fénykép ({totalImages}/{MAX_UNIT_IMAGES})
                    </button>
                  </div>
                );
              })}
            </div>
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
