# Modern Skill Educational Trust (MSET)

Pure **HTML5 + CSS3 + Vanilla JS** — no Tailwind, no Bootstrap, no framework. Same design, fast loading.

## Pages (15)
- `index.html` - Home
- `about.html` - About, team, legal
- `mission-vision.html` - Mission & Vision
- `services.html` - Services / Projects (was courses)
- `courses.html` - Free courses (old page, kept)
- `admissions.html` - Admission form
- `donate.html` - Donate (80G)
- `gallery.html` - Gallery (images + video ready)
- `downloads.html` - PDFs & documents
- `blog.html` - Blog stories
- `notices.html` - Official notices
- `volunteer.html` - Volunteer form
- `contact.html` - Contact + FAQs
- `privacy.html` - Privacy Policy
- `terms.html` - Terms & Conditions

## Shared components (Vanilla JS)
- `js/layout.js` - header + footer + nav injected into `#site-header` / `#site-footer`
- `js/main.js` - menu, counters, forms, gallery filter
- `js/api.js` - public API loader with demo fallback (notices, blog, downloads)
- `css/style.css` - single stylesheet, responsive (`950px` / `600px`)
- `assets/logo.svg` - local logo/favicon

## Backend (Cloudflare)
- `functions/api/` - Pages Functions (Phase 4+)
- `migrations/0001_init.sql` - D1 tables (Phase 5)
- `wrangler.toml` - publish `frontend/`, D1+R2 bindings (placeholder)

## Run locally
Just open `frontend/index.html` in browser. No build needed.

Or with VS Code Live Server / python:
```
python -m http.server 8000
```
(then open `http://localhost:8000/frontend/` — or serve inside `frontend/`)

## Tech
Pure HTML + CSS + JS. No CDN framework.
