# HTB Consult Academy — Deployment Guide

## Overview

| Layer    | Platform  | Notes                        |
|----------|-----------|------------------------------|
| Database | Neon DB   | Postgres (serverless)        |
| Backend  | Fly.io    | Express API + JWT auth       |
| Frontend | Vercel    | Vite React app               |
| Images   | Cloudinary| Upload preset (unsigned)     |

---

## 1. Database — Neon DB

1. Go to **https://neon.tech** and create a free account + project.
2. In the Neon dashboard, click **SQL Editor**.
3. Open `schema.sql` from this repo and paste the entire contents → click **Run**.
4. This creates all tables and seeds:
   - Default categories
   - Admin account — **email:** `phantom@htbconsult.com` | **password:** `Phantom2006++`
5. Copy your **Connection string** — looks like:
   ```
   postgresql://user:password@ep-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
   You'll use this as `DATABASE_URL`.

---

## 2. Cloudinary Setup (Image Uploads)

1. Go to **https://cloudinary.com** and create a free account.
2. In the Cloudinary dashboard, note your **Cloud Name**.
3. Go to **Settings → Upload → Upload presets** → click **Add upload preset**.
   - Set **Signing Mode** to `Unsigned`
   - Set **Folder** to `htb-academy` (optional)
   - Save the preset name (e.g. `htb_unsigned`)
4. You'll need:
   - `VITE_CLOUDINARY_CLOUD_NAME` = your cloud name
   - `VITE_CLOUDINARY_UPLOAD_PRESET` = your unsigned preset name

---

## 3. Backend — Fly.io

### Install Fly CLI
```bash
curl -L https://fly.io/install.sh | sh
fly auth login
```

### Deploy
```bash
cd backend
fly launch --name htb-consult-api --region lhr --no-deploy
```
Accept defaults, skip Postgres (we use Neon).

### Set Secrets
```bash
fly secrets set \
  DATABASE_URL="postgresql://..." \
  JWT_SECRET="your-super-secret-key-min-32-chars" \
  OPENAI_API_KEY="sk-..." \
  NODE_ENV="production" \
  PORT="3001"
```

### Deploy
```bash
fly deploy
```

Your backend will be live at: `https://htb-consult-api.fly.dev`

### fly.toml (already in /backend/fly.toml)
The file is already configured. Key settings:
- Port: 3001
- Health check: `/health`
- Region: lhr (London — closest to your likely users)

---

## 4. Frontend — Vercel

### Option A: Vercel Dashboard (Recommended)
1. Push your project to GitHub.
2. Go to **https://vercel.com** → **New Project** → import your repo.
3. Set the **Root Directory** to `.` (the project root, not `/backend`).
4. Set **Framework Preset** to `Vite`.
5. Add these **Environment Variables**:

| Variable | Value |
|---|---|
| `VITE_API_URL` | `https://htb-consult-api.fly.dev` |
| `VITE_CLOUDINARY_CLOUD_NAME` | your Cloudinary cloud name |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | your unsigned upload preset |

6. Click **Deploy**.

### Option B: Vercel CLI
```bash
npm install -g vercel
vercel login
vercel --prod
```
When prompted, set the same environment variables above.

### vercel.json (create in project root)
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## 5. Environment Variables Summary

### Backend (Fly.io secrets)
| Variable | Description |
|---|---|
| `DATABASE_URL` | Neon DB connection string |
| `JWT_SECRET` | Random secret ≥ 32 characters |
| `OPENAI_API_KEY` | OpenAI API key for AI chat |
| `PORT` | `3001` |
| `NODE_ENV` | `production` |

### Frontend (Vercel env vars)
| Variable | Description |
|---|---|
| `VITE_API_URL` | Full URL of your Fly.io backend |
| `VITE_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Cloudinary unsigned preset name |

---

## 6. Testing Your Deployment

1. Open your Vercel URL.
2. Log in with:
   - **Email:** `phantom@htbconsult.com`
   - **Password:** `Phantom2006++`
3. You should land on the dashboard as admin.
4. Go to **Admin → Courses** and create a course — test image upload.
5. Go to **Profile** — test avatar upload via Cloudinary.

---

## 7. CORS Configuration

If the frontend and backend are on different domains (they will be), ensure `backend/src/index.ts` allows your Vercel domain:

```typescript
app.use(cors({
  origin: [
    'https://your-app.vercel.app',
    'http://localhost:5000',
  ],
  credentials: true,
}));
```

Update `backend/src/index.ts` with your actual Vercel domain before deploying.

---

## 8. Keeping Backend Alive (Fly.io Free Tier)

Fly.io free tier machines may sleep. To keep it awake:
- Upgrade to a paid plan, OR
- Use a service like **UptimeRobot** to ping `https://htb-consult-api.fly.dev/health` every 5 minutes.

