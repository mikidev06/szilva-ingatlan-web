import mongoose from "mongoose";

const listingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    kind: {
      type: String,
      enum: ["ingatlan", "projekt"],
      default: "ingatlan",
    },
    category: {
      type: String,
      enum: ["Lakás", "Ház", "Telek", "Iroda", "Nyaraló"],
      default: "Lakás",
    },
    // "ingatlan" eseten a price az egyetlen ar; "projekt" eseten a price a
    // priceMin-nel egyezik meg (osszefoglalo/rendezesi ertekkent), a tenyleges
    // ar-sav megjelenitese a priceMin/priceMax parosbol tortenik.
    price: { type: Number, required: true, min: 0 },
    priceMin: { type: Number, default: 0, min: 0 },
    priceMax: { type: Number, default: 0, min: 0 },
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
