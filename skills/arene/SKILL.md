---
name: arene
description: Lance, règle et dépanne L'Arène — le débat à trois IA (NOVA, AXIOM, KRACH) qui parlent à voix haute et qu'on peut couper au clavier ou au micro. À utiliser quand l'utilisateur dit "l'arène", "lance un débat", "fais débattre les robots", "brainstorming battle", veut changer une personnalité, ajouter un quatrième débatteur, remplacer une illustration, régler les voix, ou quand l'arène ne démarre pas.
---

# L'Arène

Trois IA aux grilles de lecture orthogonales débattent d'un sujet, à voix haute,
à tour de rôle, dans une arène HTML pensée pour la capture vidéo (OBS).

| | Axe | Sa proposition s'appuie sur |
|---|---|---|
| **NOVA** | Le désir | Ce qui vient de devenir possible — le coup ambitieux |
| **AXIOM** | La preuve | Les précédents et les taux de base — la version chiffrée |
| **KRACH** | Le danger | Le point de casse — la version qui tient, plus petite |

Chacun casse un point précis de ce qui vient d'être dit **puis pose sa propre
solution** : démonter sans proposer est interdit.

## Lancer

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/launch.mjs" --check              # diagnostic seul
node "${CLAUDE_PLUGIN_ROOT}/scripts/launch.mjs"                      # lance + ouvre le navigateur
node "${CLAUDE_PLUGIN_ROOT}/scripts/launch.mjs" --topic="..." --rounds=4
node "${CLAUDE_PLUGIN_ROOT}/scripts/launch.mjs" --demo               # débat scripté, aucune API appelée
```

Lance toujours **en tâche de fond** : le serveur tourne tant que le débat dure.
Le premier lancement installe les dépendances npm.

## Configurer les clés

Le lanceur lit, dans l'ordre et sans écraser l'environnement déjà présent :

1. le fichier désigné par `ARENE_ENV_FILE` ;
2. `<dossier du plugin>/.env` ;
3. `~/.claude/arene.env`.

**C'est `~/.claude/arene.env` qu'il faut privilégier** : il survit aux mises à
jour du plugin, contrairement au `.env` du dossier d'installation.

```
ANTHROPIC_API_KEY=sk-ant-...     # obligatoire
ELEVENLABS_API_KEY=...           # sans elle : mode sous-titres, micro désactivé
PORT=4173
DEBATE_MODEL=claude-opus-5       # claude-haiku-4-5 pour un mode turbo
DEBATE_EFFORT=low                # medium = répliques plus fouillées, plus lentes
ELEVENLABS_MODEL=eleven_flash_v2_5
ELEVENLABS_STT_MODEL=scribe_v1
```

Ne fabrique jamais une clé : si elle manque, donne la ligne à coller et le
chemin du fichier, puis arrête-toi.

## Piloter le débat

- **Sujet + nombre de rounds** sur l'écran de lancement. Un round = chaque IA
  parle une fois. 4 rounds ≈ 5 minutes de vidéo.
- **Couper la parole au clavier** : écrire dans la barre du bas, Entrée.
  L'audio s'arrête net et le robot qui parlait répond immédiatement.
- **Couper la parole à la voix** : barre **Espace** une fois pour parler, une
  seconde fois pour envoyer. `Échap` annule, 15 s envoie tout seul.
- **Viser un robot** : `@krach`, `@nova`, `@axiom` — ou « Krach, et le coût… »
  à la voix.
- **`H`** masque l'habillage pour une capture OBS propre.
- **`?demo=1`** rejoue un débat scripté sans appeler aucune API.

## Régler les personnalités

Tout est dans `personas/<robot>/SKILL.md` du dossier du plugin. Le frontmatter
plat porte la couleur, la voix et l'illustration ; le corps markdown est injecté
tel quel comme prompt système.

| Clé | Effet |
|---|---|
| `name` / `title` / `axis` | Identité affichée |
| `color` | Couleur du persona dans l'arène |
| `order` | Ordre de parole |
| `image` | `robots/x.png` — les `.svg` héritent de la couleur, les `.png` sont affichés tels quels |
| `voice_id` | Voix ElevenLabs |
| `stability` / `similarity` / `style` / `speed` | Réglages de la voix |
| `voice_aliases` | Ce que le micro peut entendre à la place du nom (Scribe entend « Crac » pour KRACH) |

`personas/_rules.md` porte les règles communes — longueur des prises de parole,
obligation de nommer un adversaire, comportement face à l'animateur. **C'est le
fichier à toucher pour changer le rythme du débat**, pas les personas.

Ajouter un dossier dans `personas/` ajoute un quatrième débatteur, sans toucher
au code. Il faut au moins deux personas. **Redémarre le serveur après toute
modification** : les personas sont chargées une seule fois au démarrage.

## Dépanner

| Symptôme | Cause |
|---|---|
| « ANTHROPIC_API_KEY absente » | Aucun des trois fichiers de config n'a la clé — voir `--check` |
| Aucune voix, sous-titres seuls | `ELEVENLABS_API_KEY` absente — c'est le comportement normal |
| Barre Espace sans effet | Idem : pas de clé ElevenLabs, donc pas de transcription |
| Le port 4173 est pris | `PORT=4174` dans `~/.claude/arene.env` |
| Une modif de persona n'apparaît pas | Le serveur n'a pas été redémarré |
| Premier robot bloqué sur « réfléchit » | Normal : c'est la seule prise de parole dont la latence n'est masquée par rien |

## Coût

Un débat de 4 rounds (15 prises de parole) : environ **0,60 à 0,70 $** d'API
Claude et **~11 000 caractères** ElevenLabs. Le mode `--demo` ne coûte rien.
