import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 150 },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 200,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Ervenytelen e-mail cim."],
    },
    phone: { type: String, default: "", trim: true, maxlength: 40 },
    serviceType: {
      type: String,
      enum: ["Személyes találkozó", "Hitelügyintézés"],
      required: true,
    },
    // Helyi (magyar) naptari datum es ido, kulon sztringkent tarolva, hogy
    // elkerulje az idozona-atszamitasi hibakat a szerver es a bongeszo kozott.
    date: {
      type: String,
      required: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, "Ervenytelen datum."],
    },
    time: {
      type: String,
      required: true,
      match: [/^\d{2}:\d{2}$/, "Ervenytelen idopont."],
    },
    notes: { type: String, default: "", trim: true, maxlength: 1000 },
  },
  { timestamps: true }
);

appointmentSchema.index({ date: 1, time: 1 });

export default mongoose.model("Appointment", appointmentSchema);
