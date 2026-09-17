// Push notifications through ntfy.sh about new messages and appointment
// bookings. We use the JSON publish API (not the header-based variant),
// because Hungarian accented characters (ő, ű for instance) do not fit in an
// HTTP header value.
const NTFY_URL = "https://ntfy.sh/";

export async function sendNtfyNotification({ title, message, tags, priority }) {
  const topic = process.env.NTFY_TOPIC;
  if (!topic) {
    return;
  }

  try {
    await fetch(NTFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic,
        title,
        message,
        tags,
        priority,
      }),
    });
  } catch (err) {
    console.error("Failed to send ntfy notification:", err.message);
  }
}
