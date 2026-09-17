import mongoose from "mongoose";

export default async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn(
      "Warning: MONGODB_URI is not set in the .env file, the server starts without a database."
    );
    return;
  }

  try {
    await mongoose.connect(uri);
    console.log("MongoDB Atlas connection successful.");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    // On Vercel (in a serverless function) process.exit would kill a live,
    // warm function instance in the middle of other requests - there the
    // connection error is simply logged, and each endpoint's own try/catch
    // handles the failure.
    if (!process.env.VERCEL) {
      process.exit(1);
    }
  }
}
