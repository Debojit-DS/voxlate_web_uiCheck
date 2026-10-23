# Voxlate — Waitlist site with MongoDB backend + Admin dashboard

> **Security notice:** If secrets were ever hardcoded in this repository, they may still exist in the full git history even after removal. Rotate any previously hardcoded secrets (database passwords, JWT secrets, API keys, OAuth client secrets) immediately, and audit your provider dashboards for unauthorized access. Never commit `.env` files.

This project is your original Voxlate frontend, wired up to a real backend:
Next.js Route Handlers, a MongoDB database via Prisma, JWT session auth, and
an admin dashboard at `/admin`. Built to run on Vercel (or any host) with
MongoDB Atlas as the database, since Vercel's serverless functions don't
have a persistent filesystem.

## What was added

```
prisma/
  schema.prisma        User + WaitlistEntry models (MongoDB)
  seed.ts               Creates the first admin user from env vars

lib/
  db.ts                  Prisma client singleton
  auth.ts                Password hashing (bcrypt) + JWT session cookies (jose)
  session.ts             Server-side helpers to read the current session
  authApi.ts              (updated) now calls the real API instead of mocks
  waitlistApi.ts          (updated) now calls the real API instead of mocks

app/api/
  auth/signup/route.ts
  auth/login/route.ts
  auth/logout/route.ts
  auth/me/route.ts
  waitlist/route.ts
  admin/waitlist/route.ts         GET (list/search/filter/paginate), DELETE
  admin/waitlist/export/route.ts  GET → CSV download
  admin/users/route.ts            GET (list/search), PATCH (promote/demote)
  admin/stats/route.ts            GET → dashboard counts/breakdowns

app/admin/
  login/page.tsx          Admin sign-in page
  page.tsx + layout.tsx    Dashboard shell (protected)

components/admin/AdminDashboard.tsx   Overview / Waitlist / Users tabs

middleware.ts             Blocks /admin/* and /api/admin/* for non-admins
```

## 1. Install dependencies

```bash
npm install
```

This adds `@prisma/client`, `prisma`, `bcryptjs`, `jose`, and `tsx` to what
you already had.

## 2. Set up MongoDB Atlas

1. Create a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas/register).
2. **Database Access** → add a database user with a username/password
   (not your Atlas login — a separate DB user).
3. **Network Access** → add an IP entry. For Vercel deployments, allow
   `0.0.0.0/0` (Vercel's serverless functions don't have fixed IPs), since
   auth is already handled by the DB user's password.
4. **Database → Connect → Drivers** → copy the connection string. It looks
   like:
   ```
   mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
   Add a database name before the `?` — e.g. `.../voxlate?retryWrites=...`.

Copy the env file and fill in your values:

```bash
cp .env.example .env.local
```

- `DATABASE_URL` — your MongoDB Atlas connection string (with the `voxlate`
  database name added, and `<user>`/`<password>` filled in)
- `JWT_SECRET` — generate with `openssl rand -base64 32`
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — used once by the seed script below

## 3. Create the collections

```bash
npm run db:push
```

MongoDB doesn't use Prisma Migrate (no schema migrations for a document
database) — `db push` syncs your `schema.prisma` models straight to Atlas,
creating collections and indexes (including the `@unique` email indexes) as
needed. Re-run this any time you change `schema.prisma`.

## 4. Create your first admin user

```bash
npm run db:seed
```

Reads `ADMIN_NAME` / `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env.local`. Safe
to re-run — it won't duplicate the user, and it'll promote an existing user
to admin if the email already exists. You can remove `ADMIN_PASSWORD` from
`.env.local` afterward.

## 5. Run it

```bash
npm run dev
```

- Public site: `http://localhost:3000`
- Admin sign-in: `http://localhost:3000/admin/login`

## Deploying to Vercel

1. Push this repo to GitHub and import it in Vercel.
2. In Vercel's project settings → Environment Variables, add `DATABASE_URL`,
   `JWT_SECRET`, and (optionally, just for the one-time seed) `ADMIN_EMAIL` /
   `ADMIN_PASSWORD` / `ADMIN_NAME`.
3. Deploy. `postinstall` runs `prisma generate` automatically during the
   build.
4. Run the seed once against production — easiest is to run it locally
   pointed at the same `DATABASE_URL` as production (`npm run db:seed`), or
   add a temporary one-off Vercel deployment/CLI command. There's no
   `db:push`/seed step wired into the Vercel build itself, since you
   generally don't want schema pushes or admin seeding running on every
   deploy.

## How auth works

- Passwords are hashed with bcrypt (cost 12), never stored in plain text.
- On login/signup, a JWT is signed (`lib/auth.ts`) and stored in an
  **httpOnly, sameSite=lax** cookie — not readable from client JS, which
  protects it from XSS token theft.
- `middleware.ts` runs on the Edge runtime and checks that cookie before
  allowing any request into `/admin/*` pages or `/api/admin/*` routes. It
  redirects unauthenticated/non-admin users to `/admin/login`.
- Route handlers also re-check `requireAdmin()` server-side as defense in
  depth, in case middleware config ever changes.
- Admin status is just a `role` field (`USER` / `ADMIN`) on the same `User`
  collection — promote/demote anyone from the Users tab in `/admin`.

## Notes

- `NEXT_PUBLIC_API_BASE_URL` is no longer required — `authApi.ts` and
  `waitlistApi.ts` call same-origin `/api/...` routes directly. Only set it
  if you later split the backend into a separately-deployed service.
- The waitlist "position" returned on signup is a simple count of entries
  created at or before that entry — adjust if you want a different
  definition (e.g. FIFO queue number, product-specific position).
- IDs are MongoDB `ObjectId`s (24-char hex strings) rather than the `cuid()`
  strings used in the MySQL version — this doesn't affect any app code,
  since Prisma Client's API is identical either way.
- To browse/edit data visually, run `npm run db:studio` (Prisma Studio), or
  use MongoDB Atlas's own web-based data browser.

## Security

- All secrets (database URL, JWT secret, admin credentials, OAuth client ID)
  are loaded from environment variables. No secret is hardcoded in the
  application source.
- `.env` and `.env*.local` are gitignored. Copy `.env.example` to `.env` and
  fill in your own values before running locally.
- The Google client ID exposed via `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is
  client-safe by design. The JWT secret and database URL never leave the
  server.
- If you suspect any secret was previously committed, rotate it immediately
  in the provider dashboard and update the value in your local `.env`.
