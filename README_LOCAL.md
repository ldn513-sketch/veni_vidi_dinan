# DINAMO Transit PWA - Version Locale

Ce dossier contient le code source complet de l'application DINAMO Transit PWA.

## Prérequis

*   **Node.js** (version 18 ou supérieure) installé sur votre machine.
*   Un terminal (PowerShell, Command Prompt, ou Terminal).

## Installation et Lancement

1.  Ouvrez votre terminal dans ce dossier.
2.  Installez les dépendances :
    ```bash
    npm install
    ```
    (ou `pnpm install` ou `yarn` si vous les avez)

3.  Lancez le serveur de développement :
    ```bash
    npm run dev
    ```

4.  Ouvrez votre navigateur à l'adresse indiquée (généralement `http://localhost:5173`).

## Structure du Projet

*   `client/src` : Code source de l'application (React, TypeScript).
*   `client/public/gtfs` : Les fichiers de données GTFS bruts.
*   `client/src/lib/schedule-utils.ts` : Logique de calcul des horaires.
*   `client/src/components/TransitMap.tsx` : Composant de la carte interactive.

## Note sur les Données

L'application lit directement les fichiers GTFS situés dans `client/public/gtfs`. Si vous souhaitez mettre à jour les horaires, remplacez simplement ces fichiers par les nouveaux (en gardant les mêmes noms).

Bon test !
