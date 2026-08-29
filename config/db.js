import mongoose from "mongoose";

export default async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn(
      "Figyelem: nincs beallitva MONGODB_URI a .env fajlban, a szerver adatbazis nelkul indul."
    );
    return;
  }

  try {
    await mongoose.connect(uri);
    console.log("MongoDB Atlas kapcsolat sikeres.");
  } catch (err) {
    console.error("MongoDB kapcsolodasi hiba:", err.message);
    // Vercel-en (szerverless fuggvenyben) a process.exit egy elo, meleg
    // fuggveny-peldanyt is megolne mas kerelmek kozepen - ott a kapcsolodasi
    // hiba egyszeruen naplozodik, es az egyes vegpontok sajat try/catch-e
    // kezeli a hibat.
    if (!process.env.VERCEL) {
      process.exit(1);
    }
  }
}
