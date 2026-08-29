import { Router } from "express";
import multer from "multer";
import Listing from "../models/Listing.js";
import requireAuth from "../middleware/auth.js";
import { cacheGet, cacheSet, cacheDel } from "../config/cache.js";
import { uploadImages, deleteImages } from "../config/blob.js";

const router = Router();

const LIST_CACHE_KEY = "listings:all";
const LIST_CACHE_TTL = 60;
const ITEM_CACHE_TTL = 300;
const itemCacheKey = (id) => `listings:${id}`;

const MAX_IMAGES = 12;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: MAX_IMAGES },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Csak kepfajlok tolthetok fel."));
    }
    cb(null, true);
  },
});

function handleUploadErrors(err, req, res, next) {
  if (err) {
    return res.status(400).json({ message: err.message || "Hiba a kepek feltoltesekor." });
  }
  next();
}

function buildListingData(req, images) {
  return {
    title: req.body.title,
    type: req.body.type,
    category: req.body.category,
    price: Number(req.body.price) || 0,
    city: req.body.city,
    address: req.body.address || "",
    size: Number(req.body.size) || 0,
    rooms: Number(req.body.rooms) || 0,
    description: req.body.description || "",
    featured: req.body.featured === "true",
    images,
  };
}

// GET /api/listings - osszes ingatlan lekerese (cache-elve)
router.get("/", async (req, res) => {
  try {
    const cached = cacheGet(LIST_CACHE_KEY);
    if (cached) {
      return res.json(cached);
    }

    const listings = await Listing.find().sort({ createdAt: -1 });
    cacheSet(LIST_CACHE_KEY, listings, LIST_CACHE_TTL);
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: "Hiba az ingatlanok lekeresekor." });
  }
});

// GET /api/listings/:id - egy ingatlan lekerese (cache-elve)
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
    res.status(500).json({ message: "Hiba az ingatlan lekeresekor." });
  }
});

// POST /api/listings - uj ingatlan letrehozasa, kepekkel egyutt (admin)
router.post(
  "/",
  requireAuth,
  upload.array("images", MAX_IMAGES),
  handleUploadErrors,
  async (req, res) => {
    let images = [];
    try {
      images = await uploadImages(req.files);
      const listing = await Listing.create(buildListingData(req, images));
      cacheDel(LIST_CACHE_KEY);
      res.status(201).json(listing);
    } catch (err) {
      deleteImages(images);
      res.status(400).json({ message: "Hibas adatok.", error: err.message });
    }
  }
);

// PUT /api/listings/:id - ingatlan modositasa, kepek hozzaadasa/eltavolitasa (admin)
router.put(
  "/:id",
  requireAuth,
  upload.array("images", MAX_IMAGES),
  handleUploadErrors,
  async (req, res) => {
    let newImages = [];
    try {
      const existing = await Listing.findById(req.params.id);
      if (!existing) {
        return res.status(404).json({ message: "Nem talalhato ingatlan." });
      }

      let keptImages = [];
      try {
        keptImages = JSON.parse(req.body.existingImages || "[]");
      } catch {
        keptImages = [];
      }

      newImages = await uploadImages(req.files);
      const images = [...keptImages, ...newImages];

      const removedImages = existing.images.filter((img) => !keptImages.includes(img));

      const listing = await Listing.findByIdAndUpdate(
        req.params.id,
        buildListingData(req, images),
        { new: true, runValidators: true }
      );

      deleteImages(removedImages);
      cacheDel(LIST_CACHE_KEY, itemCacheKey(req.params.id));
      res.json(listing);
    } catch (err) {
      deleteImages(newImages);
      res.status(400).json({ message: "Hibas adatok.", error: err.message });
    }
  }
);

// DELETE /api/listings/:id - ingatlan es kepeinek torlese (admin)
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const listing = await Listing.findByIdAndDelete(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: "Nem talalhato ingatlan." });
    }
    deleteImages(listing.images);
    cacheDel(LIST_CACHE_KEY, itemCacheKey(req.params.id));
    res.json({ message: "Ingatlan torolve." });
  } catch (err) {
    res.status(500).json({ message: "Hiba az ingatlan torlesekor." });
  }
});

export default router;
