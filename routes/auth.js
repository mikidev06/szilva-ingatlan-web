import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import requireAuth from "../middleware/auth.js";

const router = Router();

// POST /api/auth/login - admin login with a password. The password is stored
// as a bcrypt hash in the ADMIN_PASSWORD_HASH environment variable, not as
// plain text, see: hashPassword.mjs.
router.post("/login", async (req, res) => {
  const { password } = req.body;

  if (!process.env.ADMIN_PASSWORD_HASH || !process.env.JWT_SECRET) {
    return res.status(500).json({
      message: "A szerver nincs beállítva admin bejelentkezésre (ADMIN_PASSWORD_HASH / JWT_SECRET hiányzik).",
    });
  }

  const valid = password && (await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH));
  if (!valid) {
    return res.status(401).json({ message: "Hibás jelszó." });
  }

  const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, {
    expiresIn: "8h",
  });

  res.json({ token });
});

// GET /api/auth/verify - check whether a token is still valid
router.get("/verify", requireAuth, (req, res) => {
  res.json({ valid: true });
});

export default router;
