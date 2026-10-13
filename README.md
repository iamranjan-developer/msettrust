# MSET — Modern Skill Educational Trust

- **Language:** JavaScript (frontend Vanilla JS + backend Pages Functions, ES Modules)
- **Framework:** Cloudflare Pages Functions (kono alada framework nei — `functions/` folder)
- **Database:** Cloudflare D1 (binding `DB` — `migrations/0001_init.sql`, 13 tables)
- **Storage:** Cloudflare R2 (binding `FILES` — gallery/faculty/hero/blog-cover/PDF)
- **Frontend:** pure HTML5 + CSS3 + Vanilla JS, same design, zero CDN. Logo sudhu `frontend/assets/logo.svg` (local core file). `assets/img/` folder nei — sob photo admin upload theke R2-te jabe.

## Project Structure — kon folder-e ki ache

Two folder roles, clearly split (frontend host + backend API). Ei duto EKTAI Cloudflare Pages project — static file + API ek shathe deploy hoy, D1+R2 shudhu oi project-e bind hoy.

```
msettrust/
├── frontend/        ← FRONTEND (Cloudflare Pages static host = apnar GitHub "frontend" folder)
│   ├── *.html       (28 public pages)
│   ├── admin/       (admin panel — login + dashboard)
│   ├── css/         (style.css — ekmatro stylesheet)
│   ├── js/          (layout.js, api.js, main.js)
│   ├── partials/    (header.html, footer.html — shared header/footer)
│   └── assets/      (logo.svg only — local core file)
├── functions/       ← BACKEND API (Cloudflare Pages Functions)
│   └── api/         (/api/* routes: public CRUD + admin + R2 upload/serve)
├── migrations/      ← BACKEND data (Cloudflare D1 SQL schema)
│   └── 0001_init.sql
├── tools/           ← BACKEND helper (make-admin.mjs — admin password hash)
├── wrangler.toml    (Cloudflare config — D1+R2 binding)
├── package.json     (scripts: dev/deploy/db:apply/admin)
└── README.md
```

**Frontend vs Backend:**
- **Frontend = `frontend/`** — boshun HTML/CSS/JS, ei folder-tai Cloudflare Pages static host kore. GitHub-e apni ei folder-tai "frontend" rakhen — eta perfect.
- **Backend = `functions/` + `migrations/` + `tools/`** — API code, D1 schema, admin tool. Ei tin-tai milে backend.

> **Important (Cloudflare limitation):** Cloudflare Pages Functions shudhu repo root-er `functions/` folder thekei code ney — ei folder-tar naam/ jaigga bodolta official support nei (Cloudflare nije custom-functions-directory feature reject koreche, workers-sdk PR #4251). Tai `functions/` root-e thakai baddhotamuluk. `migrations/` + `tools/` keo root-e rakha-i shobcheye kom confusion, nahole backend ardhek `backend/-e, ardhek root-e functions/-e bhenge jay.

## Deploy (Cloudflare Pages)
1. D1 `msettrust-db` banan -> `npm run db:apply`
2. R2 `msettrust-files` banan -> `wrangler.toml` er D1+R2 block uncomment kore ID/naam bosan
3. Prothom admin: `npm run admin -- admin <password> Admin` -> output SQL D1-te chalan
4. `npm run deploy` (publish dir: `frontend/`, build command: none)

## Local dev
- Frontend only: `frontend/index.html` khulun (backend chara placeholder dekhabe).
- Full stack: `npm run dev` -> Pages + Functions + D1/R2 local.

## API (JS Functions)
- Public GET: `/api/gallery`, `/api/faculty`, `/api/hero`, `/api/notices`, `/api/posts`, `/api/documents`, `/api/files/:key` (R2 serve). POST: `/api/contact` (D1 inbox).
- Admin: `/api/admin/login`, `/api/admin/session` (GET me / POST logout), `/api/admin/upload` (R2, max 8MB image/PDF), `/api/admin/gallery|faculty|hero` (CRUD), `/api/admin/content/notices|posts|documents|messages` (CRUD/inbox).
- Auth: HttpOnly `mset_session` cookie + D1 `sessions` table. Hash: SHA256(salt + "::" + password).

## Admin panel
`frontend/admin/` — login + Gallery/Faculty/Hero/Notices/Blog/Downloads/Inbox tabs. Logo upload nei (logo local core file).
