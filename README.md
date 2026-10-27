# Project Bar

Modern restaurant/bar web app built with React and Vite. Includes menu tabs, promo slider, events page, auth/cart flow, i18n (RU/EN), and responsive layout.

## Tech stack

- Vite
- React
- React Router
- MobX
- Firebase Authentication + Cloud Firestore
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

## Restaurant experience (redesign)

The public experience works in local demo mode without Firebase configuration. When a complete web config is present, it switches to Firebase Authentication and Cloud Firestore. Existing source components remain available for reference; public routes use the new experience under `src/features/restaurant`.

```bash
npm ci
npm run dev
npm run build
npm run lint
npm test
```

Use Node.js 22+ for the built-in model tests. Open the Vite URL, normally `http://localhost:5173`.

- `/reserve`: interactive SVG floor plan, availability, recommendations, guest details and demo reservation.
- `/menu`, `/selection`: searchable demonstration catalogue, favourites and pre-order.
- `/evening`: saved local visits, editing/cancellation and pre-order management.
- `/stories`, `/gallery`: editorial stories and photo viewer.
- `/admin`: local sandbox in demo mode; Firebase mode requires a trusted `admin` claim or a server-managed `admins/{uid}` record.

Without Firebase config, reservations and pre-orders are stored under `london-grill:experience:v1` in localStorage. With Firebase config, private booking data is stored under the signed-in user, anonymized availability is synchronized in real time, and 30-minute slot documents prevent double booking through Firestore transactions. See `docs/FIREBASE_SETUP.md` and `docs/FIRESTORE_RULES_AUDIT.md` before deployment. Payments and customer notifications are intentionally not implemented. The sample floor layout, dish names, prices and service hours remain demonstration data.
