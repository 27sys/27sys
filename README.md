# 27sys Services — Site web

Ce dossier contient votre site. Voici tout ce qu'il faut savoir pour le
modifier et le mettre en ligne, même sans compétences techniques.

## Structure du dossier

```
27sys/
├── index.html          → le contenu et la structure du site
├── css/style.css        → l'apparence (couleurs, polices, mise en page)
├── js/config.js         → ⭐ VOS INFORMATIONS D'ENTREPRISE (à modifier)
├── js/main.js            → le fonctionnement (menu, FAQ, animations)
└── images/                → vos photos (à ajouter vous-même)
```

## Ce que vous devez faire avant de mettre le site en ligne

### 1. Ouvrez `js/config.js` avec un éditeur de texte simple
(le Bloc-notes sur Windows, TextEdit sur Mac, ou VS Code si vous en avez un)

Remplacez les valeurs suivantes :

- **`whatsappNumber`** → votre numéro WhatsApp, format international, sans
  "+" ni espaces. Exemple : un numéro marocain `06 12 34 56 78` devient
  `"212612345678"`.
- **`phoneDisplay`** et **`phoneHref`** → votre numéro de téléphone.
- **`email`** → votre adresse email professionnelle.
- **`social.linkedin`** → le lien vers votre profil LinkedIn.
- **`social.googleBusiness`** → le lien vers votre fiche Google Business
  (laissez `""` tant que vous n'en avez pas, le bouton restera masqué
  automatiquement).
- **`pricing.diagnostic`** → laissez `""` tant que vous n'avez pas fixé de
  prix. Le site affichera alors "prix communiqué avant intervention" au
  lieu d'inventer un chiffre.

Enregistrez le fichier après chaque modification.

### 2. Ajoutez vos photos

1. Déposez vos fichiers photo dans le dossier `images/`
   (par exemple `hero-technicien.jpg` et `about-technicien.jpg`).
2. Dans `js/config.js`, indiquez leurs noms dans la section `images`.
3. Tant qu'aucune photo n'est indiquée, un cadre technique s'affiche à la
   place — le site reste présentable, rien n'est cassé.

Conseil : utilisez des photos horizontales/verticales nettes, bien
éclairées, qui vous montrent réellement en train de travailler sur un PC.
Évitez les photos de banque d'images.

### 3. Vérifiez le titre et la description (référencement Google)

Dans `index.html`, tout en haut, les balises `<title>` et
`<meta name="description">` sont volontairement écrites en dur (et non
depuis `config.js`) car les moteurs de recherche et les aperçus WhatsApp
ne lisent pas toujours le JavaScript. Si vous changez le nom de
l'entreprise ou la ville, mettez aussi ces deux lignes à jour.

## Comment prévisualiser le site sur votre ordinateur

Double-cliquez simplement sur `index.html` : il s'ouvrira dans votre
navigateur. C'est suffisant pour vérifier vos modifications.

## Comment mettre le site en ligne

Une fois satisfait, vous pouvez déposer l'ensemble du dossier `27sys/`
chez n'importe quel hébergeur simple (Netlify, Vercel, un hébergement
mutualisé classique, etc.). Aucune installation ni base de données n'est
nécessaire : ce sont uniquement des fichiers HTML/CSS/JS.

## Ce que vous n'avez normalement jamais besoin de toucher

- `css/style.css` — sauf si vous voulez changer une couleur ou un espacement.
- `js/main.js` — le fonctionnement du site (menu, FAQ, animations).
- `index.html` — sauf pour changer un texte, une question de FAQ, etc.
  Cherchez le texte à modifier directement dans le fichier (Ctrl+F /
  Cmd+F) et remplacez-le entre les balises.

## Avis Google

Une zone "Avis Google" est prévue dans la section confiance du site. Elle
affiche pour l'instant un message d'attente. N'ajoutez de vrais avis que
lorsque vous en aurez — ne jamais inventer d'avis clients.
