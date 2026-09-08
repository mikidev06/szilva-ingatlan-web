import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import { connectCache } from "./config/cache.js";
import listingsRouter from "./routes/listings.js";
import messagesRouter from "./routes/messages.js";
import authRouter from "./routes/auth.js";
import appointmentsRouter from "./routes/appointments.js";
import googleRouter from "./routes/google.js";
import sitemapRouter from "./routes/sitemap.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === "production";

const requiredEnvVars = ["MONGODB_URI", "ADMIN_PASSWORD_HASH", "JWT_SECRET"];
const missingEnvVars = requiredEnvVars.filter((name) => !process.env[name]);

if (isProduction && missingEnvVars.length > 0) {
  console.error(
    `Hianyzo kotelezo kornyezeti valtozok production modban: ${missingEnvVars.join(", ")}`
  );
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

if (isProduction) {
  app.set("trust proxy", 1);
}

connectDB();
connectCache();

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        fontSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://*.public.blob.vercel-storage.com", "https://blob.vercel-storage.com"],
        frameSrc: ["https://www.openstreetmap.org"],
      },
    },
  })
);
app.use(compression());

const allowedOrigin = process.env.CLIENT_ORIGIN;
if (isProduction && !allowedOrigin) {
  console.warn(
    "Figyelem: nincs beallitva CLIENT_ORIGIN production modban, a CORS minden origint enged."
  );
}
app.use(cors(allowedOrigin ? { origin: allowedOrigin } : {}));

app.use(express.json());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Tul sok probalkozas, kerjuk probald ujra kesobb." },
});

app.use("/api/auth", authLimiter, authRouter);
app.use("/api/listings", listingsRouter);
app.use("/api/messages", messagesRouter);
app.use("/api/appointments", appointmentsRouter);
app.use("/api/google", googleRouter);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", (req, res) => {
  res.status(404).json({ message: "Nem talalhato vegpont." });
});

app.use(sitemapRouter);

const clientDistPath = path.join(__dirname, "client", "dist");
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.use((req, res) => {
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    message: "Szerverhiba tortent.",
    ...(isProduction ? {} : { error: err.message }),
  });
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Szerver fut a http://localhost:${PORT} cimen`);
  });
}

export default app;
