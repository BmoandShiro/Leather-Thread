# Leather & Thread

The public concept storefront and private owner workspace run as one portable Node application. Operational data is stored in SQLite; private uploads live beside it on disk.

## Start locally

1. Install Node.js 22 or newer.
2. Copy `.env.example` to `.env` and change `OWNER_PASSWORD` and `SESSION_SECRET`.
3. Install dependencies: `npm install`
4. Start development: `npm run dev`
5. Open <http://127.0.0.1:3000>. The owner login is at `/admin`.

The npm scripts avoid shell-sensitive project paths, including the `&` in this folder name.

## Production / Arch Linux

Run `npm ci`, `npm run build`, `npm run db:migrate`, then `npm start`. By default the server binds only to `127.0.0.1`. Keep that default and place Caddy or nginx with TLS in front of it if remote access is needed. A sample systemd service is in `deploy/leather-thread.service`.

Set `LEATHER_THREAD_DATA_DIR` to an absolute persistent directory such as `/var/lib/leather-thread`. Give the service user read/write access to that directory only. The application never embeds Windows paths in its records.

## Backups and restore

Run `npm run db:backup`. This creates a consistent SQLite backup plus an uploads copy under `<data>/backups/<timestamp>`.

To restore while the app is stopped, copy the selected backup's `leather-thread.sqlite` and `uploads` directory into the configured data directory. Keep the original data directory until the restored app starts, `npm run db:migrate` succeeds, and the inventory and protected files have been checked.

## OCR boundaries

Receipt images are processed locally with Tesseract. The original is preserved, extracted text is a draft, and structured records require owner confirmation. PDFs are preserved but currently use the manual-entry fallback rather than rasterizing pages. No upload is public.

## Moving the project

Copy the repository, the entire configured data directory, and the private `.env` separately. On the new host, install dependencies, run migrations, build, start, and verify the dashboard counts and a protected file before retiring the old copy.
