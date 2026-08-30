import { Router } from "express";
import Message from "../models/Message.js";
import { sendNtfyNotification } from "../config/ntfy.js";

const router = Router();

// POST /api/messages - kapcsolatfelveteli uzenet mentese
router.post("/", async (req, res) => {
  try {
    const { name, email, message, phone } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: "Kerlek toltsd ki a kotelezo mezoket." });
    }
    const saved = await Message.create(req.body);

    await sendNtfyNotification({
      title: "Új üzenet érkezett",
      message: `${name}${phone ? ` (${phone})` : ""} – ${email}\n\n${message}`,
      tags: ["envelope"],
      priority: 4,
    });

    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: "Hibas adatok.", error: err.message });
  }
});

export default router;
