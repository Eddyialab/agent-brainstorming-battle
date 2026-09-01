---
description: Ouvre L'Arène — trois IA débattent à voix haute du sujet donné, tu peux les couper à tout moment.
argument-hint: [sujet du débat]
allowed-tools: Bash, Read, Glob
---

Lance L'Arène et rends la main.

1. Vérifie la configuration sans rien allumer :

   `node "${CLAUDE_PLUGIN_ROOT}/scripts/launch.mjs" --check`

   Si `ANTHROPIC_API_KEY` est manquante, arrête-toi là : dis à l'utilisateur
   d'ajouter sa clé dans `~/.claude/arene.env` (le fichier est listé dans la
   sortie de `--check`), donne-lui la ligne exacte à coller, et n'invente pas
   de clé.

2. Démarre le serveur **en tâche de fond** (il tourne tant que le débat dure) :

   `node "${CLAUDE_PLUGIN_ROOT}/scripts/launch.mjs" --topic="$ARGUMENTS"`

   Omets `--topic` si l'utilisateur n'a rien précisé. Le premier lancement
   installe les dépendances npm : c'est normal que ça prenne une minute.

3. Le navigateur s'ouvre tout seul sur `http://localhost:4173`. Donne l'URL en
   secours, rappelle en une ligne les trois commandes utiles — **Espace** pour
   couper la parole à la voix, `@krach` / `@nova` / `@axiom` pour viser un
   robot, `H` pour masquer l'habillage — puis arrête-toi. Le débat se pilote
   dans le navigateur, pas dans le terminal.

Si l'utilisateur veut voir à quoi ça ressemble sans dépenser d'API, ajoute
`--demo` : un débat scripté se rejoue hors ligne.
