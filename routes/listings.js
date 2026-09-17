import { Router } from "express";
import jwt from "jsonwebtoken";
import { handleUpload } from "@vercel/blob/client";
import Listing from "../models/Listing.js";
import requireAuth from "../middleware/auth.js";
import { cacheGet, cacheSet, cacheDel } from "../config/cache.js";
import { deleteImages } from "../config/blob.js";

const router = Router();

const LIST_CACHE_TTL = 60;
const ITEM_CACHE_TTL = 300;
const listCacheKey = (kind) => `listings:all:${kind || "any"}`;
const itemCacheKey = (id) => `listings:${id}`;

// The extremes (min/max) are computed from the data of the individual
// apartments, ignoring zero/empty values (those have not been filled in
// yet).
function computeRange(values) {
  const valid = values.filter((v) => v > 0);
  if (valid.length === 0) return null;
  return { min: Math.min(...valid), max: Math.max(...valid) };
}

function buildUnits(rawUnits) {
  if (!Array.isArray(rawUnits)) return [];
  return rawUnits.map((u) => ({
    price: Number(u?.price) || 0,
    size: Number(u?.size) || 0,
    images: Array.isArray(u?.images) ? u.images.slice(0, 2) : [],
  }));
}

// A single flat list of the photos of the given listing (and, for a project,
// of all its apartments) - used for deleting blobs.
function collectAllImages(listing) {
  const unitImages = (listing.units || []).flatMap((u) => u.images || []);
  return [...(listing.images || []), ...unitImages];
}

function buildListingData(body) {
  const kind = body.kind === "projekt" ? "projekt" : "ingatlan";
  const roomsMin = Number(body.roomsMin) || 0;
  const roomsMax = Number(body.roomsMax) || 0;
  const units = kind === "projekt" ? buildUnits(body.units) : [];

  // If there are apartments, the project's price/floor-area range is always
  // computed from them. If not a single apartment has been filled in yet
  // (e.g. editing an old project from before the apartment breakdown), we
  // fall back to the submitted priceMin/Max/sizeMin/Max values so that the
  // existing data is not lost.
  const priceRange = computeRange(units.map((u) => u.price));
  const sizeRange = computeRange(units.map((u) => u.size));
  const priceMin = priceRange ? priceRange.min : Number(body.priceMin) || 0;
  const priceMax = priceRange ? priceRange.max : Number(body.priceMax) || 0;
  const sizeMin = sizeRange ? sizeRange.min : Number(body.sizeMin) || 0;
  const sizeMax = sizeRange ? sizeRange.max : Number(body.sizeMax) || 0;

  return {
    title: body.title,
    kind,
    category: body.category,
    price: kind === "projekt" ? priceMin : Number(body.price) || 0,
    priceMin: kind === "projekt" ? priceMin : 0,
    priceMax: kind === "projekt" ? priceMax : 0,
    city: body.city,
    address: body.address || "",
    size: kind === "projekt" ? sizeMin : Number(body.size) || 0,
    sizeMin: kind === "projekt" ? sizeMin : 0,
    sizeMax: kind === "projekt" ? sizeMax : 0,
    rooms: kind === "projekt" ? roomsMin : Number(body.rooms) || 0,
    roomsMin: kind === "projekt" ? roomsMin : 0,
    roomsMax: kind === "projekt" ? roomsMax : 0,
    availableUnits: kind === "projekt" ? units.length : 0,
    units,
    description: body.description || "",
    featured: Boolean(body.featured),
    images: Array.isArray(body.images) ? body.images : [],
  };
}

// POST /api/listings/blob-upload - issues an image upload token for the
// browser, so that the photos are uploaded straight to Vercel Blob (bypassing
// the 4.5 MB request size limit of serverless functions). It receives the
// admin JWT in the clientPayload, because this endpoint is also called by
// Vercel Blob's own "upload completed" callback, which does not carry our
// Authorization header.
router.post("/blob-upload", async (req, res) => {
  try {
    const jsonResponse = await handleUpload({
      body: req.body,
      request: req,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        let token;
        try {
          token = JSON.parse(clientPayload || "{}").token;
        } catch {
          token = null;
        }
        if (!token) {
          throw new Error("Hianyzo azonositas.");
        }
        try {
          jwt.verify(token, process.env.JWT_SECRET);
        } catch {
          throw new Error("Ervenytelen vagy lejart munkamenet.");
        }

        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {
        // No extra logic needed: at the end of the upload the client saves
        // the returned URL to the listing itself via the usual POST/PUT
        // request.
      },
    });

    res.json(jsonResponse);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/listings?kind=ingatlan|projekt - fetch properties/projects
// (cached). Without kind it returns both.
router.get("/", async (req, res) => {
  try {
    const kind = req.query.kind === "projekt" || req.query.kind === "ingatlan" ? req.query.kind : null;
    const key = listCacheKey(kind);
    const cached = cacheGet(key);
    if (cached) {
      return res.json(cached);
    }

    const listings = await Listing.find(kind ? { kind } : {}).sort({ createdAt: -1 });
    cacheSet(key, listings, LIST_CACHE_TTL);
    res.json(listings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Hiba az ingatlanok lekeresekor." });
  }
});

// GET /api/listings/:id - fetch a single property (cached)
router.get("/:id", async (req, res) => {
  try {
    const key = itemCacheKey(req.params.id);
    const cached = cacheGet(key);
    if (cached) {
      return res.json(cached);
    }

    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: "Nem talalhato ingatlan." });
    }

    cacheSet(key, listing, ITEM_CACHE_TTL);
    res.json(listing);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Hiba az ingatlan lekeresekor." });
  }
});

// POST /api/listings - create a new property (admin). The images have already
// been uploaded to Vercel Blob, here we only receive the final URLs.
router.post("/", requireAuth, async (req, res) => {
  try {
    const listing = await Listing.create(buildListingData(req.body));
    cacheDel(listCacheKey(null), listCacheKey("ingatlan"), listCacheKey("projekt"));
    res.status(201).json(listing);
  } catch (err) {
    res.status(400).json({ message: "Hibas adatok.", error: err.message });
  }
});

// PUT /api/listings/:id - update a property (admin). Deleted images are
// determined from the difference between the old and the new images list, and
// removed from Blob.
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const existing = await Listing.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: "Nem talalhato ingatlan." });
    }

    const data = buildListingData(req.body);
    const oldImages = collectAllImages(existing);
    const newImages = collectAllImages(data);
    const removedImages = oldImages.filter((img) => !newImages.includes(img));

    const listing = await Listing.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });

    await deleteImages(removedImages);
    cacheDel(listCacheKey(null), listCacheKey("ingatlan"), listCacheKey("projekt"), itemCacheKey(req.params.id));
    res.json(listing);
  } catch (err) {
    res.status(400).json({ message: "Hibas adatok.", error: err.message });
  }
});

// DELETE /api/listings/:id - delete a property and its images (admin)
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const listing = await Listing.findByIdAndDelete(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: "Nem talalhato ingatlan." });
    }
    await deleteImages(collectAllImages(listing));
    cacheDel(listCacheKey(null), listCacheKey("ingatlan"), listCacheKey("projekt"), itemCacheKey(req.params.id));
    res.json({ message: "Ingatlan torolve." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Hiba az ingatlan torlesekor." });
  }
});

export default router;
