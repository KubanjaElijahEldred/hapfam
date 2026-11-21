# HAPFAM Co. Ltd — Integrated Manufacturing Management Information System

**Development and Implementation of an Integrated Manufacturing Management Information System for HAPFAM Co. Ltd**

One React Native (Expo) application that runs on **Android, iOS and Web**, with three
independent departmental workspaces plus a Management communications workspace, all
connected to one Express REST API and one PostgreSQL database.

> Tagline: **Good Food. Better Life.** · Products: Soya, Rice and Maize Porridge Flour.

## Workspaces

| Route | Workspace | Purpose |
| --- | --- | --- |
| `/production/*` | Production Management | Orders, batches, material consumption, schedule, reports |
| `/inventory/*` | Stores & Inventory | Raw materials, goods receiving, requests, stock movements, finished goods |
| `/quality/*` | Quality Assurance & QC | Inspections, batch testing, approvals, rejections, non-conformance |
| `/management/*` | Management | Announcements, department replies with source, audit trail |
| `/login` | Secure sign-in | 12-character strong-password policy |

Each workspace has its own sidebar, branding, dashboard, imagery, forms, tables,
notifications and role-scoped data.

## Architecture

```
app/                      Expo Router screens (web + native from one codebase)
src/components/           Shared design system, shell, charts, carousels, records, announcements
src/modules/              production / inventory / quality / management screens
src/services/backend.ts   REST client for the Express API
src/store.tsx             Shared demo record store (offline fallback)
backend/src/              Express REST API, PostgreSQL access, auth, workflow transactions
assets/images/            Locally stored WebP imagery (see ATTRIBUTION.md)
```

### Integrated workflow (enforced by the backend)

1. Inventory receives maize/rice/soya and records stock (transaction + raw-material inspection notification).
2. Production creates an order and requests materials.
3. Inventory issues materials — stock is deducted in a DB transaction, a movement is logged, Production is notified. Over-issuing and duplicate issue are rejected.
4. Production records consumption, manufactures a batch and submits it to Quality.
5. Quality records results and decides: Approve / Reject / On Hold.
6. **Approved** → finished-goods stock created and Inventory + Production notified.
7. **Rejected / On Hold** → non-conformance created, batch excluded from saleable stock, departments notified.
8. Every event writes an audit record with actor and timestamp.

### Announcements

* Manager posts an announcement to all departments or a selected department.
* Every recipient gets a notification bell badge (polled from the API every 30 s).
* Departments reply; replies carry the **source department** and author.
* Manager sees every reply and its originating department; other departments are notified.

## Running locally

Node **22+** (Node 24 recommended) is required by Expo SDK 58.

```bash
# 1. Frontend
cd hapfam
npm install
npm run web          # http://localhost:8081
npm run android      # Android emulator / device
npm run ios          # iOS simulator (macOS)

# 2. PostgreSQL (example local instance)
initdb -D /tmp/hapfam-pg -U hapfam --auth=trust
pg_ctl -D /tmp/hapfam-pg -o "-p 55432 -h 127.0.0.1 -k /tmp" -l /tmp/pg.log start
createdb -U hapfam -h 127.0.0.1 -p 55432 hapfam_mmis

# 3. Backend
cd backend
npm install
DATABASE_URL=postgres://hapfam@127.0.0.1:55432/hapfam_mmis node src/seed.js
DATABASE_URL=postgres://hapfam@127.0.0.1:55432/hapfam_mmis npm start   # :4000
```

Copy `.env.example` to `.env` and set `EXPO_PUBLIC_API_URL=http://127.0.0.1:4000`
before building the frontend so it talks to the local API.

### Demo accounts (password `Hapfam@2026Secure`, 17 characters)

| Email | Role / workspace |
| --- | --- |
| `manager@hapfam.co.ug` | Manager — announcements & audit |
| `production@hapfam.co.ug` | Production Manager |
| `inventory@hapfam.co.ug` | Store Keeper |
| `quality@hapfam.co.ug` | Quality Assurance Officer |

Passwords are bcrypt-hashed; new accounts require ≥12 characters with upper, lower,
number and symbol. JWT bearer tokens protect every API route except login/health.

## Tests

```bash
cd backend && npm test          # 44 end-to-end assertions (Postgres required)
cd hapfam && npm run typecheck && npm run vercel-build
```

The end-to-end suite verifies authentication, password policy, announcements and
replies (with department origin), cross-department notifications, material issue,
stock deduction, quality approval/rejection, saleable-stock rules, CRUD in all three
departments and audit permissions.

## Deployment

* Web export is a static SPA (`dist/`). GitHub Actions runs CI and deploys to Vercel.
* Vercel project: **hapfam** → `https://hapfam.vercel.app`
* Required GitHub secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`,
  `EXPO_PUBLIC_API_URL`, `DATABASE_URL`, `JWT_SECRET`, `SEED_PASSWORD`.
* Content imagery is WebP. Platform app icons remain PNG because Expo/iOS require PNG.

## Notes

Historical demo records are labelled as demonstration data and are seeded separately
from live transaction records. Quality specification limits are **configuration**,
not invented laboratory standards — authorised quality staff configure them in
Quality → Settings.
