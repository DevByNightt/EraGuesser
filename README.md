# EraGuesser
pour clone :  
`https://<votre-username>:<pat>@github.com/DevByNightt/EraGuesser.git`

si vous avez pas de pat allez à [settings/tokens](https://github.com/settings/tokens) et créez  

ou svv vs tapez votre mdp à chaque fois
## mode d'emploi
à remplir quand g compris cmt ça marche


**EraGuesser** est un jeu multijoueur interactif pensé pour être joué "en présentiel" (dans une salle de classe, un amphithéâtre ou un salon). 
Inspiré de jeux comme GeoGuessr ou TimeGuessr, le but est simple : **deviner le lieu et l'année d'une photographie historique**.

L'originalité d'EraGuesser réside dans son format : 
- Il y a un **écran principal partagé** (affiché sur un vidéoprojecteur ou un grand écran) que tout le monde regarde.
- Chaque joueur utilise son propre **téléphone portable comme manette** pour placer son marqueur sur une carte et choisir une date.

---

## Comment jouer ?

### Pour l'Hôte (celui qui organise la partie)
1. Téléchargez et installez **Node.js** (https://nodejs.org/) sur votre ordinateur (c'est le moteur logiciel qui fait tourner le jeu).
2. Lancez le jeu en double-cliquant sur le fichier **`start.bat`** situé dans le dossier du jeu. Ce petit script s'occupe de tout démarrer pour vous.
3. Une page web va s'ouvrir automatiquement sur votre ordinateur. C'est cet écran qu'il faut projeter ou afficher en grand pour que tout le monde le voie !
4. Attendez que tous les joueurs rejoignent la partie, puis cliquez sur **"Lancer la partie"**.

### Pour les Joueurs
1. Regardez le grand écran. Vous y verrez un grand **QR Code** avec un lien en dessous.
2. Scannez ce QR Code avec l'appareil photo de votre smartphone (ou l'application de scan de votre choix).
3. Entrez le pseudo de votre choix sur la page web qui s'affiche sur votre téléphone, et appuyez sur "Rejoindre".
4. *Pendant la partie : observez la photo sur le grand écran, puis sur votre téléphone, placez le pointeur sur la carte, choisissez une année avec la glissière, et n'oubliez pas d'appuyer sur "Valider" avant la fin du temps !*

---

## Déroulement d'une manche et Règles

Une partie se déroule en plusieurs manches chronométrées. Pour chaque manche :

1. **La Photo** : Une photographie historique apparaît au centre du grand écran avec un compte à rebours (ex. : 30 secondes).
2. **L'Investigation** : Observez les détails ! Sur votre téléphone, utilisez la carte du monde pour placer une punaise à l'endroit exact où vous pensez que la photo a été prise. Utilisez ensuite la barre coulissante en dessous pour estimer l'année.
3. **Les Résultats** : Le grand écran affiche alors une immense carte du monde. Vous verrez apparaître le lieu exact de la photo (une punaise verte) ainsi que les propositions de tous les joueurs, reliées par des lignes.
4. **Le Score** : Les points sont calculés en fonction de deux critères simples :
   - **La précision géographique** : Moins vous êtes éloigné de la ville d'origine, plus vous gagnez de points.
   - **La précision temporelle** : Plus l'année choisie est proche de la réalité, plus vous marquez de points.
Le joueur qui cumule le plus de points à la fin de toutes les manches est déclaré grand vainqueur !

---

## Stack Technique (Langages & Librairies)

Ce projet a été pensé comme une "Web App" (application web). Cela signifie qu'**aucun joueur n'a besoin de télécharger d'application** sur les grands "stores" (App Store, Google Play...). Tout fonctionne directement dans le navigateur internet habituel (Chrome, Safari, Firefox). 

Voici les technologies utilisées pour faire fonctionner le jeu, expliquées simplement :

### Côté Serveur (Le "cerveau" du jeu, Backend)

Le serveur gère la logique de la partie, chronomètre les manches, calcule les scores et fait le lien entre tous les téléphones et l'écran principal.

*   **JavaScript (via Node.js)** : Le langage de programmation central du projet. Node.js permet d'exécuter du JavaScript directement sur l'ordinateur de l'hôte, en dehors d'un navigateur web, pour créer un serveur rapide et performant.
*   **Express.js** : Une librairie (boîte à outils) très populaire pour Node.js. Elle s'occupe de distribuer les pages web (les fichiers HTML, CSS, images) aux joueurs lorsqu'ils s'y connectent.
*   **Socket.io** : C'est la technologie clé du projet ! Elle permet une communication **en temps réel et bidirectionnelle**. Concrètement, c'est ce qui permet :
    *   Aux téléphones d'envoyer leurs réponses instantanément au serveur.
    *   Au serveur d'envoyer le compte à rebours au grand écran chaque seconde, sans jamais avoir besoin de rafraîchir la page.
*   **QRCode** : Une petite librairie qui génère automatiquement l'image du QR code à afficher sur l'écran principal, pour éviter aux joueurs de taper l'adresse à la main.
*   **Untun (Cloudflare Tunnel)** : Une pépite technique ! Normalement, un serveur "local" n'est accessible que si tout le monde est sur le même boîtier Wi-Fi. Cette librairie crée un tunnel sécurisé et temporaire vers Internet. Ainsi, les joueurs peuvent jouer en utilisant **le réseau 4G/5G de n'importe quel opérateur**.

### Côté Client (L'écran principal et les téléphones, Frontend)

Le client s'occupe de l'affichage, de l'esthétique et de l'interaction (tactile ou souris).

*   **HTML5, CSS3, JavaScript (Vanilla)** : Les standards fondateurs du Web. Ils structurent les pages de jeu, les rendent visuellement belles (couleurs, polices, design organisé) et interactives. "Vanilla" signifie que la logique côté navigateur n'utilise pas de gros frameworks supplémentaires (comme React ou Vue), pour rester léger et facile à lire.
*   **Leaflet.js** : C'est la librairie qui permet d'afficher les cartes interactives (planisphères). Légère et performante, elle s'occupe de gérer le placement des "punaises" colorées et le tracé des lignes de distance.
*   **OpenStreetMap** : C'est la base de données cartographique (le fond de carte) utilisée. Elle est libre, communautaire, et s'intègre parfaitement avec Leaflet pour afficher les rues et les pays du monde entier.