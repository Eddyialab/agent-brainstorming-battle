# L'Arène

**Trois IA débattent d'un sujet, à voix haute, sous tes yeux. Tu peux leur couper
la parole quand tu veux.**

Tu tapes une question. Trois robots aux façons de penser opposées s'affrontent
pendant cinq minutes pour y répondre. Chacun démolit un point de ce que vient de
dire le précédent, puis pose sa propre solution à la place. Toi, tu es
l'animateur : tu écris ou tu parles dans le micro, et le débat s'arrête net pour
te répondre.

C'est fait pour être filmé (OBS, capture d'écran), mais ça marche aussi très bien
juste pour t'aider à réfléchir à une décision.

|  | Son axe | Sa proposition s'appuie sur |
|---|---|---|
| **NOVA** — l'architecte du possible | Le désir | Ce qui vient de devenir possible : le coup ambitieux, le premier geste dès lundi |
| **AXIOM** — le juge des faits | La preuve | Les précédents et les chiffres : la version déjà vérifiée |
| **KRACH** — le briseur | Le danger | Le point de casse : la version plus petite, qui tient |

Les trois sont obligés de **proposer**. Démonter sans rien mettre à la place est
interdit par leurs règles.

---

# Sommaire

- [Ce qu'il te faut](#ce-quil-te-faut)
- [Installation — 6 étapes](#installation--6-étapes)
  - [1. Installer Node.js](#1-installer-nodejs)
  - [2. Installer VS Code](#2-installer-vs-code)
  - [3. Installer le plugin](#3-installer-le-plugin)
  - [4. Ouvrir le dossier dans VS Code](#4-ouvrir-le-dossier-dans-vs-code)
  - [5. Créer le fichier `.env` avec tes clés](#5-créer-le-fichier-env-avec-tes-clés)
  - [6. Ouvrir le terminal et lancer](#6-ouvrir-le-terminal-et-lancer)
- [Éteindre et relancer](#éteindre-et-relancer)
- [Utiliser l'Arène](#utiliser-larène)
- [Régler les personnalités](#régler-les-personnalités)
- [Tous les réglages](#tous-les-réglages)
- [Combien ça coûte](#combien-ça-coûte)
- [Ça ne marche pas](#ça-ne-marche-pas)
- [Pour les curieux](#pour-les-curieux)

---

# Ce qu'il te faut

**Du temps :** 15 minutes la première fois. 10 secondes les fois suivantes.

**Un ordinateur** Windows, Mac ou Linux. Pas de téléphone : l'Arène est un petit
programme qui tourne sur ta machine.

**Claude Code**, déjà installé — c'est lui qui télécharge l'Arène, en deux
commandes, à l'étape 3.

**Une clé API Anthropic** — c'est ce qui fait penser les robots. Obligatoire.
C'est une longue suite de caractères qui commence par `sk-ant-`.

> ⚠️ **Le piège numéro un.** Un abonnement Claude Pro ou Max **ne donne pas** de
> clé API. Ce sont deux produits séparés, facturés séparément. La clé se prend
> sur <https://console.anthropic.com> et il faut y mettre du crédit — 5 $
> suffisent pour une quinzaine de débats. L'étape 5 explique où cliquer.

**Une clé API ElevenLabs** — c'est ce qui donne une *voix* aux robots.
Facultative. Sans elle, l'Arène tourne quand même : les robots écrivent au lieu
de parler, et l'interruption au micro est désactivée. Tu peux commencer sans et
l'ajouter plus tard.

**Aucune connaissance en informatique.** Tu vas taper quatre commandes en tout :
deux dans Claude Code, deux dans le terminal. Elles sont écrites en toutes
lettres, tu n'as qu'à les copier.

---

# Installation — 6 étapes

Lis chaque étape en entier avant de la faire. Il n'y a rien de risqué : tu
n'installes que des logiciels standards et tu ne touches à rien de ton système.

## 1. Installer Node.js

Node.js, c'est ce qui permet à ton ordinateur d'exécuter le code de l'Arène.
Sans lui, rien ne démarre.

1. Va sur <https://nodejs.org>
2. Clique sur le gros bouton marqué **LTS** — ça veut dire « version stable ».
   Prends celle-là, pas l'autre.
3. Ouvre le fichier téléchargé et clique **Suivant** jusqu'au bout, sans rien
   changer. Les réglages par défaut sont les bons.
4. **Redémarre ton ordinateur.** Oui, vraiment. Sinon la suite ne trouvera pas
   Node et tu vas perdre dix minutes à te demander pourquoi.

## 2. Installer VS Code

VS Code, c'est le logiciel dans lequel tu vas ouvrir le dossier de l'Arène. Il
sert à deux choses : écrire tes clés dans un fichier, et te fournir un terminal
sans que tu aies à en chercher un.

1. Va sur <https://code.visualstudio.com>
2. Clique sur le bouton de téléchargement — il détecte ton système tout seul.
3. Installe.
4. Lance-le. Il est en anglais au départ ; une bulle en bas à droite te proposera
   le français, accepte si tu préfères.

## 3. Installer le plugin

C'est ce qui télécharge l'Arène sur ta machine. Ça se fait depuis Claude Code,
en deux commandes.

Ouvre Claude Code et tape ces deux lignes, l'une après l'autre, en appuyant sur
`Entrée` entre les deux :

```
/plugin marketplace add Eddyialab/agent-brainstorming-battle
```

```
/plugin install arene@agent-brainstorming-battle
```

C'est tout. L'Arène est maintenant sur ton disque, dans ce dossier :

| | Chemin du dossier |
|---|---|
| **Windows** | `%USERPROFILE%\.claude\plugins\marketplaces\agent-brainstorming-battle` |
| **Mac / Linux** | `~/.claude/plugins/marketplaces/agent-brainstorming-battle` |

**Copie la ligne qui correspond à ton système**, tu la colles à l'étape
suivante. (`%USERPROFILE%` et `~` sont des raccourcis vers ton dossier
personnel : inutile de les remplacer par ton nom, ton ordinateur comprend.)

## 4. Ouvrir le dossier dans VS Code

C'est ici que les gens se trompent le plus souvent, alors lis bien : il faut
ouvrir **le dossier**, pas un fichier.

1. Dans VS Code : menu **Fichier** → **Ouvrir le dossier…**
   *(File → Open Folder… en anglais)*
2. Une fenêtre s'ouvre. Plutôt que de chercher à la souris, **colle directement
   le chemin de l'étape 3** :
   - **Windows** — colle-le dans le champ **« Nom du fichier »** en bas, puis
     `Entrée`.
   - **Mac** — appuie sur `Cmd` + `Maj` + `G`, colle-le, puis `Entrée`.
3. Clique sur **Sélectionner un dossier**.
4. S'il demande *« Faites-vous confiance aux auteurs de ce dossier ? »*, réponds
   **Oui, je fais confiance**. Sans ça, le terminal sera bridé.

**Comment savoir que c'est bon :** dans la colonne de gauche, tu vois la liste
des fichiers du projet — `server.js`, `package.json`, `README.md`, et des
dossiers `personas`, `public`, `src`. Si tu ne vois qu'un seul fichier, tu as
ouvert un fichier au lieu du dossier. Recommence.

## 5. Créer le fichier `.env` avec tes clés

Le fichier `.env` est l'endroit où tu ranges tes clés API. Il n'existe pas
encore : tu vas le créer, directement dans VS Code.

> **Fais-le depuis VS Code, jamais depuis l'explorateur de fichiers.** Sur
> Windows, l'explorateur cache les extensions et crée silencieusement un
> `.env.txt` qui ne marchera pas. C'est le grand classique.

### a) Va chercher tes clés

**Anthropic** *(obligatoire)*

1. <https://console.anthropic.com> → crée un compte ou connecte-toi.
2. Onglet **Billing** → ajoute **5 $** de crédit. Sans crédit, la clé existe
   mais ne fonctionne pas.
3. Onglet **API Keys** → **Create Key**. Nomme-la `arene`.
4. **Copie-la immédiatement.** Elle commence par `sk-ant-` et ne te sera plus
   jamais réaffichée.

**ElevenLabs** *(facultatif, pour la voix)*

1. <https://elevenlabs.io> → crée un compte. Le palier gratuit suffit pour
   essayer.
2. Ton avatar en haut à droite → **API Keys** → crée une clé, copie-la.

### b) Crée le fichier

1. Dans la colonne de gauche de VS Code, survole le nom du projet et clique sur
   la petite **icône « nouveau fichier »** (une feuille avec un `+`).
2. Tape exactement ce nom, puis `Entrée` :

   ```
   .env
   ```

   Rien d'autre. Le point au début fait partie du nom.

3. Le fichier s'ouvre, vide. Colle ces deux lignes en remplaçant par tes vraies
   clés :

   ```
   ANTHROPIC_API_KEY=sk-ant-ta-vraie-cle-ici
   ELEVENLABS_API_KEY=ta-vraie-cle-elevenlabs-ici
   ```

   **Pas d'espace autour du `=`. Pas de guillemets autour de la clé.** Une ligne
   par clé. Si tu n'as pas de clé ElevenLabs, laisse la ligne vide après le `=`,
   ou supprime-la.

4. **Enregistre** : `Ctrl` + `S` (`Cmd` + `S` sur Mac). Tant qu'un petit rond
   blanc apparaît à côté du nom de l'onglet, c'est que ce n'est pas enregistré.

> Le fichier `.env.example`, déjà présent dans le dossier, liste tous les
> réglages possibles avec leurs valeurs par défaut. Tu peux t'en inspirer, mais
> les deux lignes ci-dessus suffisent pour démarrer.

> 🔒 Ces clés sont des mots de passe. Ne les mets jamais dans un message, une
> capture d'écran ou une vidéo. Le fichier `.env` est exclu du partage par
> défaut, c'est exactement son rôle.

## 6. Ouvrir le terminal et lancer

Le terminal, c'est une zone où tu tapes des commandes au lieu de cliquer sur des
boutons. C'est tout. Tu ne peux rien casser avec les deux commandes qui suivent.

Dans VS Code : menu **Terminal** → **Nouveau terminal**.
*(Raccourci : `Ctrl` + `ù` sur clavier français, `Ctrl` + `` ` `` sur clavier
anglais, `Cmd` + `` ` `` sur Mac.)*

Un panneau s'ouvre en bas. Il est déjà positionné dans le bon dossier, tu n'as
rien à faire de plus.

**Première commande** — elle télécharge les briques de code dont l'Arène a
besoin. Tape-la et appuie sur `Entrée` :

```bash
npm install
```

Ça mouline entre 30 secondes et 2 minutes, avec beaucoup de texte qui défile.
C'est normal. C'est fini quand le curseur revient et que tu peux taper à
nouveau. **Les lignes jaunes `warn` ne sont pas des erreurs**, ignore-les.

**Deuxième commande** — celle qui lance l'Arène :

```bash
npm run start
```

Et voilà : **ton navigateur s'ouvre tout seul sur l'Arène.** Si jamais il ne
s'ouvre pas, va sur <http://localhost:4173> à la main.

Dans le terminal, tu dois voir :

```
  L'ARENE  —  http://localhost:4173

  Debatteurs : NOVA  vs  AXIOM  vs  KRACH
  Modele     : claude-opus-5 (effort low)
  Cle Claude : OK
  Voix       : eleven_flash_v2_5
  Micro      : scribe_v1 (barre Espace pour couper la parole)
```

> **Laisse le terminal ouvert.** Tant que l'Arène tourne, il affiche du texte et
> n'accepte plus de commandes : ce n'est pas planté, c'est normal. Si tu le
> fermes, l'Arène s'éteint et ton navigateur affiche une page d'erreur.

> `localhost`, ça veut dire « ma propre machine ». La page n'est visible que par
> toi ; seuls les appels aux IA sortent sur internet.

---

# Éteindre et relancer

**Éteindre :** clique dans le terminal, puis `Ctrl` + `C` (même sur Mac :
`Ctrl`, pas `Cmd`). Le curseur revient, c'est éteint.

**Relancer plus tard**, il ne reste que deux gestes :

1. Ouvrir le dossier dans VS Code — il est dans **Fichier → Ouvrir les
   récents**.
2. `Ctrl` + `ù` pour le terminal, puis `npm run start`.

Pas besoin de refaire `npm install`, ni de retoucher au `.env`. Dix secondes.

---

# Utiliser l'Arène

## Lancer un débat

Sur l'écran d'accueil :

- **Le sujet** : écris ta question. Les meilleurs sujets sont ceux où il n'y a
  pas de bonne réponse évidente — *« faut-il que j'arrête mon CDI pour lancer ma
  boîte ? »* donnera un bien meilleur débat que *« quelle est la capitale de la
  France ? »*.
- **Le nombre de rounds** : un round = chaque robot parle une fois. 4 rounds ≈
  5 minutes. Commence par 2 pour tester, ça coûtera moins cher.
- **Lancer le débat.**

Le premier robot affiche « réfléchit » quelques secondes. C'est normal et ça
n'arrive qu'une fois : ensuite, chaque robot prépare sa réponse pendant que le
précédent parle, donc plus aucun blanc.

## Couper la parole

C'est tout l'intérêt du truc. Trois façons :

**En écrivant** — clique dans la barre du bas, tape ta remarque, `Entrée`. La
voix s'arrête immédiatement, ton message entre dans le débat, et le robot qui
parlait te répond avant que le tour normal reprenne.

**En parlant** — appuie une fois sur la **barre Espace** (ou clique sur
« Parler »). Le bouton passe au rouge, la voix se met en pause, tu parles. Tu
appuies une seconde fois pour envoyer. `Échap` annule sans rien envoyer, et au
bout de 15 secondes l'envoi part tout seul.

> Ton navigateur demandera l'autorisation d'utiliser le micro la première fois :
> accepte, sinon rien ne sera enregistré. *(Nécessite une clé ElevenLabs.)*

**En visant un robot précis** — commence ton message par `@nova`, `@axiom` ou
`@krach`. À la voix, dis simplement *« Krach, et le coût de support ? »*, il
comprend.

## Pour filmer

- **Touche `H`** : masque toute l'interface — barre du haut, barre animateur —
  pour une image propre sous OBS. Rappuie sur `H` pour la faire revenir.
- **`?demo=1`** : va sur <http://localhost:4173/?demo=1> pour rejouer un débat
  pré-écrit sans appeler aucune IA. Idéal pour régler ton cadrage sans dépenser
  un centime — et pour voir à quoi ça ressemble avant même d'avoir une clé.

---

# Régler les personnalités

Tu peux réécrire complètement les robots. C'est même le plus amusant.

Tout est dans le dossier `personas/`, avec un sous-dossier par robot contenant un
fichier `SKILL.md`. Ouvre `personas/krach/SKILL.md` dans VS Code pour voir à quoi
ça ressemble.

Chaque fichier a deux parties. **En haut, entre les deux lignes de tirets**, les
réglages :

| Réglage | Ce qu'il fait |
|---|---|
| `name`, `title`, `axis` | Le nom et la description affichés à l'écran |
| `color` | Sa couleur dans l'Arène (code hexadécimal, ex. `"#00E5FF"`) |
| `order` | Son ordre de passage — 1 parle en premier |
| `image` | Son illustration, ex. `robots/nova.png` |
| `voice_id` | Sa voix ElevenLabs — l'identifiant se copie depuis leur bibliothèque de voix |
| `stability`, `similarity`, `style`, `speed` | Le grain et le rythme de la voix |
| `voice_aliases` | Ce que le micro peut entendre à la place du nom — la transcription entend souvent « Crac » pour KRACH |

**En dessous**, tout le texte est envoyé tel quel au robot comme instructions.
Écris-y ce que tu veux, en français, à la deuxième personne. C'est de la prose,
pas du code : tu ne peux rien casser.

Le fichier `personas/_rules.md` contient les règles communes aux trois — longueur
des prises de parole, obligation de citer un adversaire, comportement face à
l'animateur. **C'est celui-là qu'il faut modifier pour changer le rythme du
débat**, pas les personas.

**Ajouter un quatrième robot :** duplique un dossier dans `personas/`,
renomme-le, modifie son `SKILL.md`. Aucun code à toucher. Il en faut au minimum
deux.

**Remplacer une illustration :** dépose ton image dans `public/robots/` et change
la ligne `image:` du `SKILL.md` concerné. Les `.png` et `.jpg` sont affichés tels
quels ; les `.svg` prennent automatiquement la couleur du persona. Fond
transparent recommandé, environ 1000 px de haut.

> ⚠️ **Après chaque modification, redémarre** : `Ctrl` + `C`, puis
> `npm run start`. Les personnalités sont lues une seule fois, au démarrage —
> recharger la page du navigateur ne suffit pas.

---

# Tous les réglages

Dans le fichier `.env` :

| Variable | Défaut | Ce que ça change |
|---|---|---|
| `ANTHROPIC_API_KEY` | — | **Obligatoire.** Sans elle, aucun débat ne démarre |
| `ELEVENLABS_API_KEY` | — | Facultative. Sans elle : pas de voix, pas de micro |
| `PORT` | `4173` | L'adresse de l'Arène. À changer si le port est déjà pris |
| `DEBATE_MODEL` | `claude-opus-5` | Le cerveau des robots. `claude-haiku-4-5` = mode turbo : plus rapide et bien moins cher, mais plus plat |
| `DEBATE_EFFORT` | `low` | Profondeur de réflexion. `medium` donne des répliques plus fouillées, mais plus lentes et plus chères |
| `ELEVENLABS_MODEL` | `eleven_flash_v2_5` | Le modèle de voix. `flash` est le plus rapide (~75 ms) |
| `ELEVENLABS_STT_MODEL` | `scribe_v1` | Le modèle qui transcrit ton micro |

Redémarre après chaque changement.

---

# Combien ça coûte

Un débat de 4 rounds, soit 15 prises de parole :

| | Coût |
|---|---|
| API Claude (`claude-opus-5`, effort `low`) | **0,60 à 0,70 $** |
| ElevenLabs | ~11 000 caractères |
| Mode `?demo=1` | **0 €** |

Pour dépenser beaucoup moins : mets `DEBATE_MODEL=claude-haiku-4-5` dans ton
`.env`. Les robots deviennent plus rapides et nettement moins chers, au prix
d'un débat un peu moins profond.

Surveille ta consommation sur <https://console.anthropic.com>, onglet *Usage*.

---

# Ça ne marche pas

Cherche ton message dans la colonne de gauche.

### Au moment d'installer ou de lancer

| Ce que tu vois | Ce qui se passe |
|---|---|
| `/plugin` ne trouve pas le dépôt | Vérifie l'orthographe : `Eddyialab/agent-brainstorming-battle`, sans espace. Et assure-toi que ton Claude Code est à jour |
| Le dossier de l'étape 3 n'existe pas | La première commande, `/plugin marketplace add`, n'est pas passée. Refais [l'étape 3](#3-installer-le-plugin) |
| `npm : command not found` / `n'est pas reconnu` | Node.js n'est pas installé, ou tu n'as pas redémarré ton ordinateur après l'installation. Reprends [l'étape 1](#1-installer-nodejs) |
| `npm ERR! enoent ... package.json` | Le terminal n'est pas dans le bon dossier : tu as ouvert un fichier au lieu du dossier. Refais [l'étape 4](#4-ouvrir-le-dossier-dans-vs-code) |
| Des lignes jaunes `warn` pendant `npm install` | Ce ne sont pas des erreurs. Ignore |
| `npm ERR!` en rouge pendant `npm install` | Vérifie ta connexion, puis relance `npm install`. Si ça persiste, supprime le dossier `node_modules` et recommence |
| `ANTHROPIC_API_KEY absente` au lancement | Le fichier s'appelle `.env.txt` au lieu de `.env`, ou il y a un espace autour du `=`, ou tu ne l'as pas enregistré. Refais [l'étape 5](#5-créer-le-fichier-env-avec-tes-clés) |
| `EADDRINUSE` ou `port already in use` | Une autre Arène tourne déjà — regarde tes autres onglets de terminal. Sinon, mets `PORT=4174` dans ton `.env` et relance |
| Le terminal ne répond plus après `npm run start` | C'est normal, l'Arène tourne. Ouvre un **deuxième** terminal avec l'icône `+` si tu as besoin de taper autre chose |

### Pendant le débat

| Ce que tu vois | Ce qui se passe |
|---|---|
| « Impossible d'accéder à ce site » dans le navigateur | Le serveur n'est pas lancé, ou tu as fermé le terminal. Relance `npm run start` |
| Une erreur de crédit, ou `401` | La clé est bonne mais ton compte Anthropic n'a pas de crédit. <https://console.anthropic.com>, onglet *Billing* |
| Les robots écrivent mais ne parlent pas | Pas de clé ElevenLabs. C'est le comportement normal du mode sous-titres |
| La barre Espace ne fait rien | Même cause : sans clé ElevenLabs, le micro est désactivé. Utilise la barre de texte |
| Le micro ne capte rien | Ton navigateur le bloque. Clique sur le cadenas à gauche de l'adresse et autorise le microphone |
| Ma modification de persona n'apparaît pas | Pas redémarré. `Ctrl` + `C`, puis `npm run start` |
| Le premier robot reste sur « réfléchit » | Normal quelques secondes : c'est la seule prise de parole dont l'attente n'est masquée par rien. Si ça dure plus de 30 s, regarde le terminal |

Si ton problème n'est pas là :
<https://github.com/Eddyialab/agent-brainstorming-battle/issues>

---

# Pour les curieux

## Comment l'attente est masquée

L'ordre de parole est fixé à l'avance. Donc dès qu'un robot a fini de *générer*
son texte, le suivant commence à réfléchir **pendant que le premier parle**. Les
~20 secondes de voix couvrent entièrement la génération suivante : l'enchaînement
se fait sans blanc.

Quand tu coupes la parole, le tour préparé à l'avance est simplement jeté.

Seule la toute première prise de parole n'a rien pour masquer son attente — d'où
l'état « réfléchit » sur le premier robot.

## Les fichiers du projet

```
scripts/launch.mjs     ce que lance npm run start : vérifie, démarre, ouvre le navigateur
server.js              le serveur : HTTP, WebSocket, relais audio
src/env.js             lecture du fichier .env
src/personas.js        chargement des SKILL.md
src/claude.js          génération d'une prise de parole (interruptible)
src/tts.js             la voix (ElevenLabs)
src/stt.js             la transcription de ton micro
src/orchestrator.js    tours, rounds, préchargement, interruption
personas/              un dossier par robot
public/                l'Arène telle que tu la vois
```

---

MIT — fais-en ce que tu veux.
