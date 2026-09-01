import { randomUUID } from "node:crypto";
import { speak } from "./claude.js";

/** ~149 mots/minute (voix ElevenLabs a speed 0.9), plus une marge de respiration. */
function estimateMs(text) {
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.round((words / 2.475) * 1000) + 900;
}

/**
 * Un Debate = une session de debat pilotee par un client WebSocket.
 *
 * Deux mecanismes portent tout le fichier :
 *  - le PREFETCH : des qu'un robot a fini de generer, le suivant commence a
 *    reflechir pendant que le premier parle. Les ~20 s de voix couvrent
 *    entierement la generation suivante, d'ou l'enchainement sans blanc.
 *  - l'EPOCH : chaque interruption de l'animateur incremente un compteur. Toute
 *    tache en vol qui constate que l'epoch a change se jette elle-meme.
 */
export class Debate {
  constructor({ personas, send, ttsStore, ttsAvailable }) {
    this.personas = personas;
    this.byId = new Map(personas.map((p) => [p.id, p]));
    this.send = send;
    this.ttsStore = ttsStore;
    this.ttsAvailable = ttsAvailable;

    this.alive = false;
    this.epoch = 0;
    this.pos = 0;
    this.history = [];
    this.sequence = [];
    this.currentGen = null;
    this.prefetch = null;
    this.audioWaiter = null;
  }

  start({ topic, rounds }) {
    if (this.alive) return;
    this.alive = true;
    this.topic = topic;
    this.rounds = rounds;
    this.history = [];
    this.pos = 0;
    this.epoch = 0;

    this.sequence = [];
    for (let r = 1; r <= rounds; r++) {
      for (const p of this.personas) {
        this.sequence.push({ id: p.id, kind: "debate", round: r });
      }
    }
    for (const p of this.personas) {
      this.sequence.push({ id: p.id, kind: "final", round: rounds });
    }

    this.send({ type: "started", topic, rounds, total: this.sequence.length });
    this.loop().catch((err) => {
      this.send({ type: "error", message: err.message });
      this.stop();
    });
  }

  stop() {
    this.alive = false;
    this.epoch++;
    this.currentGen?.abort();
    this.currentGen = null;
    this.prefetch?.abort();
    this.prefetch = null;
    this.resolveAudio();
  }

  // --- Interruption animateur -------------------------------------------

  interject(rawText) {
    const text = String(rawText || "").trim();
    if (!text || !this.alive) return;

    // Ciblage optionnel : "@krach et le cout de support ?"
    let targetId = null;
    const mention = text.match(/^@([A-Za-z0-9_-]+)\s+([\s\S]+)$/);
    let body = text;
    if (mention && this.byId.has(mention[1].toLowerCase())) {
      targetId = mention[1].toLowerCase();
      body = mention[2].trim();
    }

    this.epoch++;
    this.currentGen?.abort();
    this.currentGen = null;
    this.prefetch?.abort();
    this.prefetch = null;

    this.history.push({ role: "animator", text: body });
    this.send({ type: "interrupted" });
    this.send({ type: "animator", text: body, target: targetId });

    // `this.pos` n'a pas ete incremente : le tour coupe va simplement etre
    // rejoue, cette fois avec l'intervention de l'animateur dans la
    // transcription. Rien a inserer, sinon le robot parlerait deux fois.
    // On n'insere un tour que pour rendre la parole a un robot explicitement
    // vise par un @mention.
    const current = this.sequence[this.pos];
    if (targetId && current && targetId !== current.id) {
      this.sequence.splice(this.pos, 0, {
        id: targetId,
        kind: "debate",
        round: current.round,
      });
    }

    this.resolveAudio();
  }

  // --- Attente de la fin de lecture cote navigateur ----------------------

  waitAudio(turnId, ms) {
    return new Promise((resolve) => {
      const timer = setTimeout(resolve, ms + 20000); // filet de securite
      this.audioWaiter = { turnId, resolve, timer };
    });
  }

  noteAudioEnded(turnId) {
    if (this.audioWaiter && this.audioWaiter.turnId === turnId) this.resolveAudio();
  }

  resolveAudio() {
    if (!this.audioWaiter) return;
    clearTimeout(this.audioWaiter.timer);
    this.audioWaiter.resolve();
    this.audioWaiter = null;
  }

  // --- Generation --------------------------------------------------------

  generate(slot) {
    const persona = this.byId.get(slot.id);
    return speak({
      persona,
      topic: this.topic,
      history: this.history,
      round: slot.round,
      rounds: this.rounds,
      isFinal: slot.kind === "final",
    });
  }

  /** Lance la reflexion du tour suivant pendant que le tour courant est joue. */
  startPrefetch() {
    const key = this.pos + 1;
    const slot = this.sequence[key];
    if (!slot) return;
    const gen = this.generate(slot);
    this.prefetch = {
      key,
      abort: gen.abort,
      promise: gen.promise.catch((err) => ({ __error: err })),
    };
  }

  async loop() {
    while (this.alive && this.pos < this.sequence.length) {
      const myEpoch = this.epoch;
      const slot = this.sequence[this.pos];
      const persona = this.byId.get(slot.id);
      const turnId = randomUUID();

      this.send({
        type: "turn_start",
        turnId,
        personaId: persona.id,
        round: slot.round,
        kind: slot.kind,
        index: this.pos,
        total: this.sequence.length,
      });

      // Recupere le tour prefetche si il est encore valide, sinon genere.
      let text;
      try {
        if (this.prefetch && this.prefetch.key === this.pos) {
          const taken = this.prefetch;
          this.prefetch = null;
          this.currentGen = taken;
          const out = await taken.promise;
          if (out && out.__error) throw out.__error;
          text = out;
        } else {
          const gen = this.generate(slot);
          this.currentGen = gen;
          text = await gen.promise;
        }
      } catch (err) {
        if (this.epoch !== myEpoch || !this.alive) continue; // interrompu : normal
        throw err;
      } finally {
        this.currentGen = null;
      }

      if (this.epoch !== myEpoch || !this.alive) continue;

      const turnNumber = this.history.filter((h) => h.role === "persona").length + 1;
      this.history.push({
        role: "persona",
        id: persona.id,
        name: persona.name,
        text,
        turn: turnNumber,
      });

      const ms = estimateMs(text);
      this.ttsStore.set(turnId, { text, voice: persona.voice });

      this.send({
        type: "turn_ready",
        turnId,
        personaId: persona.id,
        round: slot.round,
        kind: slot.kind,
        text,
        estimateMs: ms,
        audio: this.ttsAvailable && Boolean(persona.voice.id),
      });

      this.startPrefetch();
      await this.waitAudio(turnId, ms);

      if (this.epoch !== myEpoch || !this.alive) continue; // coupe pendant la voix
      this.pos++;
    }

    if (!this.alive) return;

    this.send({
      type: "verdict",
      topic: this.topic,
      items: this.personas.map((p) => {
        const finals = this.history.filter((h) => h.id === p.id);
        return {
          personaId: p.id,
          text: finals.length ? finals[finals.length - 1].text : "",
        };
      }),
    });
    this.alive = false;
  }
}
