import { Router } from "express";
import Listing from "../models/Listing.js";

const router = Router();
const SITE_URL = "https://szilvaingatlan.com";

const STATIC_PATHS = [
  { path: "/", priority: "1.0" },
  { path: "/ingatlanok", priority: "0.9" },
  { path: "/projektek", priority: "0.9" },
  { path: "/rolam", priority: "0.6" },
  { path: "/kapcsolat", priority: "0.6" },
  { path: "/idopontfoglalas", priority: "0.6" },
  { path: "/adatvedelem", priority: "0.3" },
];

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function urlEntry(loc, lastmod, priority) {
  return `  <url>
    <loc>${escapeXml(loc)}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>\n    ` : ""}<priority>${priority}</priority>
  </url>`;
}

// GET /sitemap.xml - the static pages and the URLs of every property/project
router.get("/sitemap.xml", async (req, res) => {
  try {
    const listings = await Listing.find().select("_id kind updatedAt");

    const staticEntries = STATIC_PATHS.map((p) => urlEntry(`${SITE_URL}${p.path}`, null, p.priority));

    const listingEntries = listings.map((l) => {
      const base = l.kind === "projekt" ? "projektek" : "ingatlanok";
      const lastmod = l.updatedAt ? l.updatedAt.toISOString().slice(0, 10) : null;
      return urlEntry(`${SITE_URL}/${base}/${l._id}`, lastmod, "0.7");
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticEntries, ...listingEntries].join("\n")}
</urlset>`;

    res.type("application/xml").send(xml);
  } catch (err) {
    console.error("Sitemap generation error:", err);
    res.status(500).type("text/plain").send("Sitemap generalasi hiba.");
  }
});

export default router;
