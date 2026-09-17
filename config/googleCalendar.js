import GoogleAuth from "../models/GoogleAuth.js";

const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const CALENDAR_API = "https://www.googleapis.com/calendar/v3";
const SCOPE = "https://www.googleapis.com/auth/calendar";

function isConfigured() {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REDIRECT_URI
  );
}

// Google only returns a refresh_token on the first consent, so we always use
// prompt=consent to make sure we get one on reconnect as well (otherwise we
// would overwrite the old token with an empty value).
function buildAuthUrl(state) {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    response_type: "code",
    access_type: "offline",
    prompt: "consent",
    scope: SCOPE,
    state,
  });
  return `${AUTH_URL}?${params.toString()}`;
}

async function exchangeCodeForTokens(code) {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: "authorization_code",
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error_description || data.error || "Google token csere sikertelen.");
  }
  return data; // { access_token, refresh_token, expires_in, ... }
}

async function refreshAccessToken(refreshToken) {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      grant_type: "refresh_token",
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error_description || data.error || "Google token frissites sikertelen.");
  }
  return data; // { access_token, expires_in, ... }
}

async function saveTokensFromCode(code) {
  const tokens = await exchangeCodeForTokens(code);
  if (!tokens.refresh_token) {
    throw new Error(
      "A Google nem adott vissza refresh tokent. Vonjad vissza a hozzaferest a Google fiok " +
        "biztonsagi beallitasainal, majd probald ujra."
    );
  }
  await GoogleAuth.deleteMany({});
  await GoogleAuth.create({
    refreshToken: tokens.refresh_token,
    accessToken: tokens.access_token,
    accessTokenExpiresAt: new Date(Date.now() + tokens.expires_in * 1000),
  });
}

async function getValidAccessToken() {
  if (!isConfigured()) return null;
  const auth = await GoogleAuth.findOne();
  if (!auth) return null;

  const stillValid = auth.accessToken && auth.accessTokenExpiresAt && auth.accessTokenExpiresAt.getTime() - Date.now() > 60_000;
  if (stillValid) return auth.accessToken;

  const refreshed = await refreshAccessToken(auth.refreshToken);
  auth.accessToken = refreshed.access_token;
  auth.accessTokenExpiresAt = new Date(Date.now() + refreshed.expires_in * 1000);
  await auth.save();
  return auth.accessToken;
}

async function isConnected() {
  if (!isConfigured()) return false;

  // The mere existence of the record does not mean the token still works -
  // Google expires the refresh token every 7 days while the OAuth app is still
  // in "Testing" state in the Google Cloud Console. In that case we attempt an
  // actual refresh, so that the admin UI does not incorrectly show
  // "connected" next to an already dead token.
  try {
    const token = await getValidAccessToken();
    return Boolean(token);
  } catch {
    return false;
  }
}

async function disconnect() {
  await GoogleAuth.deleteMany({});
}

// timeMinISO/timeMaxISO: RFC3339 timestamps. Returns: [{ start, end }] - the
// busy intervals of the calendar, in UTC.
async function getBusyIntervals(timeMinISO, timeMaxISO) {
  const accessToken = await getValidAccessToken();
  if (!accessToken) return [];

  const auth = await GoogleAuth.findOne();
  const calendarId = auth?.calendarId || "primary";

  const res = await fetch(`${CALENDAR_API}/freeBusy`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      timeMin: timeMinISO,
      timeMax: timeMaxISO,
      items: [{ id: calendarId }],
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error?.message || "Google freeBusy lekerdezes sikertelen.");
  }

  const data = await res.json();
  return data.calendars?.[calendarId]?.busy || [];
}

async function createCalendarEvent({ summary, description, startISO, endISO }) {
  const accessToken = await getValidAccessToken();
  if (!accessToken) return null;

  const auth = await GoogleAuth.findOne();
  const calendarId = auth?.calendarId || "primary";

  const res = await fetch(`${CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      summary,
      description,
      start: { dateTime: startISO, timeZone: "Europe/Budapest" },
      end: { dateTime: endISO, timeZone: "Europe/Budapest" },
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error?.message || "Google naptar esemeny letrehozasa sikertelen.");
  }

  return res.json();
}

export {
  isConfigured,
  buildAuthUrl,
  saveTokensFromCode,
  isConnected,
  disconnect,
  getBusyIntervals,
  createCalendarEvent,
};
