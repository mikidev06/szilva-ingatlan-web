import { Router } from "express";
import jwt from "jsonwebtoken";
import requireAuth from "../middleware/auth.js";

const router = Router();

// POST /api/auth/login - admin bejelentkezes jelszoval
router.post("/login", (req, res) => {
  const { password } = req.body;

  if (!process.env.ADMIN_PASSWORD || !process.env.JWT_SECRET) {
    return res.status(500).json({
      message: "A szerver nincs beállítva admin bejelentkezésre (ADMIN_PASSWORD / JWT_SECRET hiányzik).",
    });
  }

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ message: "Hibás jelszó." });
  }

  const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, {
    expiresIn: "8h",
  });

  res.json({ token });
});

// GET /api/auth/verify - token ervenyesseg ellenorzese
router.get("/verify", requireAuth, (req, res) => {
  res.json({ valid: true });
});

export default router;
