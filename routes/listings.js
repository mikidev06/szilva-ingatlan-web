import { Router } from "express";
import jwt from "jsonwebtoken";
import { handleUpload } from "@vercel/blob/client";
import Listing from "../models/Listing.js";
import requireAuth from "../middleware/auth.js";
import { cacheGet, cacheSet, cacheDel } from "../config/cache.js";
import { deleteImages } from "../config/blob.js";

const router = Router();

const LIST_CACHE_KEY = "listings:all";
const LIST_CACHE_TTL = 60;
const ITEM_CACHE_TTL = 300;
const itemCacheKey = (id) => `listings:${id}`;

function buildListingData(body) {
  return {
    title: body.title,
    type: body.type,
    category: body.category,
    price: Number(body.price) || 0,
    city: body.city,
    address: body.address || "",
    size: Number(body.size) || 0,
    rooms: Number(body.rooms) || 0,
    description: body.description || "",
    featured: Boolean(body.featured),
    images: Array.isArray(body.images) ? body.images : [],
  };
}

// POST /api/listings/blob-upload - kepfeltoltesi token generalasa a bongeszo
// szamara, hogy a fenykepek kozvetlenul a Vercel Blob-ba toltodjenek fel
// (megkerulve a szerverless fuggvenyek 4.5 MB-os kerestest-meret korlatjat).
// Az admin JWT-t a clientPayload-ban kapja, mert ezt a vegpontot a Vercel
// Blob sajat "feltoltes kesz" callback-je is meghivja, ami nem hordozza a mi
// Authorization fejlecunket.
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
        // Nincs szukseg extra logikara: a kliens a feltoltes vegen kapott
        // URL-t maga menti el az ingatlanhoz a szokasos POST/PUT keresen at.
      },
    });

    res.json(jsonResponse);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

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
    console.error(err);
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
    console.error(err);
    res.status(500).json({ message: "Hiba az ingatlan lekeresekor." });
  }
});

// POST /api/listings - uj ingatlan letrehozasa (admin). A kepek mar korabban
// feltoltodtek a Vercel Blob-ba, itt csak a vegleges URL-eket kapjuk meg.
router.post("/", requireAuth, async (req, res) => {
  try {
    const listing = await Listing.create(buildListingData(req.body));
    cacheDel(LIST_CACHE_KEY);
    res.status(201).json(listing);
  } catch (err) {
    res.status(400).json({ message: "Hibas adatok.", error: err.message });
  }
});

// PUT /api/listings/:id - ingatlan modositasa (admin). A torolt kepeket a
// regi es az uj images lista kulonbsegebol allapitjuk meg, es toroljuk a
// Blob-bol.
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const existing = await Listing.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: "Nem talalhato ingatlan." });
    }

    const data = buildListingData(req.body);
    const removedImages = existing.images.filter((img) => !data.images.includes(img));

    const listing = await Listing.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });

    await deleteImages(removedImages);
    cacheDel(LIST_CACHE_KEY, itemCacheKey(req.params.id));
    res.json(listing);
  } catch (err) {
    res.status(400).json({ message: "Hibas adatok.", error: err.message });
  }
});

// DELETE /api/listings/:id - ingatlan es kepeinek torlese (admin)
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const listing = await Listing.findByIdAndDelete(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: "Nem talalhato ingatlan." });
    }
    await deleteImages(listing.images);
    cacheDel(LIST_CACHE_KEY, itemCacheKey(req.params.id));
    res.json({ message: "Ingatlan torolve." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Hiba az ingatlan torlesekor." });
  }
});

export default router;
