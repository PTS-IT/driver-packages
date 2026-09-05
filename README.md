# Daily — Everyday Essentials

A fast, installable web app (PWA) bundling the handful of things people
actually reach for on their phone every day: a clock, weather, calculator,
flashlight, stopwatch/timer, unit converter, and quick notes. No app store,
no account, no backend — open it in any mobile browser and "Add to Home
Screen" for a native-feeling icon that works offline.

## Run locally

```
python3 -m http.server 8000
```

Then open `http://localhost:8000` on your phone or in a browser's mobile
emulator.

## Structure

- `index.html` — app shell and screens (Home, Weather, Tools, Notes)
- `css/style.css` — styling, light/dark theme support
- `js/app.js` — all app logic (no build step, no dependencies)
- `manifest.webmanifest` / `sw.js` — installability and offline caching
- `icons/` — app icons

Weather uses the free [Open-Meteo](https://open-meteo.com/) API (no key
required).

