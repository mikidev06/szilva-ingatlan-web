import { Router } from "express";
import rateLimit from "express-rate-limit";
import Appointment from "../models/Appointment.js";
import requireAuth from "../middleware/auth.js";
import {
  BUSINESS_HOUR_SLOTS,
  isValidSlot,
  isBusinessDay,
  budapestISO,
  slotOverlapsBusy,
} from "../config/businessHours.js";
import { sendNtfyNotification } from "../config/ntfy.js";
import { getBusyIntervals, createCalendarEvent } from "../config/googleCalendar.js";

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
    const bookedTimes = new Set(booked.map((b) => b.time));

    // A sajat foglalasok mellett Szilvia Google Naptaraban is megnezzuk,
    // van-e mar elfoglalt idopontja aznapra - ha a Google lekerdezes
    // barmiert sikertelen (nincs osszekapcsolva, lejart token, stb.), a
    // foglalas rendszer akkor is a sajat adatbazisunkkal mukodik tovabb.
    let busyIntervals = [];
    try {
      busyIntervals = await getBusyIntervals(budapestISO(date, 9), budapestISO(date, 18));
    } catch (err) {
      console.error("Google Naptar freeBusy hiba:", err.message);
    }

    for (const hour of BUSINESS_HOUR_SLOTS) {
      const time = `${String(hour).padStart(2, "0")}:00`;
      if (!bookedTimes.has(time) && slotOverlapsBusy(date, hour, busyIntervals)) {
        bookedTimes.add(time);
      }
    }

    res.json({
      slots: BUSINESS_HOUR_SLOTS.map((h) => `${String(h).padStart(2, "0")}:00`),
      booked: [...bookedTimes],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Hiba az idopontok lekeresekor." });
  }
});

// GET /api/appointments/full-days?year=YYYY&month=MM - adott honapban
// teljesen betelt (minden orai slot foglalt) napok, sajat foglalasok es a
// Google Naptar egyuttes figyelembevetelevel (nyilvanos)
router.get("/full-days", async (req, res) => {
  try {
    const year = Number(req.query.year);
    const month = Number(req.query.month);
    if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
      return res.status(400).json({ message: "Ervenytelen ev/honap." });
    }

    const pad = (n) => String(n).padStart(2, "0");
    const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const start = `${year}-${pad(month)}-01`;
    const end = `${year}-${pad(month)}-${pad(lastDay)}`;

    const appointments = await Appointment.find({ date: { $gte: start, $lte: end } }).select("date time -_id");
    const bookedByDate = {};
    for (const a of appointments) {
      (bookedByDate[a.date] ||= new Set()).add(a.time);
    }

    let busyIntervals = [];
    try {
      busyIntervals = await getBusyIntervals(budapestISO(start, 0), budapestISO(end, 24));
    } catch (err) {
      console.error("Google Naptar freeBusy hiba:", err.message);
    }

    const fullDays = [];
    for (let d = 1; d <= lastDay; d++) {
      const dateStr = `${year}-${pad(month)}-${pad(d)}`;
      if (!isBusinessDay(dateStr)) continue;
      const bookedTimes = bookedByDate[dateStr] || new Set();
      const isFull = BUSINESS_HOUR_SLOTS.every(
        (hour) => bookedTimes.has(`${pad(hour)}:00`) || slotOverlapsBusy(dateStr, hour, busyIntervals)
      );
      if (isFull) fullDays.push(dateStr);
    }

    res.json({ fullDays });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Hiba a foglaltsag lekeresekor." });
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

    const hour = Number(time.slice(0, 2));
    try {
      const busyIntervals = await getBusyIntervals(budapestISO(date, hour), budapestISO(date, hour + 1));
      if (slotOverlapsBusy(date, hour, busyIntervals)) {
        return res.status(409).json({ message: "Ez az idopont mar foglalt, valassz masikat." });
      }
    } catch (err) {
      console.error("Google Naptar freeBusy hiba foglalaskor:", err.message);
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

    await sendNtfyNotification({
      title: "Új időpontfoglalás",
      message: `${serviceType} – ${date} ${time}\n${name}${phone ? ` (${phone})` : ""} – ${email}${notes ? `\n\n${notes}` : ""}`,
      tags: ["spiral_calendar_pad"],
      priority: 4,
    });

    try {
      await createCalendarEvent({
        summary: `${serviceType} – ${name}`,
        description: `${email}${phone ? `\n${phone}` : ""}${notes ? `\n\n${notes}` : ""}`,
        startISO: budapestISO(date, hour),
        endISO: budapestISO(date, hour + 1),
      });
    } catch (err) {
      console.error("Google Naptar esemeny letrehozasa sikertelen:", err.message);
    }

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
