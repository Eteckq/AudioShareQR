# QR Code Audio Upload

Une application NuxtJS qui permet d'uploader des fichiers audio et de générer des QR codes pour les partager.

## Fonctionnalités

- 📤 Upload de fichiers audio (MP3, WAV, OGG, M4A)
- 🏷️ Attribution d'un nom personnalisé aux fichiers
- 📱 Génération automatique de QR code après upload
- 🎵 Lecteur audio intégré avec contrôles
- 💾 Stockage des métadonnées en base de données JSON
- 🎨 Interface moderne avec TailwindCSS

## Installation

1. Cloner le projet
2. Installer les dépendances :
```bash
npm install
```

3. Lancer le serveur de développement :
```bash
npm run dev
```

## Utilisation

1. **Page d'upload** (`/`) : 
   - Entrez un nom pour votre fichier audio
   - Sélectionnez un fichier audio (max 50MB)
   - Cliquez sur "Uploader le fichier"
   - Un QR code s'affiche automatiquement

2. **Page de lecture** (`/audio/[id]`) :
   - Accédez via le QR code ou le lien direct
   - Lecteur audio intégré avec contrôles
   - Informations sur le fichier
   - Possibilité de télécharger le fichier

## Structure du projet

```
├── pages/
│   ├── index.vue          # Page d'upload
│   └── audio/[id].vue     # Page de lecture audio
├── server/
│   ├── api/
│   │   ├── upload.post.js           # API d'upload
│   │   ├── files/[id].get.js        # API récupération fichier
│   │   ├── files/serve/[filename].get.js # API service fichiers
│   │   └── qr/[id].get.js           # API génération QR code
│   └── utils/
│       └── database.js    # Gestion base de données
├── files/                 # Dossier des fichiers uploadés
└── data/                  # Base de données JSON
```

## API Endpoints

- `POST /api/upload` - Upload d'un fichier audio
- `GET /api/files/[id]` - Récupération des métadonnées d'un fichier
- `GET /api/files/serve/[filename]` - Service d'un fichier audio
- `GET /api/qr/[id]` - Génération du QR code

## Technologies utilisées

- **NuxtJS 4** - Framework Vue.js
- **TailwindCSS** - Framework CSS
- **Node.js** - Runtime JavaScript
- **QR Code API** - Génération de QR codes
- **JSON** - Stockage des données (remplace SQLite pour la simplicité)