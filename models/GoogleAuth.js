import mongoose from "mongoose";

// Egyetlen dokumentum tarolja Szilvia Google Naptar hozzaferesenek
// tokenjeit - egyetlen adminja van az oldalnak, tobb felhasznalos
// tarolasra nincs szukseg.
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
