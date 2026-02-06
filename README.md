# Zoho App (Next.js frontend – sales-order-edit)

Next.js frontend for the Zoho-style app (sales, purchases, customers, invoices, etc.). Served at **`/zoho`** behind nginx.

## Stack

- **Frontend:** Next.js 16 (this app), runs on port **3001**
- **Nginx:** Reverse proxy; `/zoho` → `http://127.0.0.1:3001`
- **Gunicorn:** Serves the main Django app on port **8001** (unchanged)

## First-time setup

```bash
cd /srv/mekco/zoho

# Install dependencies (use pnpm or npm)
pnpm install
# or: npm install

# Build for production
pnpm run build
# or: npm run build
```

## Run locally (dev)

```bash
cd /srv/mekco/zoho
pnpm run dev
# App: http://localhost:3000 (dev server; basePath /zoho still applies when behind nginx)
```

## Run for production (after build)

From `/srv/mekco/zoho` run the app so nginx can proxy to it:

```bash
cd /srv/mekco/zoho
npm run start
# or: pnpm run start
# Listens on port 3001. Keep this running (e.g. in tmux/screen or your process manager).
```

Then reload nginx so it uses the updated config:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

**Optional – run as systemd service** (so `sudo systemctl restart zoho-next` works):

```bash
sudo cp /srv/mekco/zoho/zoho-next.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable zoho-next
sudo systemctl start zoho-next
# Then: sudo systemctl restart zoho-next  # to restart
```

**Or** use the restart script (no systemd; frees port 3001 and starts the app):

```bash
cd /srv/mekco
./restart_zoho.sh
```

## URLs

- **Behind nginx (production):** `https://mekcosupply.ca/zoho` and `https://mekcosupply.com/zoho`
- **Next.js (standalone):** `http://localhost:3001` (with basePath `/zoho`)

## Nginx + Gunicorn (main site)

- **Nginx:** Proxies `/` to Gunicorn (Django) and `/zoho` to this Next.js app (port 3001).
- **Gunicorn:** Django on port 8001 (existing setup).

Config: `/srv/mekco/nginx/sites-available/mekco` (see `nginx/README.md`). After editing, run `sudo nginx -t && sudo systemctl reload nginx`.
