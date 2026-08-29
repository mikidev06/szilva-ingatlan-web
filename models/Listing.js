import mongoose from "mongoose";

const listingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    type: {
      type: String,
      enum: ["Eladó", "Kiadó"],
      default: "Eladó",
    },
    category: {
      type: String,
      enum: ["Lakás", "Ház", "Telek", "Iroda", "Nyaraló"],
      default: "Lakás",
    },
    price: { type: Number, required: true, min: 0 },
    city: { type: String, required: true, trim: true, maxlength: 100 },
    address: { type: String, default: "", trim: true, maxlength: 200 },
    size: { type: Number, default: 0, min: 0 },
    rooms: { type: Number, default: 0, min: 0 },
    description: { type: String, default: "" },
    images: { type: [String], default: [] },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Listing", listingSchema);
