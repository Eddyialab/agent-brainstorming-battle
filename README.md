# L'Arène — V1

Trois IA aux grilles de lecture orthogonales débattent d'un sujet, à voix haute,
à tour de rôle, dans une arène HTML pensée pour la capture vidéo. Tu peux les
couper à tout moment : elles rebondissent immédiatement.

Les trois sont force de proposition. À chaque tour, chacun casse un point précis
de ce qui vient d'être dit **puis pose sa propre solution à la place** : démonter
sans proposer est interdit. Ce qui les sépare, c'est ce sur quoi ils fondent leur
proposition.

| | Axe | Rôle | Sa proposition s'appuie sur |
|---|---|---|---|
| **NOVA** | Le désir | L'architecte du possible | Ce qui vient de devenir possible — le coup ambitieux, le premier geste dès lundi |
| **AXIOM** | La preuve | Le juge des faits | Les précédents et les taux de base — la version déjà vérifiée, chiffrée |
| **KRACH** | Le danger | Le briseur | Le point de casse et celui qui va bloquer — la version qui tient, plus petite, dans l'autre ordre |

## Installer comme plugin Claude Code

Dans Claude Code :

```
/plugin marketplace add Eddyialab/agent-brainstorming-battle
/plugin install arene@agent-brainstorming-battle
```

Puis colle tes clés dans `~/.claude/arene.env` :

```
ANTHROPIC_API_KEY=sk-ant-...
ELEVENLABS_API_KEY=...
```

`ELEVENLABS_API_KEY` est facultative : sans elle, l'arène tourne en mode
sous-titres, sans voix, et l'interruption micro est désactivée.

Enfin :

```
/arene faut-il rendre le télétravail obligatoire ?
```

Le premier lancement installe les dépendances npm, ouvre
<http://localhost:4173> et remplit le sujet. Il ne reste qu'à cliquer
**Lancer**.

Le plugin apporte aussi une skill `arene` : demande simplement « change la
personnalité de Krach » ou « l'arène ne démarre pas » et Claude sait quoi faire.

## Démarrer sans passer par le plugin

1. Colle tes clés dans `.env` (copie `.env.example`).

2. Lance :

```bash
npm start          # ou : node scripts/launch.mjs  (installe + ouvre le navigateur)
```

3. Ouvre <http://localhost:4173>.

La configuration est cherchée dans cet ordre, sans jamais écraser une variable
déjà présente dans l'environnement : `$ARENE_ENV_FILE`, puis le `.env` du
dossier, puis `~/.claude/arene.env`.

## Utiliser

- **Sujet + nombre de rounds** sur l'écran de lancement. Un round = chaque IA
  parle une fois. 4 rounds ≈ 5 minutes de vidéo.
- **Couper la parole** : écris dans la barre du bas, Entrée. L'audio s'arrête net,
  ton message entre dans la transcription, et le robot qui parlait te répond
  immédiatement avant que l'ordre normal reprenne.
- **Couper la parole à la voix** : appuie une fois sur la barre **Espace** (ou
  clique « Parler ») — le bouton passe au rouge « Envoyer » et la voix du robot
  se met en pause. Tu parles. Tu appuies une seconde fois pour envoyer. Ta
  phrase est transcrite par ElevenLabs Scribe puis coupe le débat exactement
  comme un message écrit. `Échap` annule sans rien envoyer, et au bout de
  15 secondes l'envoi part tout seul.
- **Viser un robot** : commence par `@krach`, `@nova` ou `@axiom`. À la voix,
  « Krach, et le coût de support ? » fait la même chose.
- **Touche `H`** : masque l'habillage (barre du haut, barre animateur) pour
  enregistrer une image propre sous OBS.
- **`?demo=1`** : rejoue un débat scripté sans appeler aucune API. Sert à régler
  le cadrage et l'habillage sans dépenser un centime.

## Régler les personnalités

Tout est dans `personas/<robot>/SKILL.md`. Le frontmatter porte la couleur, la
voix et l'illustration ; le corps markdown est injecté tel quel comme prompt
système. `personas/_rules.md` contient les règles communes (longueur des prises
de parole, obligation de nommer un adversaire, comportement face à l'animateur) —
c'est le fichier à toucher pour changer le rythme du débat.

Redémarre le serveur après modification. Ajouter un dossier dans `personas/`
ajoute un quatrième débatteur, sans toucher au code.

## Remplacer les illustrations (V2)

Dépose tes fichiers dans `public/robots/` et change une seule ligne dans le
SKILL.md concerné :

```yaml
image: robots/nova.png
```

Les `.svg` sont injectés inline (ils prennent la couleur du persona) ; les `.png`
et `.jpg` sont affichés en `<img>`. Fond transparent recommandé, ~1000 px de haut.

## Réglages

Dans `.env` :

| Variable | Défaut | Effet |
|---|---|---|
| `DEBATE_MODEL` | `claude-opus-5` | `claude-haiku-4-5` pour un mode turbo (plus rapide, plus plat) |
| `DEBATE_EFFORT` | `low` | Profondeur de réflexion. `medium` pour des répliques plus fouillées, au prix de la latence |
| `ELEVENLABS_MODEL` | `eleven_flash_v2_5` | Le modèle le plus rapide (~75 ms) |
| `PORT` | `4173` | |

## Comment la latence est masquée

L'ordre de parole est déterministe, donc dès qu'un robot a fini de **générer**,
le suivant commence à réfléchir **pendant que le premier parle**. Les ~20 s de
voix couvrent entièrement la génération suivante : l'enchaînement se fait sans
blanc. Une interruption invalide simplement le tour préchargé.

Seule la toute première prise de parole du débat n'a rien pour masquer sa
latence — d'où l'état « réfléchit » sur le premier robot.

## Coût indicatif

Un débat de 4 rounds (15 prises de parole) : environ **0,60 à 0,70 $** d'API
Claude et **~11 000 caractères** ElevenLabs.

## Structure

```
.claude-plugin/        manifeste du plugin + marketplace
commands/arene.md      la commande /arene
skills/arene/          la skill que Claude lit pour régler et dépanner l'arène
scripts/launch.mjs     lanceur du plugin (installe, démarre, ouvre le navigateur)
server.js              HTTP + WebSocket + proxy audio
src/env.js             résolution de la configuration (.env, ~/.claude/arene.env)
src/personas.js        chargement des SKILL.md
src/claude.js          génération d'une prise de parole (streaming, abandonnable)
src/tts.js             proxy streaming ElevenLabs
src/stt.js             transcription du micro animateur
src/orchestrator.js    tours, rounds, prefetch, interruption
personas/              une skill par robot
public/                l'arène
```
