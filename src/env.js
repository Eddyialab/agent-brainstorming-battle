import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

/**
 * Une fois installee comme plugin, l'arene ne tourne plus dans le dossier du
 * projet : `dotenv/config` (qui lit `${cwd}/.env`) ne suffit plus. On cherche
 * donc la configuration a plusieurs endroits, du plus explicite au plus global.
 * Les variables deja presentes dans l'environnement gagnent toujours.
 */
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const CONFIG_CANDIDATES = [
  process.env.ARENE_ENV_FILE,
  path.join(ROOT, ".env"),
  path.join(os.homedir(), ".claude", "arene.env"),
].filter(Boolean);

export const loadedFrom = [];

for (const file of CONFIG_CANDIDATES) {
  if (!fs.existsSync(file)) continue;
  dotenv.config({ path: file, override: false, quiet: true });
  loadedFrom.push(file);
}
