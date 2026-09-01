import Anthropic from "@anthropic-ai/sdk";

const MODEL = process.env.DEBATE_MODEL || "claude-opus-5";
const EFFORT = process.env.DEBATE_EFFORT || "low";

let client = null;
export function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY absente du .env");
  }
  client ??= new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
}

export const modelInfo = () => ({ model: MODEL, effort: EFFORT });

/** Met en forme la transcription telle que le robot la lit avant de parler. */
function renderTranscript(topic, history) {
  const lines = history.map((h) =>
    h.role === "animator"
      ? `[ANIMATEUR] : ${h.text}`
      : `[Tour ${h.turn}] ${h.name} : ${h.text}`
  );
  return `SUJET DU DEBAT : ${topic}\n\nTRANSCRIPTION JUSQU'ICI :\n${
    lines.length ? lines.join("\n\n") : "(rien encore, tu ouvres le debat)"
  }`;
}

/**
 * Une question de pronostic ("qui va gagner en 2027 ?") n'appelle pas une
 * proposition mais une reponse : un nom, un chiffre, une date. Sans cette
 * distinction, les robots retombent a debattre du cadre de la question au lieu
 * d'y repondre chacun. Le doute profite a l'action : on ne bascule en mode
 * pronostic que sur un marqueur explicite, et jamais si la question demande
 * visiblement quoi faire.
 */
const ACTION_RE =
  /\b(faut-il|doit-on|devrait-on|comment (faire|s'y prendre|lancer)|on lance|est-ce qu'on (doit|devrait)|quelle strategie|quelle strat\u00e9gie)\b/i;

const FORECAST_RE = new RegExp(
  [
    "\\bqui (va|vont|gagnera|gagnent|remportera|l'emportera|sera|seront|deviendra)\\b",
    "\\b(gagnera|remportera|l'emportera|deviendra|sera \\w*elu|sera \\w*\\u00e9lu)\\b",
    "\\bva-t-(il|elle|on)\\b|\\bvont-ils\\b|\\bvont-elles\\b",
    "\\bque va-t-il se passer\\b|\\bqu'est-ce qui va\\b",
    "\\bd'ici (20\\d\\d|\\d+ ans)\\b",
    "\\ben 20[2-9]\\d\\b",
    "\\b(pronostic|prediction|pr\\u00e9diction|prevision|pr\\u00e9vision)\\b",
    "\\bcombien .* en 20\\d\\d\\b",
    "\\bquand est-ce\\b|\\ben quelle annee\\b|\\ben quelle ann\\u00e9e\\b",
  ].join("|"),
  "i"
);

function isForecast(topic) {
  const t = String(topic || "");
  if (ACTION_RE.test(t)) return false;
  return FORECAST_RE.test(t);
}

function buildInstruction({ persona, topic, round, rounds, history, isFinal }) {
  const forecast = isForecast(topic);
  const last = history[history.length - 1];

  if (isFinal) {
    return [
      `C'est le mot de la fin. Tu es ${persona.name}.`,
      forecast
        ? `En UNE SEULE phrase de 19 mots maximum : TA reponse a la question. Un nom, un chiffre ou une date, et tes chances. Pas de "on ne peut pas savoir".`
        : `En UNE SEULE phrase de 19 mots maximum : ce que TOI tu ferais, concretement.`,
      `Pas de resume du debat, pas de synthese, pas de compromis. Ta position, nette.`,
      `Mots simples, phrase parlee.`,
    ].join("\n");
  }

  const parts = [
    `C'est ton tour. Tu es ${persona.name}. Round ${round} sur ${rounds}.`,
  ];

  if (last?.role === "animator") {
    parts.push(
      `L'ANIMATEUR VIENT DE T'INTERROMPRE. Tu reponds a son intervention des ton premier mot, avant toute autre chose. Sa question est prioritaire.`
    );
  } else if (history.length === 0) {
    parts.push(
      forecast
        ? `Tu ouvres le debat. Donne directement TA reponse a la question : un nom, un chiffre ou une date, puis pourquoi. Sans preambule et sans saluer personne.`
        : `Tu ouvres le debat. Pose directement TA proposition, concrete, sans preambule et sans saluer personne.`
    );
  } else {
    parts.push(
      `Deux mouvements, dans cet ordre, dans le meme paragraphe parle :`,
      `1) Tu dis pourquoi tu n'es pas d'accord avec un point PRECIS de ce qui vient d'etre dit, en nommant son auteur (NOVA, AXIOM ou KRACH).`,
      forecast
        ? `2) Tu donnes TA propre reponse a la question posee : un nom, un camp, un chiffre ou une date, plus le mecanisme et tes chances. Obligatoire. Contester la reponse de l'autre sans donner la tienne est interdit.`
        : `2) Tu poses TA propre proposition a la place : concrete, avec le premier geste. Obligatoire. Critiquer sans proposer est interdit.`
    );
  }

  if (forecast) {
    parts.push(
      `ATTENTION : c'est une question de PRONOSTIC. Le debat doit porter sur QUI ou QUOI, pas sur la facon dont la question est posee.`,
      `Interdit de repondre "personne ne peut savoir", "la vraie question est ailleurs", "le cadre va changer" sans avoir donne ta reponse avant.`,
      `Si les tours precedents ont derive vers le cadre au lieu de la question, tu le dis et tu ramenes le debat sur les noms.`
    );
  }

  if (round === rounds) {
    parts.push(`C'est le dernier round d'echange, mais ne conclus pas encore.`);
  }

  parts.push(
    `Rappel : 34 a 53 mots. Une objection, une proposition. Texte parle uniquement.`,
    `Vocabulaire simple et courant, comme dans une vraie conversation. Aucune tournure litteraire.`
  );
  return parts.join("\n");
}

/**
 * Genere une prise de parole. Renvoie { text, abort } : `abort` coupe le stream
 * en cours (utilise quand l'animateur interrompt).
 */
export function speak({ persona, topic, history, round, rounds, isFinal, onDelta }) {
  const controller = new AbortController();

  const promise = (async () => {
    const stream = getClient().messages.stream(
      {
        model: MODEL,
        max_tokens: 1500,
        output_config: { effort: EFFORT },
        thinking: { type: "adaptive" },
        system: [
          {
            type: "text",
            text: persona.system,
            cache_control: { type: "ephemeral" },
          },
        ],
        messages: [
          {
            role: "user",
            content: `${renderTranscript(topic, history)}\n\n---\n\n${buildInstruction(
              { persona, topic, round, rounds, history, isFinal }
            )}`,
          },
        ],
      },
      { signal: controller.signal }
    );

    if (onDelta) {
      stream.on("text", (delta) => onDelta(delta));
    }

    const message = await stream.finalMessage();

    if (message.stop_reason === "refusal") {
      throw new Error(`${persona.name} a refuse de repondre sur ce sujet.`);
    }

    return message.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim()
      .replace(/^["«\s]+|["»\s]+$/g, "")
      // Le modele glisse parfois son propre nom en tete malgre la consigne.
      .replace(new RegExp(`^${persona.name}\\s*[:\\-–]\\s*`, "i"), "");
  })();

  return { promise, abort: () => controller.abort() };
}
