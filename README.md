# Project Bar

Modern restaurant/bar web app built with React and Vite. Includes menu tabs, promo slider, events page, auth/cart flow, i18n (RU/EN), and responsive layout.

## Tech stack
- Vite
- React
- React Router
- MobX
- Firebase (Auth)
- CSS Modules
- ESLint + Prettier

## Requirements
- Node.js 18+ recommended
- npm 9+

## Setup
```bash
npm install
```

Create `.env` from the example:
```bash
cp .env.example .env
```

Fill Firebase variables in `.env`:
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## Run locally
```bash
npm run dev
```
App will be available at `http://localhost:5173`.

## Build
```bash
npm run build
```

## Preview production build
```bash
npm run preview
```

## Lint and format
```bash
npm run lint
npm run format
```

## Deployment notes
- For Vercel, `vercel.json` is included to support SPA routing.
- `vite.config.js` uses `base: "/"` (default root).
