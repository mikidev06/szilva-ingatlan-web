# Szilágyi Szilvia – Real estate website

The website of real estate agent Szilágyi Szilvia, built on the MERN stack (MongoDB Atlas, Express, React, Node.js).

## Project structure

```
/                   -> Express server (server.js), MongoDB models and routes
/api                -> Vercel serverless entry point (exports the Express app from server.js)
/client             -> React (Vite) frontend
vercel.json         -> Vercel build/routing configuration
```

## Setup

1. Create a MongoDB Atlas cluster and copy the connection string.
2. Copy the `.env.example` file to `.env` and fill in your own `MONGODB_URI`, `ADMIN_PASSWORD_HASH` and `JWT_SECRET` values:

   ```
   cp .env.example .env
   ```

   `ADMIN_PASSWORD_HASH` is the bcrypt hash of the login password for the `/admin` page (not the plain password!) - generate it with `npm run hash-password -- <your-password>` and copy the result in as the value of `ADMIN_PASSWORD_HASH`. `JWT_SECRET` should be an arbitrary, long, random string.

3. Install the backend dependencies in the root, then the frontend dependencies in the `client` folder:

   ```
   npm install
   npm install --prefix client
   ```

4. (Optional, for local development only) Populate the database with sample properties:

   ```
   npm run seed
   ```

   ⚠️ This deletes every existing property in the database that `MONGODB_URI` points at. **Never** run it against the production database - add the real properties through the `/admin` UI.

5. Start the server and the client together in development mode:

   ```
   npm run dev
   ```

   The frontend runs at `http://localhost:5173`, the backend at `http://localhost:5000`. The Vite dev server proxies the `/api` requests to the backend.

## Admin UI

On the `/admin` page (e.g. `http://localhost:5173/admin`) you can log in with the password matching the `ADMIN_PASSWORD_HASH` set in the `.env` file. After logging in, properties can be listed, created, edited and deleted. Logging in returns a JWT token, which the browser stores in `localStorage` for 8 hours.

Several photos can be uploaded to a property directly from your machine. The images are stored in [Vercel Blob](https://vercel.com/docs/vercel-blob), **straight from the browser** - not through the server. The reason is that Vercel serverless functions have a hard 4.5 MB request size limit (on every plan, and it is not configurable), which even one or two phone photos would comfortably exceed. The browser uploads the files with the `upload()` function of [`@vercel/blob/client`](https://vercel.com/docs/vercel-blob/client-upload), and the `POST /api/listings/blob-upload` endpoint ([routes/listings.js](routes/listings.js)) only issues a short-lived upload token for it (after verifying the admin JWT). This requires the `BLOB_READ_WRITE_TOKEN` value to be set in the `.env` file - see the "Deploying to Vercel" section.

Before uploading, the browser automatically resizes every image (max. 1920 px on the longer side, keeping the aspect ratio) and recompresses it as JPEG ([client/src/imageCompression.js](client/src/imageCompression.js)). This yields uniformly small, fast-loading photos even from the often multi-megabyte originals taken on a phone, without distortion or cropping.

## Push notifications (ntfy.sh)

When someone sends a contact message or books an appointment, the server sends a push notification to [ntfy.sh](https://ntfy.sh) ([config/ntfy.js](config/ntfy.js)), so that Szilvia is notified on her phone immediately - without an admin login or e-mail.

Setup:

1. Pick a unique, hard-to-guess topic name (`.env` already contains a generated value: `NTFY_TOPIC`). ntfy.sh topics are public by default - anyone who knows the name can subscribe to it - so it is important that it is not easy to guess.
2. Download the [ntfy app](https://ntfy.sh/#apps) (iOS/Android), or open `https://ntfy.sh/<your-topic-name>` in a browser.
3. Subscribe to the same topic name that is set as the `.env`/Vercel `NTFY_TOPIC` value.

If `NTFY_TOPIC` is not set, the notification is simply skipped - saving the message/booking works regardless.

## Google Calendar synchronization

The appointment booking system can optionally synchronize in both directions with Szilvia's Google Calendar ([config/googleCalendar.js](config/googleCalendar.js)):

- **Outbound:** every booking made on the website is automatically added to her Google Calendar as an event.
- **Inbound:** the booking page (calendar view + time slot picker) also takes into account the slots that are busy in her Google Calendar for any reason - not just the bookings that arrived through the website - and displays those as full/taken slots too.

If it is not configured or not connected, the system keeps working unchanged, using only its own database - this never blocks a booking.

### Setup (Google Cloud Console)

1. Create a project in the [Google Cloud Console](https://console.cloud.google.com/) (or use an existing one).
2. **APIs & Services → Library**: find and enable the **Google Calendar API**.
3. **APIs & Services → OAuth consent screen**: choose the **External** type. Since only Szilvia's own account will connect, Google verification is not required - add the e-mail address of her Google account to the **Test users** list, and it will work even in "Testing" state.
4. **APIs & Services → Credentials → Create Credentials → OAuth client ID**:
   - Application type: **Web application**
   - Authorized redirect URIs: add exactly this: `https://szilva-ingatlan-web.vercel.app/api/google/callback`
   - After creating it, copy the **Client ID** and the **Client secret**.
5. Set the following variables on the Vercel project (Settings → Environment Variables, or `vercel env add`):
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REDIRECT_URI` = `https://szilva-ingatlan-web.vercel.app/api/google/callback`
6. After deploying, log in to the `/admin` UI, open the **Időpontfoglalások** (Appointments) tab, and click the **Összekapcsolás** (Connect) button in the "Google Naptár" box - this redirects to Google's consent screen. After accepting, the system redirects back automatically, and synchronization is active from then on.

The connection can be severed at any time with the **Leválasztás** (Disconnect) button in the same place.

## Cache

The `GET /api/listings` and `GET /api/listings/:id` endpoints store their responses in a simple in-process (in-memory) TTL cache (for 60 and 300 seconds respectively), and on create/update/delete the server automatically invalidates the affected entries. See [config/cache.js](config/cache.js).

This requires **no separate service** (such as Redis) - the cache runs in memory inside the Node process, and works with no installation or configuration. On a traditional, continuously running server this works well. Running as a Vercel serverless function, however, every cold start begins with an empty cache, and several instances may run independently at the same time - there the cache is more of an occasional bonus than a reliable cache, but it causes no errors: in the worst case every request simply reaches MongoDB.

## Deploying to Vercel

The project is configured for Vercel ([vercel.json](vercel.json)): the React client runs as a static build, and the backend as a single serverless function ([api/index.js](api/index.js), which exports the Express `app` from [server.js](server.js)).

1. Connect the GitHub repository to a Vercel project (`vercel link`, or "Import Project" on the Vercel dashboard).
2. Create a Blob store for the project and set the `BLOB_READ_WRITE_TOKEN` environment variable (this is needed for the photo upload):

   ```
   vercel blob create-store szilvia-ingatlan-images --access public
   ```

3. Set the project's environment variables on the Vercel dashboard (Settings → Environment Variables), or with the CLI: `MONGODB_URI`, `ADMIN_PASSWORD_HASH` (the hash generated with `npm run hash-password -- <password>`, not the plain password), `JWT_SECRET`, `NTFY_TOPIC`, and optionally `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_REDIRECT_URI` (see the "Google Calendar synchronization" section) (the previous step sets `BLOB_READ_WRITE_TOKEN` automatically). `NODE_ENV` and `VERCEL` are set automatically on Vercel, you do not need to provide those.
4. Pull the variables down for local development if needed: `vercel env pull .env`.
5. Every Git push to the main branch redeploys automatically.

## Other (non-Vercel) hosting

The server can also be operated as a traditional, continuously running Node process (on a VPS, Render, Railway, and so on) - in that case, however, the code still uses Vercel Blob for image uploads, so `BLOB_READ_WRITE_TOKEN` has to be set there as well.

```
npm run build
NODE_ENV=production npm start
```

`build` installs and builds the React application into the `client/dist` folder. If that folder exists, the server also serves it automatically when `NODE_ENV=production` (static files + a fallback for the client-side routes), so the backend and the frontend run as a single service on one port - separate frontend hosting is not needed.

In production mode the server checks at startup whether the required environment variables (`MONGODB_URI`, `ADMIN_PASSWORD_HASH`, `JWT_SECRET`) are set, and exits if any of them is missing.

Further production settings in `.env`:

- `NODE_ENV=production` - enables the checks above, the static serving, and the correct handling of the client IP address behind a proxy (a load balancer, for instance).
- `CLIENT_ORIGIN` - if the frontend runs on a separate domain/hosting from the backend, give the exact URL here (e.g. `https://szilagyiszilvia.hu`), so that CORS only allows requests from there. If you use the combined mode above, it does not need to be set.

Beyond that, the server includes:

- security HTTP headers ([helmet](https://www.npmjs.com/package/helmet)),
- compression (gzip),
- rate limiting on the login (`/api/auth`) and on the contact form (`/api/messages`) to guard against abuse,
- a unified error handling middleware, which does not leak technical details in the responses in production mode.

## API endpoints

- `GET /api/listings` - every property and project; `?kind=ingatlan` or `?kind=projekt` to narrow it down
- `GET /api/listings/:id` - a single property or project
- `POST /api/listings` - create a new property/project (admin, `Authorization: Bearer <token>`, the `kind` field decides which)
- `PUT /api/listings/:id` - update a property/project (admin)
- `DELETE /api/listings/:id` - delete a property/project (admin)
- `POST /api/messages` - store a contact message
- `GET /api/messages` - list all messages (admin)
- `DELETE /api/messages/:id` - delete a message (admin)
- `GET /api/appointments/availability?date=YYYY-MM-DD` - the booked/free slots for one day (based on the own database + the connected Google Calendar)
- `GET /api/appointments/full-days?year=YYYY&month=MM` - the completely full days in the given month
- `POST /api/appointments` - create an appointment booking
- `GET /api/appointments` - list all bookings (admin)
- `DELETE /api/appointments/:id` - cancel a booking (admin)
- `GET /api/google/auth-url` - Google OAuth consent link (admin)
- `GET /api/google/callback` - Google OAuth callback (called by Google, not for direct use)
- `GET /api/google/status` - the status of the Google Calendar connection (admin)
- `DELETE /api/google/disconnect` - remove the Google Calendar connection (admin)
- `POST /api/auth/login` - admin login with a password, returns a JWT token
- `GET /api/auth/verify` - check whether a token is valid
- `GET /api/health` - health check
