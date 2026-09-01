import { Readable } from "node:stream";

const ELEVEN_MODEL = process.env.ELEVENLABS_MODEL || "eleven_flash_v2_5";

export const ttsAvailable = () => Boolean(process.env.ELEVENLABS_API_KEY);

/**
 * Proxy streaming vers ElevenLabs. On relaie les octets au navigateur des le
 * premier chunk : la lecture demarre avant que la synthese soit terminee.
 */
export async function streamSpeech({ text, voice, res }) {
  if (!ttsAvailable()) {
    res.status(503).json({ error: "ELEVENLABS_API_KEY absente" });
    return;
  }
  if (!voice?.id) {
    res.status(503).json({ error: "voice_id absent du SKILL.md de ce robot" });
    return;
  }

  const url =
    `https://api.elevenlabs.io/v1/text-to-speech/${voice.id}/stream` +
    `?output_format=mp3_44100_128&optimize_streaming_latency=3`;

  let upstream;
  try {
    upstream = await fetch(url, {
      method: "POST",
      headers: {
        "xi-api-key": process.env.ELEVENLABS_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        text,
        model_id: ELEVEN_MODEL,
        language_code: "fr",
        voice_settings: {
          stability: voice.stability,
          similarity_boost: voice.similarity_boost,
          style: voice.style,
          speed: voice.speed,
          use_speaker_boost: true,
        },
      }),
    });
  } catch (err) {
    res.status(502).json({ error: `ElevenLabs injoignable : ${err.message}` });
    return;
  }

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => "");
    res
      .status(upstream.status)
      .json({ error: `ElevenLabs ${upstream.status}`, detail: detail.slice(0, 500) });
    return;
  }

  res.setHeader("Content-Type", "audio/mpeg");
  res.setHeader("Cache-Control", "no-store");
  Readable.fromWeb(upstream.body).pipe(res);
}
