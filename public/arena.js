const $ = (id) => document.getElementById(id);

const el = {
  setup: $("setup"), setupPersonas: $("setupPersonas"), setupNote: $("setupNote"),
  topicInput: $("topicInput"), roundsInput: $("roundsInput"), roundsLabel: $("roundsLabel"),
  startBtn: $("startBtn"),
  arena: $("arena"), stage: $("stage"), topicBar: $("topicBar"),
  roundNow: $("roundNow"), roundTotal: $("roundTotal"),
  caption: $("caption"), captionWho: $("captionWho"), captionText: $("captionText"),
  animatorInput: $("animatorInput"), animatorSend: $("animatorSend"), stopBtn: $("stopBtn"),
  micBtn: $("micBtn"), micLabel: $("micLabel"),
  toast: $("toast"), player: $("player"),
  verdict: $("verdict"), verdictTopic: $("verdictTopic"), verdictCards: $("verdictCards"),
  replayBtn: $("replayBtn"),
};

const DEFAULT_TOPIC =
  "Quelle est la meilleure idée de business à lancer seul avec 5 000 € en 2026 ?";

let config = null;
let ws = null;
const pods = new Map();          // personaId -> { root, canvas, status }
let audioCtx = null, analyser = null, freq = null, sourceNode = null;
let amp = 0;
let turn = null;                 // tour en cours de lecture
let endTimer = null;

// ------------------------------------------------------------- DEMARRAGE

async function boot() {
  config = await fetch("/api/config").then((r) => r.json());

  el.setupPersonas.innerHTML = config.personas
    .map(
      (p) => `<div class="spc" style="--c:${p.color}">
                <b>${p.name}</b><span>${p.title}</span><em>${p.axis}</em>
              </div>`
    )
    .join("");

  el.stage.innerHTML = config.personas
    .map(
      (p) => `<div class="pod" data-id="${p.id}" style="--c:${p.color}">
                <div class="halo"></div>
                <div class="art" data-art="${p.id}"></div>
                <canvas class="wave" width="440" height="68"></canvas>
                <div class="plate"><b>${p.name}</b><span>${p.title}</span></div>
                <div class="status"></div>
              </div>`
    )
    .join("");

  for (const p of config.personas) {
    const root = el.stage.querySelector(`.pod[data-id="${p.id}"]`);
    pods.set(p.id, {
      root,
      canvas: root.querySelector("canvas"),
      status: root.querySelector(".status"),
      color: p.color,
      name: p.name,
      title: p.title,
    });
    loadArt(p, root.querySelector(".art"));
  }

  const notes = [];
  if (!config.hasKey) notes.push("ANTHROPIC_API_KEY absente du .env — le débat ne pourra pas démarrer.");
  if (!config.tts) notes.push("ELEVENLABS_API_KEY absente — mode sous-titres, sans voix.");

  el.setupNote.textContent = notes.join("  ·  ");

  el.topicInput.placeholder = DEFAULT_TOPIC;

  // `/arene <sujet>` ouvre l'arene avec le sujet deja rempli : il ne reste
  // qu'a cliquer Lancer (le clic sert aussi de geste utilisateur pour l'audio).
  const params = new URLSearchParams(location.search);
  const topic = params.get("topic");
  if (topic) el.topicInput.value = topic.trim();
  const rounds = Number(params.get("rounds"));
  if (Number.isFinite(rounds) && rounds >= 1 && rounds <= 8) {
    el.roundsInput.value = String(rounds);
    el.roundsLabel.textContent = String(rounds);
  }

  requestAnimationFrame(render);
}

/** Les .svg sont injectés inline (pour hériter de currentColor), le reste en <img>. */
async function loadArt(persona, host) {
  if (!persona.image) return;
  if (persona.image.toLowerCase().endsWith(".svg")) {
    try {
      host.innerHTML = await fetch(persona.image).then((r) => r.text());
      return;
    } catch { /* on retombe sur l'img */ }
  }
  host.innerHTML = `<img src="${persona.image}" alt="${persona.name}">`;
}

// ------------------------------------------------------------ WEBSOCKET

function connect() {
  ws = new WebSocket(`${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/ws`);
  ws.onmessage = (e) => handle(JSON.parse(e.data));
  ws.onclose = () => setTimeout(() => { if (!el.arena.hidden) connect(); }, 1200);
  return new Promise((res) => (ws.onopen = res));
}

const sendWs = (msg) => {
  if (demo.on) return demoRecv(msg);
  return ws?.readyState === 1 && ws.send(JSON.stringify(msg));
};

function handle(msg) {
  switch (msg.type) {
    case "started":
      el.topicBar.textContent = msg.topic;
      el.roundTotal.textContent = msg.rounds;
      break;

    case "turn_start":
      stopAudio();
      setActive(msg.personaId, "thinking");
      el.roundNow.textContent = msg.round;
      pods.get(msg.personaId).status.textContent =
        msg.kind === "final" ? "conclusion" : "réfléchit";
      break;

    case "turn_ready":
      playTurn(msg);
      break;

    case "interrupted":
      stopAudio();
      clearActive();
      break;

    case "animator":
      showAnimator(msg.text);
      break;

    case "verdict":
      stopAudio();
      clearActive();
      showVerdict(msg);
      break;

    case "stopped":
      stopAudio();
      clearActive();
      break;

    case "error":
      toast(msg.message);
      break;
  }
}

// ---------------------------------------------------------------- SCENE

function setActive(id, mode) {
  for (const [pid, pod] of pods) {
    pod.root.classList.toggle("active", mode === "active" && pid === id);
    pod.root.classList.toggle("thinking", mode === "thinking" && pid === id);
    if (pid !== id) pod.status.textContent = "";
  }
  const pod = pods.get(id);
  if (pod) {
    document.documentElement.style.setProperty("--active", pod.color);
  }
}

function clearActive() {
  for (const pod of pods.values()) {
    pod.root.classList.remove("active", "thinking");
    pod.status.textContent = "";
  }
}

function showAnimator(text) {
  turn = null;
  el.caption.classList.add("is-animator");
  el.captionWho.textContent = "ANIMATEUR";
  el.captionText.innerHTML = `<span class="w on">${escapeHtml(text)}</span>`;
  document.documentElement.style.setProperty("--active", "#ffffff");
}

function escapeHtml(s) {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

// ----------------------------------------------------------- LECTURE

function playTurn(msg) {
  const pod = pods.get(msg.personaId);
  setActive(msg.personaId, "active");
  pod.status.textContent = msg.kind === "final" ? "conclusion" : "en direct";

  // Sous-titres : un span par mot, révélés au fil de la lecture.
  el.caption.classList.remove("is-animator");
  el.captionWho.textContent = `${pod.name} — ${pod.title}`;
  const words = msg.text.split(/\s+/).filter(Boolean);
  el.captionText.innerHTML = words.map((w) => `<span class="w">${escapeHtml(w)}</span>`).join(" ");

  turn = {
    turnId: msg.turnId,
    spans: [...el.captionText.querySelectorAll(".w")],
    started: performance.now(),
    durationMs: msg.estimateMs,
    shown: -1,
    canvas: pod.canvas,
    color: pod.color,
    usingAudio: false,
  };

  if (msg.audio) {
    el.player.src = `/tts/${msg.turnId}`;
    el.player.play().then(
      () => { turn && (turn.usingAudio = true, turn.started = performance.now()); },
      () => armTimedFallback(msg)
    );
  } else {
    armTimedFallback(msg);
  }
}

/** Sans voix (ou si ElevenLabs échoue) : on déroule les sous-titres au chrono. */
function armTimedFallback(msg) {
  clearTimeout(endTimer);
  if (turn) { turn.usingAudio = false; turn.started = performance.now(); }
  endTimer = setTimeout(() => sendWs({ type: "audio_ended", turnId: msg.turnId }), msg.estimateMs);
}

function stopAudio() {
  clearTimeout(endTimer);
  endTimer = null;
  try { el.player.pause(); el.player.removeAttribute("src"); el.player.load(); } catch {}
  turn = null;
  amp = 0;
}

el.player.addEventListener("ended", () => {
  if (turn) sendWs({ type: "audio_ended", turnId: turn.turnId });
});
el.player.addEventListener("error", () => {
  if (!turn) return;
  toast("Voix indisponible — bascule en mode sous-titres.");
  armTimedFallback({ turnId: turn.turnId, estimateMs: turn.durationMs });
});

// -------------------------------------------------------- AUDIO / RENDU

function initAudio() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 512;
  analyser.smoothingTimeConstant = 0.75;
  freq = new Uint8Array(analyser.frequencyBinCount);
  sourceNode = audioCtx.createMediaElementSource(el.player);
  sourceNode.connect(analyser);
  analyser.connect(audioCtx.destination);
}

function render(now) {
  requestAnimationFrame(render);

  let target = 0;
  if (turn) {
    if (turn.usingAudio && analyser) {
      analyser.getByteFrequencyData(freq);
      let sum = 0;
      for (let i = 0; i < 64; i++) sum += freq[i];
      target = Math.min(1, sum / 64 / 140);
    } else {
      // Animation de substitution pour que la scène reste vivante sans voix.
      const t = now / 1000;
      target = 0.28 + 0.34 * Math.abs(Math.sin(t * 5.2) * Math.sin(t * 2.1) + 0.25 * Math.sin(t * 11));
    }
    drawWave(turn.canvas, turn.color, now);
    advanceCaption(now);
  }

  amp += (target - amp) * 0.25;
  document.documentElement.style.setProperty("--amp", amp.toFixed(3));
}

function advanceCaption(now) {
  const usable = turn.usingAudio && isFinite(el.player.duration) && el.player.duration > 0;
  const t = turn.usingAudio ? el.player.currentTime * 1000 : now - turn.started;
  const d = usable ? el.player.duration * 1000 : turn.durationMs;
  const p = Math.max(0, Math.min(1, t / Math.max(1, d - 400)));
  const upTo = Math.floor(p * turn.spans.length);
  if (upTo === turn.shown) return;
  for (let i = Math.max(0, turn.shown); i < upTo; i++) turn.spans[i]?.classList.add("on");
  turn.shown = upTo;
}

function drawWave(canvas, color, now) {
  const ctx = canvas.getContext("2d");
  const { width: W, height: H } = canvas;
  ctx.clearRect(0, 0, W, H);
  const bars = 44, gap = 3, bw = W / bars - gap;
  ctx.fillStyle = color;
  for (let i = 0; i < bars; i++) {
    const centre = 1 - Math.abs(i - bars / 2) / (bars / 2);
    const wobble = 0.55 + 0.45 * Math.sin(now / 130 + i * 0.7);
    const h = Math.max(2, amp * H * (0.35 + centre * 0.9) * wobble);
    ctx.globalAlpha = 0.35 + centre * 0.55;
    ctx.fillRect(i * (bw + gap), (H - h) / 2, bw, h);
  }
  ctx.globalAlpha = 1;
}

// ------------------------------------------------------------- VERDICT

function showVerdict(msg) {
  el.verdictTopic.textContent = msg.topic;
  el.verdictCards.innerHTML = msg.items
    .map((it) => {
      const p = pods.get(it.personaId);
      return `<div class="vcard" style="--c:${p.color}">
                <b>${p.name}</b><em>${p.title}</em><p>${escapeHtml(it.text)}</p>
              </div>`;
    })
    .join("");
  el.verdict.hidden = false;
  releaseMic();
}

function toast(text) {
  el.toast.textContent = text;
  el.toast.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => (el.toast.hidden = true), 6000);
}

// ------------------------------------------------------- MODE DEMO (?demo=1)
// Rejoue un debat scripte, sans API ni credits : sert a regler l'habillage,
// caler un cadrage OBS ou montrer le rendu sans depenser un centime.

const demo = { on: new URLSearchParams(location.search).has("demo"), i: 0, script: [], rounds: 4 };

const DEMO_SCRIPT = [
  ["nova", 1, "debate", "Une agence d'un seul homme qui installe des assistants vocaux chez les artisans. Cinq mille euros suffisent : tu ne construis rien, tu assembles. Le plombier qui rate huit appels par jour te paie trois cents euros par mois sans réfléchir. Le produit existe déjà. Ce qui manque, c'est quelqu'un qui se déplace."],
  ["axiom", 1, "debate", "Trois cents euros par mois, pour un artisan seul, c'est au-dessus de ce que ce segment dépense en logiciel. De mémoire, on est plutôt entre quarante et quatre-vingts. NOVA a le bon mécanisme et le mauvais prix, d'un facteur quatre. Il faut vingt clients, pas cinq."],
  ["krach", 1, "debate", "Le problème n'est pas le prix. Au mois six, un client perd un chantier parce que l'assistant a mal noté une adresse. Il ne réclame pas. Il arrête, et il en parle à trois confrères. Une chose me ferait changer d'avis : deux artisans qui ont déjà payé d'avance."],
  ["nova", 2, "debate", "KRACH décrit un assistant qui décide. Personne ne propose ça. Il prend le message, il l'écrit, l'artisan rappelle. Le risque qu'il décrit disparaît si la machine ne raccroche jamais seule. AXIOM parle de quatre-vingts euros : à quarante clients, ça reste le meilleur revenu par heure travaillée du marché."],
  ["axiom", 2, "debate", "Quarante clients à quatre-vingts euros, c'est trois mille deux cents par mois. Réaliste. Mais le taux de résiliation sur ce type de service tourne autour de cinq pour cent mensuel : il faut en signer deux par mois juste pour rester à l'équilibre. C'est ça, le vrai chiffre du problème."],
  ["krach", 2, "debate", "Deux signatures par mois, tous les mois, pendant deux ans. C'est un métier de commercial de terrain, pas un métier de produit. Au mois quatorze, la personne est épuisée par la prospection et le produit n'a pas bougé. C'est là que ça meurt, pas dans la technique."],
  ["nova", 4, "final", "Vends la présence, pas la technologie : c'est le seul créneau où être seul est un avantage."],
  ["axiom", 4, "final", "Modèle viable autour de quarante à quatre-vingts euros par client, à condition de tenir deux signatures par mois."],
  ["krach", 4, "final", "Ça ne casse pas techniquement, ça casse au mois quatorze, quand la prospection ne s'arrête jamais."],
];

const DEMO_REPLY =
  "Bonne question. Ce que je retiens de votre intervention, c'est que le nerf n'est pas le produit mais le canal. Trouve les dix premiers artisans par bouche-à-oreille et la question du coût d'acquisition disparaît pendant six mois. Après, on verra.";

function demoStart(topic, rounds) {
  demo.i = 0;
  demo.rounds = rounds;
  demo.script = DEMO_SCRIPT.map((s) => ({ id: s[0], round: Math.min(s[1], rounds), kind: s[2], text: s[3] }));
  handle({ type: "started", topic, rounds });
  setTimeout(demoNext, 400);
}

function demoNext() {
  const s = demo.script[demo.i];
  if (!s) {
    return handle({
      type: "verdict",
      topic: el.topicBar.textContent,
      items: config.personas.map((p) => ({
        personaId: p.id,
        text: [...demo.script].reverse().find((x) => x.id === p.id)?.text || "",
      })),
    });
  }
  const turnId = `demo-${demo.i}`;
  handle({ type: "turn_start", turnId, personaId: s.id, round: s.round, kind: s.kind });
  setTimeout(() => {
    const words = s.text.split(/\s+/).length;
    handle({
      type: "turn_ready", turnId, personaId: s.id, round: s.round, kind: s.kind,
      text: s.text, estimateMs: Math.round((words / 2.75) * 1000) + 900, audio: false,
    });
  }, 1400);
}

function demoRecv(msg) {
  if (msg.type === "audio_ended") { demo.i++; setTimeout(demoNext, 250); }
  if (msg.type === "interject") {
    const s = demo.script[demo.i] || demo.script[demo.script.length - 1];
    handle({ type: "interrupted" });
    handle({ type: "animator", text: msg.text });
    // Meme comportement que le serveur : le tour coupe est rejoue, pas double.
    demo.script[demo.i] = { id: s.id, round: s.round, kind: "debate", text: DEMO_REPLY };
    setTimeout(demoNext, 2200);
  }
  if (msg.type === "stop") handle({ type: "stopped" });
}

// ------------------------------------------------------------ CONTROLES

el.roundsInput.addEventListener("input", () => (el.roundsLabel.textContent = el.roundsInput.value));

el.startBtn.addEventListener("click", async () => {
  const topic = el.topicInput.value.trim() || DEFAULT_TOPIC;
  el.startBtn.disabled = true;
  initAudio();                       // le clic fournit le geste utilisateur requis
  await audioCtx.resume().catch(() => {});
  if (!demo.on) await connect();
  el.setup.hidden = true;
  el.arena.hidden = false;
  el.verdict.hidden = true;
  const rounds = Number(el.roundsInput.value);
  if (demo.on) demoStart(topic, rounds);
  else sendWs({ type: "start", topic, rounds });

});

function interject() {
  const text = el.animatorInput.value.trim();
  if (!text) return;
  el.animatorInput.value = "";
  sendWs({ type: "interject", text });
}
el.animatorSend.addEventListener("click", interject);
el.animatorInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") { e.preventDefault(); interject(); }
});

el.stopBtn.addEventListener("click", () => { stopListening(); releaseMic(); sendWs({ type: "stop" }); });

// ------------------------------------------------------- MICRO ANIMATEUR
// Push-to-talk : on maintient (bouton ou barre Espace), on parle, on relache.
// Pendant ce temps la voix du robot est mise en pause — sinon le micro la
// reprendrait par les haut-parleurs et la transcription partirait en vrille.

const MAX_RECORD_MS = 15000;
const mic = { stream: null, rec: null, chunks: [], on: false, ducked: false, cancelled: false, timer: null };

function micState(cls, label) {
  el.micBtn.classList.remove("recording", "sending");
  if (cls) el.micBtn.classList.add(cls);
  el.micLabel.textContent = label;
  document.body.classList.toggle("listening", cls === "recording");
}

function pickMime() {
  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];
  return candidates.find((t) => MediaRecorder.isTypeSupported?.(t)) || "";
}

async function getStream() {
  if (mic.stream?.active) return mic.stream;
  mic.stream = await navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
  });
  return mic.stream;
}

function releaseMic() {
  mic.stream?.getTracks().forEach((t) => t.stop());
  mic.stream = null;
}

/** Rend la parole au robot quand la prise de son n'a rien donne. */
function unduck() {
  if (!mic.ducked) return;
  mic.ducked = false;
  if (turn?.usingAudio && el.player.getAttribute("src")) el.player.play().catch(() => {});
}

async function startListening() {
  if (mic.on || el.arena.hidden) return;
  if (!config.stt) {
    return toast("Micro indisponible : ELEVENLABS_API_KEY absente du .env.");
  }
  if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
    return toast("Ce navigateur ne sait pas enregistrer le micro. Utilise Chrome ou Edge.");
  }

  let stream;
  try {
    stream = await getStream();
  } catch {
    return toast("Micro refusé. Autorise-le dans la barre d'adresse, puis réessaie.");
  }

  mic.on = true;
  mic.chunks = [];

  if (!el.player.paused) { el.player.pause(); mic.ducked = true; }

  const mimeType = pickMime();
  mic.rec = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
  mic.rec.ondataavailable = (e) => e.data.size && mic.chunks.push(e.data);
  mic.rec.onstop = () => sendRecording(mic.rec.mimeType || mimeType || "audio/webm");
  mic.rec.start();

  mic.cancelled = false;
  micState("recording", "Envoyer");
  toast("Je t'écoute. Reclique sur Envoyer (ou Espace) quand tu as fini.");
  clearTimeout(mic.timer);
  mic.timer = setTimeout(stopListening, MAX_RECORD_MS);
}

function stopListening() {
  if (!mic.on) return;
  mic.on = false;
  clearTimeout(mic.timer);
  micState("sending", "…");
  try {
    if (mic.rec && mic.rec.state !== "inactive") mic.rec.stop();
    else micState(null, "Parler");
  } catch {
    micState(null, "Parler");
  }
}

/** Échap : on jette la prise de son et on rend la parole au robot. */
function cancelListening() {
  if (!mic.on) return;
  mic.cancelled = true;
  stopListening();
  toast("Prise de parole annulée.");
}

async function sendRecording(mimeType) {
  const blob = new Blob(mic.chunks, { type: mimeType });
  mic.chunks = [];

  if (mic.cancelled) {
    mic.cancelled = false;
    micState(null, "Parler");
    unduck();
    return;
  }

  if (blob.size < 1500) {                       // moins d'un tiers de seconde
    micState(null, "Parler");
    unduck();
    return;
  }

  try {
    const r = await fetch("/stt", {
      method: "POST",
      headers: { "content-type": mimeType },
      body: blob,
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || `erreur ${r.status}`);

    const text = String(data.text || "").trim();
    if (!text) {
      unduck();
      toast("Rien compris — reparle un peu plus près du micro.");
      return;
    }

    mic.ducked = false;                          // l'interruption remplace la lecture
    sendWs({ type: "interject", text: withMention(text) });
  } catch (err) {
    unduck();
    toast(`Transcription impossible : ${err.message}`);
  } finally {
    micState(null, "Parler");
  }
}

/**
 * « Krach, et le coût de support ? » devient « @krach et le coût de support ? ».
 * Scribe écrit rarement les noms des robots correctement (« Crac ! » pour KRACH) :
 * on compare donc au nom ET aux alias listés dans le SKILL.md de chacun.
 */
function normalize(word) {
  // NFD sépare les accents de leur lettre, le filtre ne garde que les lettres :
  // « Axiôme, » et « axiome » se ramènent au même mot.
  return word.normalize("NFD").replace(/[^A-Za-z]/g, "").toLowerCase();
}

function withMention(text) {
  const m = text.match(/^([A-Za-zÀ-ÿ]+)[\s,:;!?.…-]+([\s\S]+)$/);
  if (!m) return text;
  const said = normalize(m[1]);
  const hit = config.personas.find(
    (p) =>
      normalize(p.id) === said ||
      normalize(p.name) === said ||
      (p.aliases || []).some((a) => normalize(a) === said)
  );
  return hit ? `@${hit.id} ${m[2].trim()}` : text;
}

// Un clic pour parler, un clic pour envoyer. La barre Espace fait la meme
// chose, y compris quand le curseur est dans le champ texte tant qu'il est
// vide — sinon le focus par defaut du champ avalerait toutes les frappes.
function toggleListening() {
  if (mic.on) stopListening();
  else startListening();
}

el.micBtn.addEventListener("click", (e) => {
  e.preventDefault();
  toggleListening();
});

document.addEventListener("keydown", (e) => {
  if (e.code !== "Space" || e.repeat || el.arena.hidden) return;
  const typing = document.activeElement === el.animatorInput && el.animatorInput.value !== "";
  if (typing) return;                 // on ecrit vraiment : Espace reste un espace
  e.preventDefault();
  toggleListening();
});

// Echap annule la prise de son sans rien envoyer.
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && mic.on) { cancelListening(); }
});

el.replayBtn.addEventListener("click", () => {
  el.verdict.hidden = true;
  el.arena.hidden = true;
  el.setup.hidden = false;
  el.startBtn.disabled = false;
  el.captionText.textContent = "";
  el.captionWho.textContent = "";
  clearActive();
});

// H : masque l'habillage pour l'enregistrement OBS.
document.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "h" && document.activeElement !== el.animatorInput) {
    document.body.classList.toggle("clean");
  }
});

boot();
