import "./src/env.js";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import { WebSocketServer } from "ws";

import { loadPersonas, publicPersona } from "./src/personas.js";
import { modelInfo } from "./src/claude.js";
import { streamSpeech, ttsAvailable } from "./src/tts.js";
import { transcribe, sttAvailable } from "./src/stt.js";
import { Debate } from "./src/orchestrator.js";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 4173);

const personas = loadPersonas();

/** turnId -> { text, voice }. Borne pour ne pas fuir sur une longue session. */
const ttsStore = new Map();
function rememberTurn(id, payload) {
  ttsStore.set(id, payload);
  if (ttsStore.size > 200) ttsStore.delete(ttsStore.keys().next().value);
}

const app = express();
app.use(express.static(path.join(ROOT, "public")));

app.get("/api/config", (_req, res) => {
  res.json({
    personas: personas.map(publicPersona),
    tts: ttsAvailable(),
    stt: sttAvailable(),
    hasKey: Boolean(process.env.ANTHROPIC_API_KEY),
    ...modelInfo(),
  });
});

app.get("/tts/:turnId", async (req, res) => {
  const turn = ttsStore.get(req.params.turnId);
  if (!turn) return res.status(404).json({ error: "tour inconnu" });
  await streamSpeech({ text: turn.text, voice: turn.voice, res });
});

/** Push-to-talk de l'animateur : ~15 s d'opus, jamais plus. */
app.post(
  "/stt",
  express.raw({ type: ["audio/*", "application/octet-stream"], limit: "8mb" }),
  async (req, res) => {
    const out = await transcribe({ bytes: req.body, mimeType: req.get("content-type") });
    if (out.error) return res.status(out.status || 500).json(out);
    res.json({ text: out.text });
  }
);

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/ws" });

wss.on("connection", (ws) => {
  const send = (msg) => {
    if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(msg));
  };

  const debate = new Debate({
    personas,
    send,
    ttsStore: { set: rememberTurn },
    ttsAvailable: ttsAvailable(),
  });

  ws.on("message", (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return;
    }

    switch (msg.type) {
      case "start": {
        if (!process.env.ANTHROPIC_API_KEY) {
          return send({
            type: "error",
            message:
              "ANTHROPIC_API_KEY absente. Colle ta cle dans le fichier .env puis relance le serveur.",
          });
        }
        const topic = String(msg.topic || "").trim();
        if (!topic) return send({ type: "error", message: "Sujet vide." });
        const rounds = Math.min(8, Math.max(1, Number(msg.rounds) || 4));
        debate.start({ topic, rounds });
        break;
      }
      case "interject":
        debate.interject(msg.text);
        break;
      case "audio_ended":
        debate.noteAudioEnded(msg.turnId);
        break;
      case "stop":
        debate.stop();
        send({ type: "stopped" });
        break;
    }
  });

  ws.on("close", () => debate.stop());
});

server.listen(PORT, () => {
  const info = modelInfo();
  console.log(`\n  L'ARENE  —  http://localhost:${PORT}\n`);
  console.log(`  Debatteurs : ${personas.map((p) => p.name).join("  vs  ")}`);
  console.log(`  Modele     : ${info.model} (effort ${info.effort})`);
  console.log(
    `  Cle Claude : ${process.env.ANTHROPIC_API_KEY ? "OK" : "MANQUANTE -> voir .env"}`
  );
  console.log(
    `  Voix       : ${
      ttsAvailable() ? process.env.ELEVENLABS_MODEL || "eleven_flash_v2_5" : "desactivee (mode sous-titres)"
    }`
  );
  console.log(
    `  Micro      : ${
      sttAvailable()
        ? `${process.env.ELEVENLABS_STT_MODEL || "scribe_v1"} (barre Espace pour couper la parole)`
        : "desactive (interruption au clavier seulement)"
    }\n`
  );
});
