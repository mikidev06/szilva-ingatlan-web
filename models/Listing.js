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
    // For "ingatlan" the price is the single price; for "projekt" the price
    // equals priceMin (as a summary/sorting value), while the actual price
    // range is rendered from the priceMin/priceMax pair.
    price: { type: Number, required: true, min: 0 },
    priceMin: { type: Number, default: 0, min: 0 },
    priceMax: { type: Number, default: 0, min: 0 },
    city: { type: String, required: true, trim: true, maxlength: 100 },
    address: { type: String, default: "", trim: true, maxlength: 200 },
    // For "ingatlan" the size is the single floor area; for "projekt" the
    // size equals sizeMin (as a summary value), while the actual floor-area
    // range is rendered from the sizeMin/sizeMax pair.
    size: { type: Number, default: 0, min: 0 },
    sizeMin: { type: Number, default: 0, min: 0 },
    sizeMax: { type: Number, default: 0, min: 0 },
    // For "ingatlan" the rooms is the single room count; for "projekt" the
    // rooms equals roomsMin (as a summary value), while the actual room-count
    // range is rendered from the roomsMin/roomsMax pair.
    rooms: { type: Number, default: 0, min: 0 },
    roomsMin: { type: Number, default: 0, min: 0 },
    roomsMax: { type: Number, default: 0, min: 0 },
    // Used only for "projekt": how many apartments are currently available.
    availableUnits: { type: Number, default: 0, min: 0 },
    // Used only for "projekt": the details of each available apartment
    // (price, floor area, own photos). If there is at least one item, the
    // priceMin/priceMax and sizeMin/sizeMax values are computed from it - see
    // routes/listings.js buildListingData().
    units: {
      type: [
        {
          price: { type: Number, default: 0, min: 0 },
          size: { type: Number, default: 0, min: 0 },
          images: { type: [String], default: [] },
        },
      ],
      default: [],
    },
    description: { type: String, default: "" },
    images: { type: [String], default: [] },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Listing", listingSchema);
