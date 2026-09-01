const SCRIBE_MODEL = process.env.ELEVENLABS_STT_MODEL || "scribe_v1";

export const sttAvailable = () => Boolean(process.env.ELEVENLABS_API_KEY);

/**
 * Transcription de l'animateur. Le navigateur envoie les octets bruts d'un
 * enregistrement push-to-talk (webm/opus le plus souvent) ; on les repasse en
 * multipart a ElevenLabs et on ne renvoie que le texte.
 */
export async function transcribe({ bytes, mimeType }) {
  if (!sttAvailable()) {
    return { error: "ELEVENLABS_API_KEY absente", status: 503 };
  }
  if (!bytes?.length) {
    return { error: "enregistrement vide", status: 400 };
  }

  const form = new FormData();
  form.append("file", new Blob([bytes], { type: mimeType || "audio/webm" }), "animateur.webm");
  form.append("model_id", SCRIBE_MODEL);
  form.append("language_code", "fra");
  // Rien d'autre n'est utile ici : ni diarisation, ni horodatage, ni sons.
  form.append("tag_audio_events", "false");

  let upstream;
  try {
    upstream = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
      method: "POST",
      headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY },
      body: form,
    });
  } catch (err) {
    return { error: `ElevenLabs injoignable : ${err.message}`, status: 502 };
  }

  if (!upstream.ok) {
    const detail = await upstream.text().catch(() => "");
    return {
      error: `ElevenLabs ${upstream.status}`,
      detail: detail.slice(0, 500),
      status: upstream.status,
    };
  }

  const data = await upstream.json().catch(() => ({}));
  return { text: String(data.text || "").trim() };
}
