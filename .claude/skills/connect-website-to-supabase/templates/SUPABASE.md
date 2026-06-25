# Supabase Configuration

> How this project uses Supabase, and how to reproduce the setup in the
> [Supabase dashboard](https://supabase.com/dashboard).
> Keep this file in sync whenever a Supabase service is added or changed.

## Project

- **Project name:** `<your-project>`
- **Project ref / URL:** `https://<ref>.supabase.co`
- **Dashboard:** https://supabase.com/dashboard/project/<ref>
- **Client config lives in:** `src/lib/supabase.ts`, values from `.env`
- **Region:** `<chosen region>`

### Environment variables

| Var | Where to find it | Exposure |
|---|---|---|
| `VITE_SUPABASE_URL` | Project Settings → API → Project URL | safe in browser |
| `VITE_SUPABASE_ANON_KEY` | Project Settings → API → anon public | safe in browser (gated by RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API → service_role | **SECRET — server only**, bypasses RLS |

## Services used

> Delete the sections for services this project does NOT use.

### Authentication — _used: yes/no_

- **Providers enabled:** _e.g. Email/Password, Google, magic link_
- **Dashboard path:** Authentication → Providers
- **Redirect URLs:** _list site URLs added under Authentication → URL
  Configuration_
- **Code:** `src/lib/auth.ts`

### Database (Postgres) — _used: yes/no_

- **Dashboard path:** Table Editor / SQL Editor
- **Tables:**
  | Table | Purpose | Key columns | RLS? |
  |---|---|---|---|
  | `notes` | per-user notes | `id`, `user_id`, `text`, `created_at` | yes |
- **Realtime enabled on:** _list tables, or "none"_
- **Migrations / schema SQL:** _path in repo, e.g. `supabase/migrations/`_
- **Code:** `src/lib/db.ts`

### Storage — _used: yes/no_

- **Buckets:** _name + public/private, e.g. `avatars` (public)_
- **Path layout:** _e.g. `avatars/{userId}/{file}`_
- **Code:** `src/lib/storage.ts`
- **Policies:** RLS on `storage.objects` (see SQL below)

### Edge Functions — _used: yes/no_

- **Functions:** _list names + purpose_
- **Deploy:** `supabase functions deploy <name>`

## Row Level Security summary

- RLS is enabled on: _list every table_
- Policies key on `auth.uid()`; source of truth = SQL migrations in repo.
- Storage access controlled by policies on `storage.objects`.
- Verify: query as anon and as a logged-in user; confirm row isolation.

## Hosting

- **Frontend hosted on:** _Vercel / Netlify / Cloudflare Pages_
- **Build output:** _e.g. `dist`_
- **Env vars set in:** the hosting provider's dashboard (not Supabase)
- Supabase provides the backend only — it does **not** host the site.

## Reproducing this setup from scratch

1. Create the project in the dashboard; note URL + anon key into `.env`.
2. Run the schema SQL / migrations in the SQL Editor.
3. Enable RLS and apply the policies (SQL in repo).
4. Enable the auth providers and add redirect URLs.
5. Create storage buckets + policies.
6. Deploy the frontend to the hosting provider with the env vars set.
