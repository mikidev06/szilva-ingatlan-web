import { Router } from "express";
import rateLimit from "express-rate-limit";
import Message from "../models/Message.js";
import { sendNtfyNotification } from "../config/ntfy.js";
import requireAuth from "../middleware/auth.js";

const router = Router();

const messagesLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Tul sok uzenet, kerjuk probald ujra kesobb." },
});

// POST /api/messages - kapcsolatfelveteli uzenet mentese (nyilvanos)
router.post("/", messagesLimiter, async (req, res) => {
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

// GET /api/messages - osszes uzenet listazasa (admin)
router.get("/", requireAuth, async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Hiba az uzenetek lekeresekor." });
  }
});

// DELETE /api/messages/:id - uzenet torlese (admin)
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    if (!message) {
      return res.status(404).json({ message: "Nem talalhato uzenet." });
    }
    res.json({ message: "Uzenet torolve." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Hiba az uzenet torlesekor." });
  }
});

export default router;
