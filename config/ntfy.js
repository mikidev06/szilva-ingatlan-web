// Push ertesitesek ntfy.sh-n keresztul uj uzenetekrol es idopontfoglalasokrol.
// A JSON publish API-t hasznaljuk (nem a fejlecalapu valtozatot), mert a
// magyar ekezetes karakterek (pl. ő, ű) nem fernek el HTTP fejlec ertekben.
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
    console.error("Ntfy ertesites kuldese sikertelen:", err.message);
  }
}
