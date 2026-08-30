const BASE_URL = "/api";

export async function fetchListings() {
  const res = await fetch(`${BASE_URL}/listings`);
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

export function formatPrice(value, type) {
  const suffix = type === "Kiadó" ? " / hó" : "";

  if (value >= 1_000_000_000) {
    return `${formatRounded(value / 1_000_000_000)} Mrd Ft${suffix}`;
  }

  if (value >= 1_000_000) {
    return `${formatRounded(value / 1_000_000)} M Ft${suffix}`;
  }

  return `${new Intl.NumberFormat("hu-HU").format(value)} Ft${suffix}`;
}

function formatRounded(amount) {
  return new Intl.NumberFormat("hu-HU", { maximumFractionDigits: 1 }).format(amount);
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
