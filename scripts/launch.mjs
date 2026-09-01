#!/usr/bin/env node
/**
 * Lanceur du plugin. Une fois l'arene installee dans ~/.claude/plugins/, le
 * repertoire courant n'est plus celui du projet : ce script se repere tout seul,
 * installe les dependances au premier lancement, puis demarre le serveur.
 *
 *   node scripts/launch.mjs            installe si besoin, lance, ouvre le navigateur
 *   node scripts/launch.mjs --no-open  idem sans ouvrir le navigateur
 *   node scripts/launch.mjs --check    n'allume rien : dit juste ce qui manque
 *
 * Options d'ouverture : --topic="..." --rounds=4 --demo
 */
import fs from "node:fs";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { CONFIG_CANDIDATES, loadedFrom } from "../src/env.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const WIN = process.platform === "win32";
const NPM = WIN ? "npm.cmd" : "npm";
const argv = process.argv.slice(2);
const args = new Set(argv);
const flag = (name) => {
  const hit = argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : null;
};
const PORT = Number(process.env.PORT || 4173);

function report() {
  const lines = [
    `  Dossier    : ${ROOT}`,
    `  Config lue : ${loadedFrom.length ? loadedFrom.join(", ") : "aucune (variables d'environnement seules)"}`,
    `  Cle Claude : ${process.env.ANTHROPIC_API_KEY ? "OK" : "MANQUANTE"}`,
    `  ElevenLabs : ${process.env.ELEVENLABS_API_KEY ? "OK (voix + micro)" : "absente (mode sous-titres)"}`,
    `  Port       : ${PORT}`,
  ];
  console.log(lines.join("\n"));
}

if (!process.env.ANTHROPIC_API_KEY) {
  report();
  console.error(
    [
      "",
      "  ANTHROPIC_API_KEY absente. Ajoute-la dans l'un de ces fichiers :",
      ...CONFIG_CANDIDATES.map((f) => `    ${f}`),
      "",
      "  Format : ANTHROPIC_API_KEY=sk-ant-...",
      "",
    ].join("\n")
  );
  process.exit(1);
}

if (args.has("--check")) {
  report();
  console.log(
    `  Dependances: ${fs.existsSync(path.join(ROOT, "node_modules")) ? "installees" : "a installer au premier lancement"}`
  );
  process.exit(0);
}

if (!fs.existsSync(path.join(ROOT, "node_modules"))) {
  console.log("  Premier lancement : installation des dependances...\n");
  const install = spawnSync(NPM, ["install", "--omit=dev", "--no-audit", "--no-fund"], {
    cwd: ROOT,
    stdio: "inherit",
    shell: WIN,
  });
  if (install.status !== 0) {
    console.error("\n  L'installation a echoue. Lance `npm install` a la main dans :\n  " + ROOT);
    process.exit(install.status ?? 1);
  }
}

if (!args.has("--no-open")) {
  const query = new URLSearchParams();
  if (flag("topic")) query.set("topic", flag("topic"));
  if (flag("rounds")) query.set("rounds", flag("rounds"));
  if (args.has("--demo")) query.set("demo", "1");
  const url = `http://localhost:${PORT}${query.size ? `?${query}` : ""}`;
  // Laisse au serveur le temps d'ouvrir le port avant d'y envoyer le navigateur.
  setTimeout(() => {
    const [cmd, cmdArgs] = WIN
      ? ["cmd", ["/c", "start", "", url]]
      : process.platform === "darwin"
        ? ["open", [url]]
        : ["xdg-open", [url]];
    try {
      spawn(cmd, cmdArgs, { detached: true, stdio: "ignore" }).unref();
    } catch {
      /* pas de navigateur : l'URL est de toute facon affichee par le serveur */
    }
  }, 1200);
}

const server = spawn(process.execPath, [path.join(ROOT, "server.js")], {
  cwd: ROOT,
  stdio: "inherit",
  env: process.env,
});
server.on("exit", (code) => process.exit(code ?? 0));
for (const sig of ["SIGINT", "SIGTERM"]) process.on(sig, () => server.kill(sig));
