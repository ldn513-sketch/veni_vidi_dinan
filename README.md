# Veni Vidi Dinan 🚌

**Veni Vidi Dinan** is a modern Progressive Web App (PWA) designed to provide real-time transit information for the DINAMO bus network in Dinan Agglomération. Built with a focus on simplicity, aesthetics, and performance, it allows users to visualize bus lines, locate stops, and check schedules instantly.

![Splash Screen](client/public/splash.svg)

## ✨ Features

*   **Interactive Map**: Full network visualization using OpenStreetMap and Leaflet.
*   **Real-Time Schedules**: Click on any stop to see the next two departures for all lines, including "Smart Grouping" for bi-directional stops.
*   **Accurate Routing**: Bus lines follow the exact road geometry (using GTFS shapes).
*   **Geolocation**: Instantly center the map on your current position.
*   **PWA Ready**: Installable on Android/iOS with a custom splash screen and app icon.
*   **Offline Capable**: Designed to be lightweight and robust (Service Worker ready).

## 🚀 Getting Started

### Prerequisites

*   Node.js (v18 or higher)
*   npm or pnpm

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/yourusername/veni-vidi-dinan.git
    cd veni-vidi-dinan
    ```

2.  Install dependencies:
    ```bash
    npm install
    # or
    pnpm install
    ```

3.  Start the development server:
    ```bash
    npm run dev
    ```

4.  Open your browser at `http://localhost:5173`.

## 🛠️ Tech Stack

*   **Framework**: React 18 + Vite
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS 4
*   **Maps**: Leaflet + React-Leaflet
*   **Data**: GTFS (General Transit Feed Specification)
*   **Animation**: Framer Motion

## 📱 PWA & Android Deployment

This project is configured as a Progressive Web App. It includes:
*   `manifest.json` for Android integration.
*   Adaptive icons (192x192, 512x512).
*   Splash screen support.

To build for production:
```bash
npm run build
```
The output will be in the `dist` folder, ready to be deployed to any static host (Vercel, Netlify, GitHub Pages) or wrapped in a TWA (Trusted Web Activity) for the Play Store.

## 📄 License

This project is open-source and available under the MIT License.

---
*Built with ❤️ for Dinan.*
