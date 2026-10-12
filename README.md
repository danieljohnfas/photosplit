# PhotoSplit Studio

[photosplitstudio.com](https://photosplitstudio.com): free in-browser tools for digitising photos.
The main tool splits a flatbed scan of several prints into separate images; the site also has
convert, crop, resize, passport-photo and transcription tools and a blog about scanning.

## Layout

- `app.html` + `js/app.js` / `js/worker.js`: photo splitter
- `convert.html`, `crop.html`, `resize.html`, `passport.html`, `transcribe.html`: other tools
- `components/`: shared header, footer and widget slots, copied into pages by `build.js`
  (review the diff after running it; it is not idempotent)
- `js/amazon-products.js`: Amazon affiliate widgets (search links, tag `photoid03-20`)
- `blog/`: articles
- `reports/`, `logs/`, `tests/`: daily automated test output (kept out of the public site
  by `.assetsignore`)

## Deploy

Pushing to `main` runs `.github/workflows/deploy.yml`, which uploads the repo as static assets
with `wrangler deploy`. Anything that must not be public goes in `.assetsignore`.
