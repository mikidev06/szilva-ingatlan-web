const BASE_URL = "/api";

export async function fetchListings(kind) {
  const query = kind ? `?kind=${kind}` : "";
  const res = await fetch(`${BASE_URL}/listings${query}`);
  if (!res.ok) throw new Error("Nem sikerult betolteni az ingatlanokat.");
  return res.json();
}

export async function fetchListing(id) {
  const res = await fetch(`${BASE_URL}/listings/${id}`);
  if (!res.ok) throw new Error("Nem sikerult betolteni az ingatlant.");
  return res.json();
}

export async function sendMessage(payload) {
  const res = await fetch(`${BASE_URL}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Nem sikerult elkuldeni az uzenetet.");
  return res.json();
}

export async function fetchMessages(token) {
  const res = await fetch(`${BASE_URL}/messages`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Nem sikerült betölteni az üzeneteket.");
  return res.json();
}

export async function deleteMessage(token, id) {
  const res = await fetch(`${BASE_URL}/messages/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Nem sikerült törölni az üzenetet."));
  }
  return res.json();
}

export function formatPrice(value) {
  if (value >= 1_000_000_000) {
    return `${formatRounded(value / 1_000_000_000)} Mrd Ft`;
  }

  if (value >= 1_000_000) {
    return `${formatRounded(value / 1_000_000)} M Ft`;
  }

  return `${new Intl.NumberFormat("hu-HU").format(value)} Ft`;
}

function formatRounded(amount) {
  return new Intl.NumberFormat("hu-HU", { maximumFractionDigits: 1 }).format(amount);
}

export function formatPriceRange(min, max) {
  if (!min && !max) return "Ár egyeztetés alatt";
  if (!max || max === min) return formatPrice(min || max);
  return `${formatPrice(min)} – ${formatPrice(max)}`;
}

export function formatSizeRange(min, max) {
  if (!min && !max) return "Alapterület egyeztetés alatt";
  if (!max || max === min) return `${min || max} m²`;
  return `${min} – ${max} m²`;
}

export function formatRoomsRange(min, max) {
  if (!min && !max) return "— szoba";
  if (!max || max === min) return `${min || max} szoba`;
  return `${min} – ${max} szoba`;
}

async function parseErrorMessage(res, fallback) {
  try {
    const data = await res.json();
    return data.message || fallback;
  } catch {
    return fallback;
  }
}

export async function login(password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Hibás jelszó."));
  }
  return res.json();
}

export async function verifyToken(token) {
  const res = await fetch(`${BASE_URL}/auth/verify`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.ok;
}

export async function createListing(token, payload) {
  const res = await fetch(`${BASE_URL}/listings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Nem sikerült létrehozni az ingatlant."));
  }
  return res.json();
}

export async function updateListing(token, id, payload) {
  const res = await fetch(`${BASE_URL}/listings/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Nem sikerült módosítani az ingatlant."));
  }
  return res.json();
}

export async function deleteListing(token, id) {
  const res = await fetch(`${BASE_URL}/listings/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Nem sikerült törölni az ingatlant."));
  }
  return res.json();
}

export async function fetchAvailability(date) {
  const res = await fetch(`${BASE_URL}/appointments/availability?date=${date}`);
  if (!res.ok) throw new Error("Nem sikerült betölteni az időpontokat.");
  return res.json();
}

export async function fetchFullDays(year, month) {
  const res = await fetch(`${BASE_URL}/appointments/full-days?year=${year}&month=${month}`);
  if (!res.ok) throw new Error("Nem sikerült betölteni a foglaltságot.");
  return res.json();
}

export async function createAppointment(payload) {
  const res = await fetch(`${BASE_URL}/appointments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Nem sikerült lefoglalni az időpontot."));
  }
  return res.json();
}

export async function fetchAppointments(token) {
  const res = await fetch(`${BASE_URL}/appointments`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Nem sikerült betölteni a foglalásokat.");
  return res.json();
}

export async function deleteAppointment(token, id) {
  const res = await fetch(`${BASE_URL}/appointments/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Nem sikerült törölni a foglalást."));
  }
  return res.json();
}

export async function fetchGoogleStatus(token) {
  const res = await fetch(`${BASE_URL}/google/status`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Nem sikerült lekérdezni a Google Naptár állapotát.");
  return res.json();
}

export async function fetchGoogleAuthUrl(token) {
  const res = await fetch(`${BASE_URL}/google/auth-url`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Nem sikerült elindítani a Google összekapcsolást."));
  }
  return res.json();
}

export async function disconnectGoogle(token) {
  const res = await fetch(`${BASE_URL}/google/disconnect`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Nem sikerült leválasztani a Google Naptárt."));
  }
  return res.json();
}
