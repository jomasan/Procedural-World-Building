---
name: connect-website-to-supabase
description: Connect a website to Supabase — Authentication, the Postgres database, Storage, and deployment/hosting. Use when wiring a web app to Supabase, setting up auth, designing tables, writing Row Level Security policies, configuring storage buckets, or deploying a Supabase-backed site. Generates a SUPABASE.md documenting which Supabase features the project uses and how to configure them.
---

# Connect a Website to Supabase

Wire a web project to **Supabase** (the open-source Postgres backend) and
document it. This skill walks through Auth, the database, Storage, and
deployment step by step, manages Row Level Security, and produces a
`SUPABASE.md` so the team understands what is configured and why.

> Supabase ≠ Firebase. The big differences: the database is **real
> Postgres** (SQL, relations, migrations), security is **Row Level
> Security (RLS) policies written in SQL**, and Supabase has **no
> first-party website hosting** — you host the site on Vercel/Netlify and
> use Supabase for the backend. Call these out to anyone coming from
> Firebase.

## What you do, in order

1. Identify which services the project needs (Auth? tables? file
   uploads? edge functions?).
2. Walk the **dashboard setup** for each (the user clicks these — give
   exact, numbered steps).
3. Wire the **client SDK** (`@supabase/supabase-js`).
4. Write and review **RLS policies** for every table and storage bucket.
5. Generate **`SUPABASE.md`** (template:
   [templates/SUPABASE.md](templates/SUPABASE.md)).

## 0. Project + SDK setup

Dashboard steps (the user does these — provide them verbatim):

1. Go to <https://supabase.com/dashboard> → **New project**. Pick a
   region close to users; save the database password.
2. Open **Project Settings → API**. Copy the **Project URL** and the
   **anon public** key.

Install and initialize:

```bash
npm install @supabase/supabase-js
```

```ts
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);
```

Put values in `.env` (gitignored). The **anon key is safe in the
browser** — it only grants what RLS allows. The **`service_role` key is a
secret**: server-side only, never ship it to the client; it bypasses RLS.

## 1. Authentication

Dashboard: **Authentication → Providers**, enable what you need
(Email, Google, GitHub, magic link…). For OAuth, add your site URL under
**Authentication → URL Configuration → Redirect URLs**.

```ts
// src/lib/auth.ts
import { supabase } from './supabase';

export const signUp = (email: string, password: string) =>
  supabase.auth.signUp({ email, password });

export const signIn = (email: string, password: string) =>
  supabase.auth.signInWithPassword({ email, password });

export const signInWithGoogle = () =>
  supabase.auth.signInWithOAuth({ provider: 'google' });

export const signOut = () => supabase.auth.signOut();

export const watchAuth = (cb: (userId: string | null) => void) =>
  supabase.auth.onAuthStateChange((_e, session) =>
    cb(session?.user?.id ?? null));
```

`auth.uid()` (the logged-in user's id) is what every RLS policy keys on.

## 2. Database — Postgres tables

Supabase is **one Postgres database**. There is no "Firestore vs
Realtime DB" choice — you design tables. Create them in **Table Editor**
or via the **SQL Editor** (preferred — it's reproducible and lives in
version control as a migration).

```sql
-- run in SQL Editor (and save as a migration)
create table notes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  text       text not null,
  created_at timestamptz not null default now()
);
```

Query it from the client:

```ts
// src/lib/db.ts
import { supabase } from './supabase';

export const addNote = (text: string) =>
  supabase.from('notes').insert({ text });  // user_id set by default/policy

export const getMyNotes = () =>
  supabase.from('notes').select('*').order('created_at', { ascending: false });
```

**When to reach for what:**
- Relational data, queries, joins → just use tables (the default).
- Live updates (chat, presence) → enable **Realtime** on the table and
  `supabase.channel(...).on('postgres_changes', ...)`.
- Heavy/custom logic → a Postgres **function** + RPC (`supabase.rpc(...)`),
  or an **Edge Function** for non-SQL work.

## 3. Storage (file uploads)

Dashboard: **Storage → New bucket**. Choose **public** (anyone with the
URL can read) or **private** (reads gated by policy).

```ts
// src/lib/storage.ts
import { supabase } from './supabase';

export async function uploadAvatar(userId: string, file: File) {
  const path = `${userId}/${file.name}`;
  const { error } = await supabase.storage
    .from('avatars').upload(path, file, { upsert: true });
  if (error) throw error;
  return supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl;
}
```

Scope object paths by `userId` (`avatars/{userId}/...`) so storage
policies can grant each user only their own folder.

## 4. Hosting / deployment

**Supabase does not host websites.** Host the frontend on **Vercel** or
**Netlify** and point it at Supabase via the env vars. Typical flow:

```bash
npm run build                 # Vite → dist/
# then connect the repo in Vercel/Netlify, OR:
npx vercel --prod             # set VITE_SUPABASE_URL / _ANON_KEY in the host's env settings
```

For serverless backend logic, use **Supabase Edge Functions**:

```bash
npm install -g supabase
supabase login
supabase functions new hello
supabase functions deploy hello
```

Set the frontend's env vars in the **hosting provider's** dashboard, not
in Supabase.

## 5. Row Level Security — the part that actually protects data

This replaces Firebase rules. **RLS is off-by-default-deny once enabled,
and tables are wide open until you enable it.** Always:

1. Enable RLS on every table.
2. Add policies that key on `auth.uid()`.

```sql
-- enable RLS, then policies
alter table notes enable row level security;

create policy "read own notes"   on notes for select
  using (auth.uid() = user_id);

create policy "insert own notes" on notes for insert
  with check (auth.uid() = user_id);

create policy "modify own notes" on notes for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "delete own notes" on notes for delete
  using (auth.uid() = user_id);
```

A clean default for `user_id` so inserts don't need it client-side:

```sql
alter table notes alter column user_id set default auth.uid();
```

**Storage policies** are RLS on the `storage.objects` table:

```sql
create policy "read avatars" on storage.objects for select
  using (bucket_id = 'avatars');

create policy "write own avatar" on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
```

Review checklist for any table/bucket:
- [ ] `enable row level security` is set (a table with RLS off is fully
      exposed to the anon key).
- [ ] Every policy uses `using` (read/update/delete) and/or `with check`
      (insert/update) keyed on `auth.uid()`.
- [ ] No "allow all" policy (`using (true)`) left from testing.
- [ ] Test as an anon user and as a logged-in user — confirm one user
      can't see another's rows.

## 6. Document it — generate SUPABASE.md

After wiring services, create/update `SUPABASE.md` from
[templates/SUPABASE.md](templates/SUPABASE.md): the services used, exact
dashboard steps, env vars, table schemas, where RLS policies live (save
them as SQL migrations in the repo), and the hosting target. This is the
artifact that lets the next person reproduce the project.

## Gotchas

- **Empty results, no error.** Almost always RLS denying the rows. Check
  the table has policies and the user is authenticated. (A *missing*
  policy = deny; you don't get an error, you get `[]`.)
- **Table fully public.** RLS is **off** until you `enable row level
  security` — a new table is readable/writable by anyone with the anon
  key. Enable it before going live.
- **`service_role` key leaked to the client.** It bypasses RLS entirely.
  It belongs only in server/Edge Function env, never in frontend code.
- **OAuth redirect mismatch.** Add your exact site URL under
  Authentication → URL Configuration → Redirect URLs, or login bounces.
- **Expecting Firebase Hosting.** There isn't one — deploy the site to
  Vercel/Netlify and put the env vars in *that* dashboard.
