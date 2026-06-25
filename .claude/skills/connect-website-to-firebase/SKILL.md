---
name: connect-website-to-firebase
description: Connect a website to Google Firebase — Authentication, databases (Firestore vs Realtime Database), Cloud Storage, and Hosting. Use when wiring a web app to Firebase, choosing a database, writing or auditing security rules, configuring the Firebase console, or deploying. Generates a FIREBASE.md documenting which Firebase features the project uses and how to configure them.
---

# Connect a Website to Firebase

Wire a web project to Google **Firebase** and document it. This skill
walks a project through the four core Firebase services step by step,
helps choose the right database, manages security rules, and produces a
`FIREBASE.md` so the team understands what is configured and why.

> Firebase is Google's platform. If the user says "AWS"/"Amazon," that
> is a different product (AWS Amplify) — confirm before proceeding.

## What you do, in order

1. Identify which services the project needs (Auth? a database? file
   uploads? hosting?). Don't enable what isn't used.
2. Walk the **console setup** for each (these are clicks the user makes —
   you can't do them, so give exact, numbered steps).
3. Wire the **client SDK** in code.
4. Write and review **security rules** for any database/storage used.
5. Generate **`FIREBASE.md`** documenting the above (template:
   [templates/FIREBASE.md](templates/FIREBASE.md)).

## 0. Project + SDK setup

Console steps (the user does these — provide them verbatim):

1. Go to <https://console.firebase.google.com> → **Add project**.
2. In the project, click the **web icon (`</>`)** → register the app.
3. Copy the `firebaseConfig` object shown.

Install and initialize (Firebase v9+ modular SDK):

```bash
npm install firebase
```

```ts
// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
```

Put the values in `.env` (gitignored). The web `apiKey` is **not a
secret** — it identifies the project; security comes from rules, not
from hiding the key.

## 1. Authentication

Console: **Build → Authentication → Get started**, then enable the
sign-in providers you need (Email/Password, Google, etc.). For Google
OAuth, add your domain under **Settings → Authorized domains**.

```ts
// src/lib/auth.ts
import { getAuth, GoogleAuthProvider, signInWithPopup,
         signOut, onAuthStateChanged } from 'firebase/auth';
import { app } from './firebase';

export const auth = getAuth(app);
const google = new GoogleAuthProvider();

export const signInWithGoogle = () => signInWithPopup(auth, google);
export const logout = () => signOut(auth);
export const watchAuth = (cb: (uid: string | null) => void) =>
  onAuthStateChanged(auth, (user) => cb(user?.uid ?? null));
```

The `uid` from auth is the key you scope all data and rules around.

## 2. Choosing a database — Firestore vs Realtime Database

Default to **Cloud Firestore** unless you have a specific reason for
Realtime Database.

| Use **Cloud Firestore** when… | Use **Realtime Database** when… |
|---|---|
| You want structured collections/documents and rich querying (filtering, compound queries, pagination). | You need the lowest-latency sync of a small, frequently-changing JSON tree (presence, live cursors, chat typing state). |
| Data is relational-ish: users, posts, comments. | Data is one big JSON blob and queries are simple key lookups. |
| You expect to scale and want better multi-region support. | You have an existing RTDB app or very high write frequency on tiny values. |
| **This is the right default for most websites.** | It's the exception, not the default. |

You can use both in one project, but only if each earns its place.

### Firestore wiring

Console: **Build → Firestore Database → Create database** (start in
**production mode** so it's locked by default, then write rules).

```ts
// src/lib/db.ts
import { getFirestore, collection, addDoc, query,
         where, getDocs, serverTimestamp } from 'firebase/firestore';
import { app } from './firebase';

export const db = getFirestore(app);

export const addNote = (uid: string, text: string) =>
  addDoc(collection(db, 'notes'),
    { uid, text, createdAt: serverTimestamp() });

export const getMyNotes = (uid: string) =>
  getDocs(query(collection(db, 'notes'), where('uid', '==', uid)));
```

## 3. Cloud Storage (file uploads)

Console: **Build → Storage → Get started** (production mode).

```ts
// src/lib/storage.ts
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app } from './firebase';

export const storage = getStorage(app);

export async function uploadAvatar(uid: string, file: File) {
  const r = ref(storage, `avatars/${uid}/${file.name}`);
  await uploadBytes(r, file);
  return getDownloadURL(r);
}
```

Scope paths by `uid` (e.g. `avatars/{uid}/...`) so rules can grant each
user only their own folder.

## 4. Hosting + deploy

```bash
npm install -g firebase-tools
firebase login
firebase init           # select Hosting (+ Firestore/Storage rules); set build dir (Vite: dist)
npm run build
firebase deploy
```

`firebase init` writes `firebase.json`, `firestore.rules`, and
`storage.rules` into the repo — **commit these**; they are the source of
truth for rules, not the console editor.

## 5. Security rules — the part that actually protects data

Rules live in the repo and deploy with `firebase deploy --only
firestore:rules,storage`. The default posture: **deny everything, then
allow the minimum.** Always require auth and scope by `uid`.

`firestore.rules`:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /notes/{noteId} {
      // read/write only your own notes
      allow read, write: if request.auth != null
                         && request.auth.uid == resource.data.uid;
      allow create: if request.auth != null
                    && request.auth.uid == request.resource.data.uid;
    }
  }
}
```

`storage.rules`:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /avatars/{uid}/{file} {
      allow read: if true;                         // public avatars
      allow write: if request.auth != null
                   && request.auth.uid == uid;     // only owner uploads
    }
  }
}
```

Review checklist for any ruleset:
- [ ] No `allow read, write: if true;` left from "test mode."
- [ ] Every rule requires `request.auth != null` unless data is
      intentionally public.
- [ ] Ownership is enforced (`request.auth.uid == ...`).
- [ ] `create` validates `request.resource.data`; `update`/`read`
      validate `resource.data`.
- [ ] Test in the console **Rules Playground** before deploying.

## 6. Document it — generate FIREBASE.md

After wiring services, create/update `FIREBASE.md` at the project root
from [templates/FIREBASE.md](templates/FIREBASE.md). Fill in only the
services actually used, the exact console steps to reproduce the setup,
the env vars, and where the rules live. This is the artifact that lets
the next person configure the console without guessing.

## Gotchas

- **"Missing or insufficient permissions."** Rules are denying the read.
  Check auth state is loaded and the rule's `uid` match is correct.
- **Auth popup blocked / `auth/unauthorized-domain`.** Add the domain
  under Authentication → Settings → Authorized domains (localhost is
  there by default; your deployed domain is not).
- **Don't ship in test mode.** "Start in test mode" sets
  `allow ... if true` with a 30-day expiry — it fails open. Use
  production mode and write rules.
- **`storageBucket` mismatch.** Must match the bucket in the console
  exactly, or uploads 404.
