import mongoose from "mongoose";

// A single document holds the tokens for Szilvia's Google Calendar access -
// the site has exactly one admin, so per-user storage is not needed.
const googleAuthSchema = new mongoose.Schema(
  {
    refreshToken: { type: String, required: true },
    accessToken: { type: String, default: "" },
    accessTokenExpiresAt: { type: Date, default: null },
    calendarId: { type: String, default: "primary" },
  },
  { timestamps: true }
);

export default mongoose.model("GoogleAuth", googleAuthSchema);
