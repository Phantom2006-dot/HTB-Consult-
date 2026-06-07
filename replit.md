# HTB Consult Academy

A full-stack learning and consultancy platform for HighTicketBoss (HTB Consults), offering courses, mentoring, and AI-powered career advice.

## Stack

- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS + Shadcn UI
- **Backend**: Express.js (Node.js) with TypeScript
- **Database**: Replit PostgreSQL (via `pg` driver)
- **Auth**: Custom JWT authentication (bcryptjs + jsonwebtoken)
- **Routing**: React Router DOM v6
- **State**: TanStack Query (React Query)

## Project Structure

```
src/                    # React frontend
  pages/                # Route-level page components
  components/           # Reusable UI components (+ Shadcn ui/)
  contexts/             # AuthContext (JWT-based)
  hooks/                # Data-fetching hooks
  lib/                  # api.ts fetch wrapper
  integrations/supabase # No-op stub (legacy, not used at runtime)

server/                 # Express backend
  index.ts              # Entry point, middleware, route registration
  db.ts                 # PostgreSQL pool + runtime migrations
  schema.ts             # Full schema auto-init on startup
  routes/               # Modular API endpoints
  middleware/auth.ts    # JWT verify, requireAuth/requireAdmin
  lib/email.ts          # Nodemailer (SMTP optional, logs if unconfigured)
  lib/logger.ts         # Structured console logger
```

## Running the App

```bash
npm run dev    # Starts both Vite (port 5000) and Express (port 3001) concurrently
```

Vite proxies `/api/*` requests to `http://localhost:3001`.

## Environment Variables

### Secrets (Replit Secrets tab)
- `JWT_SECRET` — Required. Signs authentication tokens.
- `DATABASE_URL` — Auto-provisioned by Replit PostgreSQL.
- `GROQ_API_KEY` — Optional. Enables AI chat via Groq (llama-3.1-8b-instant).
- `GEMINI_API_KEY` — Optional. Enables AI chat via Google Gemini.
- `OPENAI_API_KEY` — Optional. Enables AI chat via OpenAI.
- `PAYSTACK_SECRET_KEY` — Required for payments. Paystack secret key (sk_live_... or sk_test_...).
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` — Optional. Enables transactional email (verification, password reset). Without these, emails are logged to console only.

### Shared Env Vars (.replit)
- `SERVER_PORT=3001` — Express server port
- `NODE_ENV=development`
- `VITE_CLOUDINARY_CLOUD_NAME` — For image uploads
- `VITE_CLOUDINARY_UPLOAD_PRESET` — For image uploads
- `VITE_PAYSTACK_PUBLIC_KEY` — Paystack public key for the frontend checkout (pk_live_... or pk_test_...)

## Database

Schema is automatically created on server startup (`server/schema.ts`). No manual migrations needed. Tables include: users, user_roles, courses, modules, lessons, enrollments, lesson_progress, mentors, bookings, bookmarks, certificates, chat_conversations, chat_messages, emails, user_notifications, articles, course_resources, password_reset_tokens.

## AI Chat

The `/api/chat` endpoint tries providers in order: Groq → Gemini → OpenAI. Add any key to enable that provider. The app works without AI keys — the chat page will show an error if no provider is configured.

## User Roles

- `student` — Default role on registration
- `mentor` — Sign up with `role: "mentor"`, creates a mentor profile
- `admin` — Manually assigned in `user_roles` table

## Deployment

- Build: `npm run build` (Vite → `dist/public`, tsc → `dist/server`)
- Start: `node dist/server/index.js` with `SERVER_PORT=8080`
