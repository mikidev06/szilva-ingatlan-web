import { Router } from "express";
import jwt from "jsonwebtoken";
import requireAuth from "../middleware/auth.js";
import {
  isConfigured,
  buildAuthUrl,
  saveTokensFromCode,
  isConnected,
  disconnect,
} from "../config/googleCalendar.js";

const router = Router();

// GET /api/google/auth-url - Google OAuth beleegyezesi link (admin)
router.get("/auth-url", requireAuth, (req, res) => {
  if (!isConfigured()) {
    return res.status(500).json({
      message: "A Google Naptar integracio nincs beallitva (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_REDIRECT_URI hianyzik).",
    });
  }
  // A state egy rovid eletu, alairt token, ami igazolja, hogy a callback-et
  // egy hitelesitett admin munkamenet inditotta - a Google redirect maga nem
  // kuld Authorization fejlecet, ezert nem hasznalhato a sima requireAuth.
  const state = jwt.sign({ purpose: "google-connect" }, process.env.JWT_SECRET, { expiresIn: "10m" });
  res.json({ url: buildAuthUrl(state) });
});

// GET /api/google/callback - Google ide iranyitja vissza a bongeszot
router.get("/callback", async (req, res) => {
  const { code, state, error } = req.query;

  if (error) {
    return res.redirect("/admin?google=error");
  }

  try {
    jwt.verify(state || "", process.env.JWT_SECRET);
  } catch {
    return res.status(401).send("Ervenytelen vagy lejart kapcsolodasi kiserlet.");
  }

  try {
    await saveTokensFromCode(code);
    res.redirect("/admin?google=connected");
  } catch (err) {
    console.error("Google OAuth callback hiba:", err.message);
    res.redirect("/admin?google=error");
  }
});

// GET /api/google/status - kapcsolat allapota (admin)
router.get("/status", requireAuth, async (req, res) => {
  res.json({ configured: isConfigured(), connected: await isConnected() });
});

// DELETE /api/google/disconnect - kapcsolat torlese (admin)
router.delete("/disconnect", requireAuth, async (req, res) => {
  await disconnect();
  res.json({ message: "Google Naptar kapcsolat torolve." });
});

export default router;
