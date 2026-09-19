# AGENTS.md

## Project overview
Super Converter Pro is a **fully static, client-side PWA** (PDF/document converter toolkit).
There is no backend, no build step, no package manager, and no database.

- `index.html` — the entire app: markup, styles, and all converter logic inline (~6500+ lines).
- `js/tools/*.js` — orphaned ES-module helpers (`image-resizer.js`, `pdf-merge.js`); **not referenced** by `index.html`. The real implementations live inline in `index.html`.
- `sw.js` — service worker (cache-first PWA shell).
- `manifest.json`, `icon-*.png` — PWA manifest + icons.
- `privacy-policy.html`, `terms.html` — static legal pages.

## How it runs
Served as static files by `nginx:alpine` via `docker-compose.base44.yml` (repo bind-mounted
read-only at `/usr/share/nginx/html`, host port `3000` → container `80`).

No live-reload dev server exists for a static site — edits to `index.html` appear on a
browser refresh; call `reload_preview` after changes so the user sees them.

## Dependencies / credentials
- All third-party libraries (pdf-lib, pdf.js, docx, jspdf, html2canvas, mammoth, xlsx,
  tesseract.js, opencv.js) load from CDNs at runtime — no install needed.
- Google Drive "save to Drive" uses a **public OAuth client ID** already hardcoded in
  `index.html` (`GOOGLE_DRIVE_CLIENT_ID`). This is not a secret and needs no user input.
- No external credentials are required to boot.

## Verify it works
`curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/` → `200`, and the page
title is "Super Converter Pro - HD Studio".
