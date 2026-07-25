# Snobo Labs — Full Stack (MERN)

Next.js frontend + Express/MongoDB backend. Two separate apps that run side by side, same pattern as your other projects.

```
snobo-labs-app/
├── app/            → Next.js pages (frontend)
├── components/     → React components (frontend)
├── public/         → images (frontend)
└── server/         → Express + MongoDB API (backend)
```

## 1. Backend setup (do this first)

```
cd server
npm install
cp .env.example .env
```

Edit `.env` in Acode:
- `MONGODB_URI` — paste your real connection string with password
- `JWT_SECRET` — any long random string (e.g. mash your keyboard for 40 characters)
- `RESEND_API_KEY` — get free from resend.com, needed for hire-form emails to actually send
- `NOTIFY_EMAIL` — already set to snobolabs@gmail.com

Create your admin login (run once):
```
node seedAdmin.js
```
This creates an admin account: `snobolabs@gmail.com` / `ChangeThisPassword123` — log in once, then change this password (there's no "change password" UI yet — for now, edit it directly in MongoDB Atlas or re-run seedAdmin.js with a new password after deleting the old user).

Start the backend:
```
npm run dev
```
Should print: `Snobo Labs API running on port 5000`

## 2. Frontend setup

Open a **second Termux session** (swipe from left edge → new session, or use `tmux`) so the backend keeps running:

```
cd snobo-labs-app
npm install
cp .env.local.example .env.local
```

Edit `.env.local` — same Mongo/Resend values, plus:
- `NEXT_PUBLIC_API_URL=http://localhost:5000` (already set, matches backend port)

Start the frontend:
```
npm run dev
```
Open `http://localhost:3000` in your phone browser.

## What's now working end-to-end

- **Homepage** — hero, 3D blob, mascot, manifesto, services list
- **`/hire`** — real hire form, submits to the backend, saves to MongoDB, sends email via Resend (to you + confirmation to the client)
- **`/admin/login`** — admin login page
- **`/admin/dashboard`** — leads list, change status (New/Contacted/Converted/Closed) inline

## API endpoints (backend, port 5000)

- `POST /api/auth/register` — create account (name, email, password)
- `POST /api/auth/login` — returns JWT token
- `GET /api/auth/me` — get current user (requires token)
- `POST /api/inquiries` — submit hire form (public, optionally attaches logged-in user)
- `GET /api/inquiries` — list all leads (admin only)
- `PATCH /api/inquiries/:id/status` — update lead status (admin only)
- `GET /api/inquiries/me` — client's own inquiry history (requires token)

## Still not built (next phases)

- Individual service pages (`/services/sites`, `/services/chat`, etc.) with locked-service hire form
- Client-facing signup/login + "My Snobo" purchase history page (backend routes exist — `/api/inquiries/me` — frontend page doesn't yet)
- Google Sign-In (dropped for now per earlier decision — email/password only)
- Blog/changelog
- WhatsApp integration (click-to-chat button)

## Deploying later (when ready to go live)

- Frontend → Vercel (free tier, made for Next.js)
- Backend → Railway or Render (free tiers available for small Express apps)
- Update `NEXT_PUBLIC_API_URL` in frontend to point to your deployed backend URL
- Point `snobolabs.in` DNS to Vercel

## Notes

- Backend and frontend are separate apps — both need `npm install` and both need to be running (two terminal sessions) for the site to fully work locally
- CORS is open (`cors()` with no restrictions) for local dev — tighten this before going live
- The `seedAdmin.js` password is a placeholder — treat it as temporary, change it before real use
