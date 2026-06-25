# Firebase Configuration

> How this project uses Firebase, and how to reproduce the setup in the
> [Firebase console](https://console.firebase.google.com).
> Keep this file in sync whenever a Firebase service is added or changed.

## Project

- **Firebase project name:** `<your-project>`
- **Project ID:** `<your-project-id>`
- **Console:** https://console.firebase.google.com/project/<your-project-id>
- **Client config lives in:** `src/lib/firebase.ts`, values from `.env`

### Environment variables

| Var | Where to find it in the console |
|---|---|
| `VITE_FIREBASE_API_KEY` | Project settings → Your apps → Web app → SDK config |
| `VITE_FIREBASE_AUTH_DOMAIN` | same |
| `VITE_FIREBASE_PROJECT_ID` | same |
| `VITE_FIREBASE_STORAGE_BUCKET` | same |
| `VITE_FIREBASE_APP_ID` | same |

(The web `apiKey` is not a secret — it identifies the project. Data is
protected by security rules, not by hiding the key.)

## Services used

> Delete the sections for services this project does NOT use.

### Authentication — _used: yes/no_

- **Providers enabled:** _e.g. Email/Password, Google_
- **Console path:** Build → Authentication → Sign-in method
- **Authorized domains:** _list deployed domains added under
  Authentication → Settings → Authorized domains_
- **Code:** `src/lib/auth.ts`

### Database — _Firestore / Realtime Database / both_

- **Why this database:** _one line on why Firestore or RTDB was chosen_
- **Console path:** Build → Firestore Database (or Realtime Database)
- **Collections / shape:**
  | Collection | Purpose | Key fields |
  |---|---|---|
  | `notes` | per-user notes | `uid`, `text`, `createdAt` |
- **Code:** `src/lib/db.ts`
- **Rules:** `firestore.rules` (deployed via `firebase deploy --only firestore:rules`)

### Cloud Storage — _used: yes/no_

- **Console path:** Build → Storage
- **Path layout:** _e.g. `avatars/{uid}/{file}`_
- **Code:** `src/lib/storage.ts`
- **Rules:** `storage.rules`

### Hosting — _used: yes/no_

- **Console path:** Build → Hosting
- **Build output dir:** _e.g. `dist`_
- **Deploy:** `npm run build && firebase deploy`
- **Config:** `firebase.json`

## Security rules summary

- Rules source of truth: `firestore.rules`, `storage.rules` (in repo).
- Posture: deny by default; require `request.auth != null`; scope by `uid`.
- Test changes in the console **Rules Playground** before deploying.
- Deploy: `firebase deploy --only firestore:rules,storage`

## Reproducing this setup from scratch

1. Create the project in the console.
2. Register a web app, copy config into `.env`.
3. Enable the services listed above (exact console paths given per service).
4. `firebase init` → select the services in use, set build dir.
5. `firebase deploy` to push hosting + rules.
