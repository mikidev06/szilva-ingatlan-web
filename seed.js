import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import Listing from "./models/Listing.js";

dotenv.config();

// Sample data for local development / demos. DO NOT run it against the
// production database, as it deletes the existing properties and replaces them
// with these sample listings.
const sampleListings = [
  {
    title: "Napfényes családi ház a Rózsadombon",
    category: "Ház",
    price: 89000000,
    city: "Budapest",
    address: "Minta utca 12.",
    size: 180,
    rooms: 5,
    description:
      "Csendes, zöldövezeti környék, felújított állapot, nagy kerttel.",
    images: [
      "https://placehold.co/900x600?text=Csal%C3%A1di+H%C3%A1z+1",
      "https://placehold.co/900x600?text=Csal%C3%A1di+H%C3%A1z+2",
      "https://placehold.co/900x600?text=Csal%C3%A1di+H%C3%A1z+3",
    ],
    featured: true,
  },
  {
    title: "Modern lakás a belvárosban",
    category: "Lakás",
    price: 62000000,
    city: "Debrecen",
    address: "Minta tér 4.",
    size: 68,
    rooms: 3,
    description:
      "Újépítésű, energiatakarékos lakás, erkéllyel és teremgarázs-beállóval.",
    images: [
      "https://placehold.co/900x600?text=Modern+Lak%C3%A1s+1",
      "https://placehold.co/900x600?text=Modern+Lak%C3%A1s+2",
    ],
    featured: true,
  },
  {
    title: "Kertes családi ház Szegeden",
    category: "Ház",
    price: 42000000,
    city: "Szeged",
    address: "Minta köz 8.",
    size: 120,
    rooms: 4,
    description: "Bútorozott családi ház, garázzsal és tárolóval.",
    images: ["https://placehold.co/900x600?text=Csal%C3%A1di+H%C3%A1z"],
    featured: false,
  },
  {
    title: "Építési telek panorámás kilátással",
    category: "Telek",
    price: 24000000,
    city: "Balatonfüred",
    address: "Minta dűlő 1.",
    size: 850,
    rooms: 0,
    description:
      "Közművesített telek, csendes környezetben, tóra néző panorámával.",
    images: [
      "https://placehold.co/900x600?text=Telek+1",
      "https://placehold.co/900x600?text=Telek+2",
    ],
    featured: false,
  },
  {
    title: "Belvárosi irodahelyiség",
    category: "Iroda",
    price: 68000000,
    city: "Budapest",
    address: "Minta körút 22.",
    size: 95,
    rooms: 3,
    description:
      "Modern irodahelyiség, jó megközelíthetőséggel és parkolási lehetőséggel.",
    images: [
      "https://placehold.co/900x600?text=Iroda+1",
      "https://placehold.co/900x600?text=Iroda+2",
      "https://placehold.co/900x600?text=Iroda+3",
    ],
    featured: true,
  },
  {
    title: "Nyaraló a Balaton partján",
    category: "Nyaraló",
    price: 55000000,
    city: "Siófok",
    address: "Minta part 3.",
    size: 75,
    rooms: 3,
    description: "Vízparti nyaraló, saját stéggel, felújított állapotban.",
    images: [
      "https://placehold.co/900x600?text=Nyaral%C3%B3+1",
      "https://placehold.co/900x600?text=Nyaral%C3%B3+2",
    ],
    featured: false,
  },
];

async function seed() {
  if (process.env.NODE_ENV === "production") {
    console.error(
      "The seed script cannot be run in a production environment, because it deletes every existing property."
    );
    process.exit(1);
  }

  await connectDB();

  if (mongoose.connection.readyState !== 1) {
    console.error("No database connection, the upload was aborted.");
    process.exit(1);
  }

  await Listing.deleteMany({});
  await Listing.insertMany(sampleListings);

  console.log(`${sampleListings.length} sample properties inserted.`);
  await mongoose.disconnect();
  process.exit(0);
}

seed();
