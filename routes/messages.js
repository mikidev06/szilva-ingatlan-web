import { Router } from "express";
import Message from "../models/Message.js";

const router = Router();

// POST /api/messages - kapcsolatfelveteli uzenet mentese
router.post("/", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: "Kerlek toltsd ki a kotelezo mezoket." });
    }
    const saved = await Message.create(req.body);
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: "Hibas adatok.", error: err.message });
  }
});

export default router;
