# ☁️ Météo Pro Dashboard

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white)

Application météo moderne et esthétique développée avec **React + Vite**. Elle offre des prévisions en temps réel, une interface *Glassmorphism* fluide, et des fonctionnalités avancées proches d’une application native.

👉 **[Découvrir l'application en direct](https://weather-app1.vercel.app)**

---

## 🚀 Fonctionnalités

- 🌍 **Recherche intelligente** : Autocomplétion globale des villes et pays.
- 📊 **Prévisions interactives** : Graphique d'évolution des températures de la journée (propulsé par Recharts).
- ⭐ **Favoris locaux** : Sauvegarde de vos lieux épinglés directement dans le navigateur (`localStorage`).
- 🌗 **Thèmes dynamiques** : Prise en charge du Mode Sombre et Mode Clair.
- 🌡️ **Flexibilité des unités** : Bascule instantanée entre Celsius (°C) et Fahrenheit (°F).
- 🔔 **Notifications natives** : Alertes météo locales intégrées au navigateur.
- 📱 **Progressive Web App (PWA)** : Installable sur mobile et bureau pour une expérience native hors du navigateur.

---

## 🛠️ Stack Technique

- **Frontend** : React 18, TypeScript, CSS3 (Glassmorphism UI)
- **Outil de build** : Vite (pour des performances ultra-rapides)
- **Graphiques** : Recharts
- **API Météo** : WeatherAPI
- **Mobile / Natif** : `vite-plugin-pwa` (PWA) & Capacitor (Android)

---

## 📲 Installation Mobile (PWA & Android)

**Méthode 1 : Progressive Web App (PWA)**
L’application peut être installée sans passer par un store :
1. Ouvrez le [lien du site](https://weather-app1.vercel.app) sur votre smartphone (Chrome ou Safari).
2. Acceptez la proposition **"Ajouter à l’écran d’accueil"** (ou via le bouton de partage sur iOS).
3. L'application se lancera en plein écran avec sa propre icône.

**Méthode 2 : Build Natif Android (Capacitor)**
Pour générer un fichier `.apk` :
```bash
npm run build
npx cap sync
npx cap open android
⚙️ Installation Locale (Développement)
Pour faire tourner le projet sur votre machine :

Bash
# 1. Cloner le dépôt
git clone [https://github.com/gnaweparfait/weather-app.git](https://github.com/gnaweparfait/weather-app.git)

# 2. Naviguer dans le dossier
cd weather-app

# 3. Installer les dépendances
npm install

# 4. Lancer le serveur de développement
npm run dev
Pour compiler le projet pour la production :

Bash
npm run build
📁 Structure du projet
Plaintext
weather-app/
├── public/
│   ├── icon-192x192.png       # Icônes PWA
│   ├── icon-512x512.png
│   └── favicon.ico
├── src/
│   ├── App.tsx                # Logique principale et UI
│   ├── main.tsx               # Point d'entrée React
│   └── vite-env.d.ts
├── index.html
├── vite.config.ts             # Configuration Vite & PWA
└── package.json
🔔 Notes sur les Notifications
Actuellement, l'application utilise l'API Notification native du navigateur (déclenchée par le client).

Testables via le bouton 🔔 dans l'interface.

Limitation : Étant des notifications "locales", elles nécessitent que l'onglet de l'application soit actif/ouvert en arrière-plan pour être déclenchées par le code JavaScript.

🔮 Améliorations futures (Roadmap)
[ ] Intégration de Web Push Notifications (via un Backend / Firebase) pour des alertes automatisées.

[ ] Support complet du mode hors-ligne (Service Workers avancés).

[ ] Ajout d'une carte radar interactive (précipitations/vents).

[ ] Géolocalisation automatique et permissions avancées.

[ ] Version native iOS via Capacitor.

👨‍💻 Auteur
Gnawé Parfait Informaticien & Développeur

📄 Licence
Ce projet est open-source. Libre d’utilisation, de modification et d’amélioration.