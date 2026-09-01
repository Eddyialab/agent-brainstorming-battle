# L'Arène

**Trois IA débattent d'un sujet, à voix haute, sous tes yeux. Tu peux leur couper
la parole quand tu veux.**

Tu tapes une question. Trois robots aux façons de penser opposées s'engueulent
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

- [Ce qu'il te faut avant de commencer](#ce-quil-te-faut-avant-de-commencer)
- [Chemin A — tu utilises déjà Claude Code](#chemin-a--tu-utilises-déjà-claude-code-2-minutes)
- [Chemin B — installation complète, pas à pas](#chemin-b--installation-complète-pas-à-pas-20-minutes)
  - [1. Installer Node.js](#1-installer-nodejs-le-moteur-qui-fait-tourner-larène)
  - [2. Installer VS Code](#2-installer-vs-code-léditeur-de-texte)
  - [3. Télécharger le dossier de l'Arène](#3-télécharger-le-dossier-de-larène)
  - [4. Ouvrir le dossier dans VS Code](#4-ouvrir-le-dossier-dans-vs-code)
  - [5. Ouvrir le terminal](#5-ouvrir-le-terminal-le-truc-noir-qui-fait-peur)
  - [6. Installer les dépendances](#6-installer-les-dépendances-npm-install)
  - [7. Récupérer tes clés API](#7-récupérer-tes-clés-api)
  - [8. Créer le fichier `.env`](#8-créer-le-fichier-env)
  - [9. Lancer l'Arène](#9-lancer-larène)
  - [10. Arrêter l'Arène](#10-arrêter-larène)
- [Utiliser l'Arène](#utiliser-larène)
- [Régler les personnalités](#régler-les-personnalités)
- [Tous les réglages](#tous-les-réglages)
- [Combien ça coûte](#combien-ça-coûte)
- [Ça ne marche pas](#ça-ne-marche-pas)
- [Pour les curieux](#pour-les-curieux)

---

# Ce qu'il te faut avant de commencer

**Du temps :** 20 minutes la première fois. 10 secondes les fois suivantes.

**Un ordinateur** Windows, Mac ou Linux. Pas de téléphone : l'Arène est un petit
serveur qui tourne sur ta machine.

**Une clé API Anthropic** — c'est ce qui fait parler les robots. Obligatoire.
C'est une longue suite de caractères qui commence par `sk-ant-`.

> ⚠️ **Attention, piège classique.** Un abonnement Claude Pro ou Max **ne donne
> pas** de clé API. Ce sont deux produits séparés, facturés séparément. La clé
> API se prend sur <https://console.anthropic.com> et il faut y mettre du crédit
> (5 $ suffisent pour une quinzaine de débats). L'étape 7 explique comment.

**Une clé API ElevenLabs** — c'est ce qui donne une *voix* aux robots.
Facultative. Sans elle, l'Arène tourne quand même : les robots écrivent au lieu
de parler, et l'interruption au micro est désactivée. Tu peux commencer sans, et
l'ajouter plus tard.

**Aucune connaissance en informatique.** Tu vas taper trois commandes. Elles sont
écrites en toutes lettres, tu n'as qu'à les copier.

---

# Chemin A — tu utilises déjà Claude Code (2 minutes)

Si tu as déjà Claude Code installé, saute tout le reste : l'Arène est un plugin.

**1.** Dans Claude Code, tape ces deux lignes l'une après l'autre :

```
/plugin marketplace add Eddyialab/agent-brainstorming-battle
/plugin install arene@agent-brainstorming-battle
```

**2.** Crée un fichier `arene.env` dans ton dossier `~/.claude/` (sur Windows :
`C:\Users\TonNom\.claude\arene.env`) et colle dedans :

```
ANTHROPIC_API_KEY=sk-ant-ta-cle-ici
ELEVENLABS_API_KEY=ta-cle-elevenlabs-ici
```

Si tu ne sais pas où trouver ces clés, va lire [l'étape 7](#7-récupérer-tes-clés-api),
elle est écrite pour ça.

**3.** Lance un débat :

```
/arene faut-il rendre le télétravail obligatoire ?
```

Le premier lancement installe ce qu'il faut (compte une minute), ouvre ton
navigateur, et remplit le sujet tout seul. Il ne te reste qu'à cliquer
**Lancer le débat**.

Le plugin installe aussi une compétence : tu peux dire à Claude *« change la
personnalité de Krach »*, *« ajoute un quatrième robot »* ou *« l'arène ne
démarre pas »*, il saura quoi faire.

---

# Chemin B — installation complète, pas à pas (20 minutes)

C'est le chemin à suivre si tu n'as pas Claude Code, ou si tu veux juste
l'application seule dans ton navigateur.

Lis chaque étape en entier avant de la faire. Il n'y a rien de risqué : tu
n'installes que des logiciels standards et tu ne touches à rien de ton système.

## 1. Installer Node.js (le moteur qui fait tourner l'Arène)

Node.js, c'est ce qui permet à ton ordinateur d'exécuter le code de l'Arène.
Sans lui, rien ne démarre.

1. Va sur <https://nodejs.org>
2. Clique sur le gros bouton de gauche, celui marqué **LTS** (ça veut dire
   « version stable ». Prends celle-là, pas l'autre).
3. Ouvre le fichier téléchargé et clique **Suivant** jusqu'au bout. Ne change
   aucune option, les réglages par défaut sont les bons.
4. **Redémarre ton ordinateur.** Oui, vraiment. Sinon ton terminal ne trouvera
   pas Node et tu vas perdre dix minutes à te demander pourquoi.

**Vérifier que ça a marché** — tu feras ça juste après l'étape 5, quand tu auras
ouvert un terminal. La commande sera `node -v` et elle doit répondre quelque
chose comme `v22.14.0`. Il faut au minimum la version 20.

## 2. Installer VS Code (l'éditeur de texte)

VS Code, c'est le logiciel dans lequel tu vas ouvrir le dossier de l'Arène. Il
sert à deux choses : lire et modifier les fichiers, et te fournir un terminal
intégré (tu n'auras pas à chercher celui de ton système).

1. Va sur <https://code.visualstudio.com>
2. Clique sur le bouton de téléchargement (il détecte ton système tout seul).
3. Installe. Sur Windows, coche la case **« Ajouter l'action Ouvrir avec
   Code »** si elle t'est proposée — ça te fera gagner du temps plus tard.
4. Lance VS Code. Il est en anglais par défaut ; il te proposera de l'installer
   en français dans une bulle en bas à droite, accepte si tu préfères.

## 3. Télécharger le dossier de l'Arène

Deux méthodes. Prends la première si tu ne sais pas ce qu'est Git.

**Méthode simple — le fichier ZIP**

1. Va sur <https://github.com/Eddyialab/agent-brainstorming-battle>
2. Clique sur le bouton vert **`< > Code`**, puis sur **Download ZIP**.
3. Le fichier arrive dans ton dossier *Téléchargements*. Fais un clic droit
   dessus → **Extraire tout** (Windows) ou double-clic (Mac).
4. Déplace le dossier obtenu là où tu veux le garder — par exemple sur ton
   Bureau. **Retiens où il est**, tu en auras besoin à l'étape suivante.

> 💡 Évite de le laisser dans *Téléchargements*, et évite les dossiers
> synchronisés type OneDrive ou Google Drive : la synchronisation en arrière-plan
> peut perturber l'installation.

**Méthode Git** (si tu sais ce que c'est) :

```bash
git clone https://github.com/Eddyialab/agent-brainstorming-battle.git
```

## 4. Ouvrir le dossier dans VS Code

C'est l'étape où les gens se trompent le plus souvent, alors lis bien : il faut
ouvrir **le dossier**, pas un fichier.

1. Dans VS Code, menu **Fichier** (en haut à gauche) → **Ouvrir le dossier…**
   *(File → Open Folder… si tu es en anglais)*
2. Navigue jusqu'au dossier que tu as extrait à l'étape 3, **sélectionne-le**
   (un seul clic, ne rentre pas dedans) et clique **Sélectionner un dossier**.
3. Si VS Code te demande *« Faites-vous confiance aux auteurs de ce dossier ? »*,
   réponds **Oui, je fais confiance**. Sans ça, le terminal sera bridé.

**Comment savoir que c'est bon :** dans la colonne de gauche, tu dois voir la
liste des fichiers du projet — `server.js`, `package.json`, `README.md`, et des
dossiers `personas`, `public`, `src`. Si tu ne vois qu'un seul fichier, tu as
ouvert un fichier au lieu du dossier : recommence.

## 5. Ouvrir le terminal (le truc noir qui fait peur)

Le terminal, c'est une zone où tu tapes des commandes au lieu de cliquer sur des
boutons. C'est tout. Tu ne peux rien casser en tapant les commandes de ce guide.

Dans VS Code : menu **Terminal** → **Nouveau terminal**.

*(Raccourci : `Ctrl` + `ù` sur un clavier français, `Ctrl` + `` ` `` sur un
clavier anglais, `Cmd` + `` ` `` sur Mac.)*

Un panneau s'ouvre en bas de la fenêtre. Il affiche une ligne qui se termine par
le nom de ton dossier, avec un curseur qui clignote. **C'est important :** ça
veut dire que le terminal est déjà positionné dans le bon dossier. Tu n'as rien
d'autre à faire.

**Teste que Node est bien installé.** Tape exactement ceci et appuie sur
`Entrée` :

```bash
node -v
```

- Ça répond `v20.x.x` ou plus haut → parfait, continue.
- Ça répond `command not found` ou `n'est pas reconnu` → Node n'est pas installé,
  ou tu n'as pas redémarré. Reprends l'étape 1.

> 💡 **Trois choses à savoir sur le terminal**, et tu es tranquille :
> - Coller se fait avec `Ctrl` + `V` (`Cmd` + `V` sur Mac) — mais un clic droit
>   marche aussi.
> - Rien ne s'affiche quand tu tapes un mot de passe ou une clé : c'est normal,
>   c'est masqué, continue de taper.
> - Une commande n'est lancée que quand tu appuies sur `Entrée`.

## 6. Installer les dépendances (`npm install`)

L'Arène utilise quelques briques de code écrites par d'autres. Cette commande va
les télécharger.

Dans le terminal, tape :

```bash
npm install
```

Puis `Entrée`. Ça mouline entre 30 secondes et 2 minutes, avec beaucoup de texte
qui défile. C'est normal.

**C'est fini quand** le curseur revient et que tu peux taper à nouveau. Tu verras
un message du genre `added 96 packages in 34s`.

**Les avertissements jaunes (`warn`) ne sont pas des erreurs.** Ignore-les. Seul
un message rouge `ERR!` pose problème — dans ce cas, va voir la section
[Ça ne marche pas](#ça-ne-marche-pas).

Un nouveau dossier `node_modules` est apparu dans la colonne de gauche. Ne le
touche pas, ne le supprime pas.

## 7. Récupérer tes clés API

Une clé API, c'est un mot de passe qui autorise ton Arène à parler aux serveurs
d'Anthropic (pour le cerveau des robots) et d'ElevenLabs (pour leur voix).

### La clé Anthropic — obligatoire

1. Va sur <https://console.anthropic.com> et crée un compte (ou connecte-toi).
2. **Mets du crédit :** menu **Billing** (ou *Plans & Billing*) → ajoute
   **5 $** pour commencer. Sans crédit, la clé existe mais ne fonctionne pas.
3. Va dans **API Keys** → **Create Key**. Donne-lui un nom, par exemple `arene`.
4. **Copie la clé tout de suite** avec le bouton de copie. Elle commence par
   `sk-ant-`. Elle ne te sera plus jamais réaffichée : si tu la perds, il faudra
   en créer une autre.

### La clé ElevenLabs — facultative, pour la voix

1. Va sur <https://elevenlabs.io> et crée un compte. Le palier gratuit suffit
   pour essayer.
2. Clique sur ton avatar en haut à droite → **API Keys** → crée une clé.
3. Copie-la.

> 🔒 **Ces clés sont des mots de passe.** Ne les mets jamais dans un message, un
> screenshot, une vidéo ou un fichier public. Le fichier `.env` que tu vas créer
> à l'étape 8 est justement fait pour ça : il est exclu du partage par défaut.

### Pas encore de clé ElevenLabs ?

Aucun problème, saute-la. Tu peux même essayer l'Arène **sans aucune clé** avant
de payer quoi que ce soit : va directement à l'étape 9 et ouvre
<http://localhost:4173/?demo=1>. C'est un débat pré-écrit qui se rejoue hors
ligne, sans appeler aucun service et sans coûter un centime. Parfait pour voir à
quoi ça ressemble et régler ton cadrage vidéo.

## 8. Créer le fichier `.env`

Le fichier `.env` est l'endroit où tu ranges tes clés. Le projet contient déjà un
modèle appelé `.env.example` : tu vas en faire une copie.

**Fais-le depuis VS Code, pas depuis l'explorateur de fichiers.** Sur Windows,
l'explorateur cache les extensions et va silencieusement créer un fichier
`.env.txt` qui ne marchera pas — c'est le piège numéro un.

1. Dans la colonne de gauche de VS Code, **clic droit** sur `.env.example` →
   **Copier**, puis clic droit dans le vide → **Coller**. Un fichier
   `.env copy.example` apparaît.
2. Clic droit dessus → **Renommer**. Efface tout et tape exactement :

   ```
   .env
   ```

   Rien d'autre. Le point au début fait partie du nom.
3. Clique sur ce fichier `.env` pour l'ouvrir, et remplis les deux premières
   lignes avec tes clés :

   ```
   ANTHROPIC_API_KEY=sk-ant-ta-vraie-cle-ici
   ELEVENLABS_API_KEY=ta-vraie-cle-elevenlabs-ici
   ```

   **Pas d'espace autour du `=`. Pas de guillemets autour de la clé.**
   Une ligne par clé. Si tu n'as pas de clé ElevenLabs, laisse la ligne vide
   après le `=`.

4. **Enregistre** : `Ctrl` + `S` (`Cmd` + `S` sur Mac). Tant que tu vois un
   petit rond blanc à côté du nom de l'onglet, c'est que ce n'est pas enregistré.

Le reste du fichier (`PORT`, `DEBATE_MODEL`…) est déjà rempli avec des valeurs
correctes. Ne le touche pas pour l'instant. La section
[Tous les réglages](#tous-les-réglages) explique à quoi ça sert.

## 9. Lancer l'Arène

Retourne dans le terminal et tape :

```bash
npm start
```

Tu dois voir apparaître ceci :

```
  L'ARENE  —  http://localhost:4173

  Debatteurs : NOVA  vs  AXIOM  vs  KRACH
  Modele     : claude-opus-5 (effort low)
  Cle Claude : OK
  Voix       : eleven_flash_v2_5
  Micro      : scribe_v1 (barre Espace pour couper la parole)
```

**Lis la ligne `Cle Claude`.** Si elle dit `MANQUANTE -> voir .env`, ta clé n'est
pas prise en compte : retourne à l'étape 8 (nom du fichier ? espace autour du
`=` ? enregistré ?).

Maintenant, ouvre ton navigateur et va sur :

**<http://localhost:4173>**

> 💡 `localhost`, ça veut dire « ma propre machine ». Rien ne part sur internet
> à part les appels aux IA, et personne d'autre que toi ne peut voir cette page.

**Le terminal doit rester ouvert.** Tant que l'Arène tourne, il affiche du texte
et n'accepte plus de commandes : c'est normal, ce n'est pas planté. Si tu fermes
le terminal ou VS Code, l'Arène s'éteint et ton navigateur affichera une page
d'erreur.

Alternative : `node scripts/launch.mjs` fait la même chose mais installe les
dépendances si besoin et ouvre le navigateur tout seul.

## 10. Arrêter l'Arène

Clique dans le terminal, puis appuie sur `Ctrl` + `C` (même sur Mac : `Ctrl`,
pas `Cmd`). Le curseur revient, l'Arène est éteinte.

**Pour la relancer plus tard**, tu n'as plus que deux choses à faire :

1. Ouvrir le dossier dans VS Code (il est dans **Fichier → Ouvrir les
   récents**),
2. `Ctrl` + `ù` pour le terminal, puis `npm start`.

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

Le premier robot affiche « réfléchit » pendant quelques secondes. C'est normal et
ça n'arrive qu'une fois : ensuite, chaque robot prépare sa réponse pendant que le
précédent parle, donc il n'y a plus de blanc.

## Couper la parole

C'est tout l'intérêt du truc. Trois façons :

**En écrivant** — clique dans la barre du bas, tape ta remarque, `Entrée`. La
voix s'arrête immédiatement, ton message entre dans le débat, et le robot qui
parlait te répond avant que le tour normal reprenne.

**En parlant** — appuie une fois sur la **barre Espace** (ou clique sur
« Parler »). Le bouton passe au rouge, la voix se met en pause, tu parles. Tu
appuies une seconde fois pour envoyer. `Échap` annule sans rien envoyer, et au
bout de 15 secondes l'envoi part tout seul.

> Ton navigateur va te demander l'autorisation d'utiliser le micro la première
> fois : accepte, sinon rien ne sera enregistré. *(Nécessite une clé
> ElevenLabs.)*

**En visant un robot précis** — commence ton message par `@nova`, `@axiom` ou
`@krach`. À la voix, dis simplement *« Krach, et le coût de support ? »*, il
comprend.

## Pour filmer

- **Touche `H`** : masque toute l'interface (barre du haut, barre animateur) pour
  une image propre sous OBS. Rappuie sur `H` pour la faire revenir.
- **`?demo=1`** : ajoute ça à la fin de l'adresse
  (<http://localhost:4173/?demo=1>) pour rejouer un débat pré-écrit sans appeler
  aucune API. Idéal pour régler ton cadrage sans dépenser un centime.

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
| `order` | Son ordre de passage (1 parle en premier) |
| `image` | Son illustration, ex. `robots/nova.png` |
| `voice_id` | Sa voix ElevenLabs (l'identifiant se copie depuis leur bibliothèque de voix) |
| `stability`, `similarity`, `style`, `speed` | Le grain et le rythme de la voix |
| `voice_aliases` | Ce que le micro peut entendre à la place du nom — la transcription entend souvent « Crac » pour KRACH |

**En dessous**, tout le texte est envoyé tel quel au robot comme instructions.
Écris-y ce que tu veux, en français, à la deuxième personne. C'est de la prose,
pas du code : tu ne peux rien casser.

Le fichier `personas/_rules.md` contient les règles communes aux trois — longueur
des prises de parole, obligation de citer un adversaire, comportement face à
l'animateur. **C'est celui-là qu'il faut modifier pour changer le rythme du
débat**, pas les personas.

**Ajouter un quatrième robot :** duplique un dossier dans `personas/`, renomme-le,
modifie son `SKILL.md`. Aucun code à toucher. Il en faut au minimum deux.

**Remplacer une illustration :** dépose ton image dans `public/robots/` et change
la ligne `image:` du `SKILL.md` concerné. Les `.png` et `.jpg` sont affichés tels
quels ; les `.svg` prennent automatiquement la couleur du persona. Fond
transparent recommandé, environ 1000 px de haut.

> ⚠️ **Après chaque modification, redémarre le serveur** (`Ctrl` + `C`, puis
> `npm start`). Les personnalités sont lues une seule fois, au démarrage :
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

Redémarre le serveur après chaque changement.

**Où l'Arène cherche sa configuration**, dans cet ordre, sans jamais écraser une
variable déjà présente dans ton système :

1. le fichier désigné par la variable `ARENE_ENV_FILE`,
2. le `.env` du dossier du projet,
3. `~/.claude/arene.env`.

Si tu passes par le plugin Claude Code, utilise le troisième : il survit aux
mises à jour, contrairement au `.env` du dossier d'installation.

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

Surveille ta consommation sur <https://console.anthropic.com> (onglet *Usage*).

---

# Ça ne marche pas

Cherche ton message d'erreur dans la colonne de gauche.

### Le terminal

| Ce que tu vois | Ce qui se passe |
|---|---|
| `node : command not found` / `n'est pas reconnu` | Node.js n'est pas installé, ou tu n'as pas redémarré ton ordinateur après l'installation. Reprends [l'étape 1](#1-installer-nodejs-le-moteur-qui-fait-tourner-larène) |
| `npm ERR! enoent ... package.json` | Le terminal n'est pas dans le bon dossier. Tu as ouvert un fichier au lieu du dossier dans VS Code — refais [l'étape 4](#4-ouvrir-le-dossier-dans-vs-code) |
| `EADDRINUSE` ou `port already in use` | Une autre Arène tourne déjà (regarde tes autres onglets de terminal), ou un autre logiciel occupe le port. Mets `PORT=4174` dans ton `.env` et relance |
| Plein de lignes `warn` en jaune | Ce ne sont pas des erreurs. Ignore |
| `npm ERR!` en rouge pendant `npm install` | Vérifie ta connexion internet, puis relance `npm install`. Si ça persiste, supprime le dossier `node_modules` et recommence |
| Le terminal ne répond plus après `npm start` | C'est normal, l'Arène tourne. Ouvre un **deuxième** terminal (l'icône `+` du panneau) si tu as besoin de taper autre chose |

### L'Arène

| Ce que tu vois | Ce qui se passe |
|---|---|
| `Cle Claude : MANQUANTE -> voir .env` | Le fichier s'appelle `.env.txt` au lieu de `.env` (le piège Windows), ou il y a un espace autour du `=`, ou tu ne l'as pas enregistré. Refais [l'étape 8](#8-créer-le-fichier-env) |
| Le navigateur affiche « Impossible d'accéder à ce site » | Le serveur n'est pas lancé, ou tu as fermé le terminal. Relance `npm start` |
| `ANTHROPIC_API_KEY absente` au clic sur Lancer | Même cause que ci-dessus. Et pense à redémarrer le serveur après avoir corrigé le `.env` |
| Erreur de crédit ou `401` | La clé est bonne mais ton compte Anthropic n'a pas de crédit. Va sur <https://console.anthropic.com>, onglet *Billing* |
| Les robots écrivent mais ne parlent pas | Pas de clé ElevenLabs. C'est le comportement normal du mode sous-titres |
| La barre Espace ne fait rien | Même cause : sans clé ElevenLabs, le micro est désactivé. Utilise la barre de texte |
| Le micro ne capte rien | Ton navigateur bloque le micro. Clique sur l'icône de cadenas à gauche de l'adresse et autorise le microphone |
| Ma modification de persona n'apparaît pas | Le serveur n'a pas été redémarré. `Ctrl` + `C`, puis `npm start` |
| Le premier robot reste bloqué sur « réfléchit » | Normal pendant quelques secondes : c'est la seule prise de parole dont l'attente n'est masquée par rien. Si ça dure plus de 30 s, regarde les erreurs dans le terminal |

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

Seule la toute première prise de parole du débat n'a rien pour masquer son
attente — d'où l'état « réfléchit » sur le premier robot.

## Les fichiers du projet

```
.claude-plugin/        manifeste du plugin + marketplace
commands/arene.md      la commande /arene dans Claude Code
skills/arene/          ce que Claude lit pour régler et dépanner l'Arène
scripts/launch.mjs     lanceur : installe, démarre, ouvre le navigateur
server.js              le serveur : HTTP, WebSocket, relais audio
src/env.js             où sont cherchées les clés (.env, ~/.claude/arene.env)
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
