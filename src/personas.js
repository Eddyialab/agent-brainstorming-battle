import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PERSONA_DIR = path.join(ROOT, "personas");

/**
 * Frontmatter volontairement plat (pas de YAML imbrique) pour rester parsable
 * en vingt lignes et sans dependance. Chaque robot est un dossier contenant un
 * SKILL.md ; ajouter un dossier suffit a ajouter un debatteur.
 */
function parseFrontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { meta: {}, body: raw.trim() };

  const meta = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z0-9_]+)\s*:\s*(.*)$/);
    if (!kv) continue;
    let value = kv[2].trim().replace(/^["']|["']$/g, "");
    if (value === "") value = null;
    else if (/^-?\d+(?:\.\d+)?$/.test(value)) value = Number(value);
    else if (value === "true" || value === "false") value = value === "true";
    meta[kv[1]] = value;
  }
  return { meta, body: m[2].trim() };
}

export function loadPersonas() {
  const rules = fs.readFileSync(path.join(PERSONA_DIR, "_rules.md"), "utf8").trim();

  const personas = fs
    .readdirSync(PERSONA_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith("_"))
    .map((d) => {
      const file = path.join(PERSONA_DIR, d.name, "SKILL.md");
      const { meta, body } = parseFrontmatter(fs.readFileSync(file, "utf8"));
      return {
        id: d.name,
        name: meta.name ?? d.name.toUpperCase(),
        title: meta.title ?? "",
        axis: meta.axis ?? "",
        color: meta.color ?? "#9AA5B1",
        order: meta.order ?? 99,
        image: meta.image ?? null,
        // Ce que la transcription du micro peut renvoyer a la place du nom :
        // Scribe entend « Crac » pour KRACH. Liste separee par des virgules.
        aliases: String(meta.voice_aliases ?? "")
          .split(",")
          .map((a) => a.trim().toLowerCase())
          .filter(Boolean),
        voice: {
          id: meta.voice_id ?? null,
          stability: meta.stability ?? 0.5,
          similarity_boost: meta.similarity ?? 0.75,
          style: meta.style ?? 0.3,
          speed: meta.speed ?? 1,
        },
        // Le prompt systeme est stable d'un tour a l'autre : c'est lui qu'on met
        // en cache cote API. Toute la partie volatile vit dans le message user.
        system: `${body}\n\n---\n\n${rules}`,
      };
    })
    .sort((a, b) => a.order - b.order);

  if (personas.length < 2) {
    throw new Error("Il faut au moins deux personas dans /personas pour un debat.");
  }
  return personas;
}

/** Version allegee envoyee au navigateur (jamais le prompt systeme). */
export function publicPersona(p) {
  return {
    id: p.id,
    name: p.name,
    title: p.title,
    axis: p.axis,
    color: p.color,
    image: p.image,
    aliases: p.aliases,
  };
}
