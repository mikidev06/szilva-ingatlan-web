import { Router } from "express";
import rateLimit from "express-rate-limit";
import Appointment from "../models/Appointment.js";
import requireAuth from "../middleware/auth.js";
import { BUSINESS_HOUR_SLOTS, isValidSlot } from "../config/businessHours.js";

const router = Router();

const bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Tul sok foglalasi probalkozas, kerjuk probald ujra kesobb." },
});

// GET /api/appointments/availability?date=YYYY-MM-DD - foglalt idopontok egy
// napra (nyilvanos, csak az idopontokat adja vissza, szemelyes adatot nem)
router.get("/availability", async (req, res) => {
  try {
    const { date } = req.query;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date || "")) {
      return res.status(400).json({ message: "Ervenytelen datum." });
    }

    const booked = await Appointment.find({ date }).select("time -_id");
    res.json({
      slots: BUSINESS_HOUR_SLOTS.map((h) => `${String(h).padStart(2, "0")}:00`),
      booked: booked.map((b) => b.time),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Hiba az idopontok lekeresekor." });
  }
});

// POST /api/appointments - uj idopontfoglalas (nyilvanos)
router.post("/", bookingLimiter, async (req, res) => {
  try {
    const { name, email, phone, serviceType, date, time, notes } = req.body;

    if (!isValidSlot(date, time)) {
      return res.status(400).json({ message: "Ez az idopont nem foglalhato." });
    }

    const existing = await Appointment.findOne({ date, time });
    if (existing) {
      return res.status(409).json({ message: "Ez az idopont mar foglalt, valassz masikat." });
    }

    const appointment = await Appointment.create({
      name,
      email,
      phone,
      serviceType,
      date,
      time,
      notes,
    });

    res.status(201).json(appointment);
  } catch (err) {
    res.status(400).json({ message: "Hibas adatok.", error: err.message });
  }
});

// GET /api/appointments - osszes foglalas (admin)
router.get("/", requireAuth, async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ date: 1, time: 1 });
    res.json(appointments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Hiba a foglalasok lekeresekor." });
  }
});

// DELETE /api/appointments/:id - foglalas lemondasa (admin)
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Nem talalhato foglalas." });
    }
    res.json({ message: "Foglalas torolve." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Hiba a foglalas torlesekor." });
  }
});

export default router;
