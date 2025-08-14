# Sélecteur de Rôles Loup-garou

Une application React Native pour gérer les rôles dans le jeu Loup-garou.

## Installation

1. Installez les dépendances :
```bash
npm install
```

2. Installez Expo CLI globalement :
```bash
npm install -g @expo/cli
```

## Développement

Pour démarrer l'application en mode développement :
```bash
npm start
```

Pour tester sur Android :
```bash
npm run android
```

## Build Android APK

### Méthode 1: Expo Build (Recommandée)
```bash
expo build:android
```

### Méthode 2: Export vers Android Studio

1. Créez un build de développement :
```bash
expo eject
```

2. Ouvrez le dossier `android/` dans Android Studio

3. Buildez l'APK depuis Android Studio :
   - Build > Build Bundle(s) / APK(s) > Build APK(s)

## Fonctionnalités

- ✅ Configuration du nombre de joueurs (4-20)
- ✅ Sélection et personnalisation des rôles
- ✅ Distribution sécurisée des rôles
- ✅ Interface en français
- ✅ Thème sombre mystique
- ✅ Animations fluides
- ✅ Design responsive pour mobile

## Rôles Disponibles

### Loup-garou
- Loup Bleu
- Loup Noir  
- Loup

### Village
- Simple villageois
- Voyante
- Salvateur
- Chasseur
- Corbeau
- Sorciere
- Maire

### Neutre
- Voleur

## Structure du Projet

```
├── App.tsx              # Composant principal
├── app.json            # Configuration Expo
├── package.json        # Dépendances
├── babel.config.js     # Configuration Babel
├── tsconfig.json       # Configuration TypeScript
└── assets/             # Images et icônes
```