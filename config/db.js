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
    process.exit(1);
  }
}
