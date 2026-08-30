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
    // "ingatlan" eseten a size az egyetlen alapterulet; "projekt" eseten a
    // size a sizeMin-nel egyezik meg (osszefoglalo ertekkent), a tenyleges
    // alapterulet-sav megjelenitese a sizeMin/sizeMax parosbol tortenik.
    size: { type: Number, default: 0, min: 0 },
    sizeMin: { type: Number, default: 0, min: 0 },
    sizeMax: { type: Number, default: 0, min: 0 },
    // "ingatlan" eseten a rooms az egyetlen szobaszam; "projekt" eseten a
    // rooms a roomsMin-nel egyezik meg (osszefoglalo ertekkent), a tenyleges
    // szobaszam-sav megjelenitese a roomsMin/roomsMax parosbol tortenik.
    rooms: { type: Number, default: 0, min: 0 },
    roomsMin: { type: Number, default: 0, min: 0 },
    roomsMax: { type: Number, default: 0, min: 0 },
    // Csak "projekt" eseten hasznalt: hany lakas erheto meg jelenleg.
    availableUnits: { type: Number, default: 0, min: 0 },
    description: { type: String, default: "" },
    images: { type: [String], default: [] },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Listing", listingSchema);
