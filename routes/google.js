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

// GET /api/google/auth-url - Google OAuth consent link (admin)
router.get("/auth-url", requireAuth, (req, res) => {
  if (!isConfigured()) {
    return res.status(500).json({
      message: "A Google Naptar integracio nincs beallitva (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_REDIRECT_URI hianyzik).",
    });
  }
  // The state is a short-lived, signed token proving that the callback was
  // started by an authenticated admin session - the Google redirect itself
  // sends no Authorization header, so plain requireAuth cannot be used.
  const state = jwt.sign({ purpose: "google-connect" }, process.env.JWT_SECRET, { expiresIn: "10m" });
  res.json({ url: buildAuthUrl(state) });
});

// GET /api/google/callback - Google redirects the browser back here
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
    console.error("Google OAuth callback error:", err.message);
    res.redirect("/admin?google=error");
  }
});

// GET /api/google/status - connection status (admin)
router.get("/status", requireAuth, async (req, res) => {
  res.json({ configured: isConfigured(), connected: await isConnected() });
});

// DELETE /api/google/disconnect - remove the connection (admin)
router.delete("/disconnect", requireAuth, async (req, res) => {
  await disconnect();
  res.json({ message: "Google Naptar kapcsolat torolve." });
});

export default router;
