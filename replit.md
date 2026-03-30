# HTB Consult Academy

A full-stack learning management platform for HighTicketBoss (HTB Consults), offering professional training in Project Management, Business Analysis, and career development.

## Architecture

- **Frontend**: React 18 + TypeScript + Vite (port 5000)
- **Backend**: Express.js + TypeScript (port 3001)
- **Database**: Replit PostgreSQL (via `pg` driver)
- **Auth**: JWT stored in localStorage (`htb_token`), 30-day expiry
- **Styling**: Tailwind CSS + shadcn/ui + Radix UI
- **Animations**: Framer Motion

## Project Structure

```
src/                  React frontend
  components/         Reusable UI components
  pages/              Route-level page components
    admin/            Admin-only pages
  contexts/           React context providers (AuthContext)
  hooks/              Custom data-fetching hooks
  lib/                API client (api.ts), utilities
  integrations/       Supabase stub (replaced by Express API)
server/               Express backend
  routes/             API route handlers
  middleware/         Auth middleware (JWT verification)
  lib/                Email helper (nodemailer)
  db.ts               PostgreSQL pool connection
  index.ts            Server entry point
schema.sql            Full database schema for Replit PostgreSQL
```

## Key Features

- **Courses**: Browse, enroll, track progress through video/live/book courses
- **Mentors**: Book mentoring sessions with availability management
- **AI Chat**: HTB Consults AI assistant (OpenAI GPT-4o-mini, streaming SSE)
- **Admin Panel**: Manage users, courses, mentors, enrollments
- **Blog/Articles**: Full Medium/Substack-style blog — rich markdown editor with toolbar + live preview, ReactMarkdown rendering with prose styling, featured article toggle (admin-only), read-tracking via IntersectionObserver, mentor article management at `/mentor/articles`, public blog at `/blog` with search + featured hero layout
- **Email System**: Internal messaging between users
- **Notifications**: Activity-based notification feed

## Environment Variables

Set in `.replit` `[userenv]` section:
- `JWT_SECRET` — JWT signing secret
- `SERVER_PORT` — Express port (3001)
- `NODE_ENV` — development/production
- `VITE_CLOUDINARY_CLOUD_NAME` — Cloudinary for image uploads
- `VITE_CLOUDINARY_UPLOAD_PRESET` — Cloudinary upload preset
- `FRONTEND_URL` — Used for password reset email links

Optional (for AI chat and email):
- `OPENAI_API_KEY` — Required for AI chat feature
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` — For email delivery

## Database

Schema is defined in `schema.sql`. Applied to Replit's built-in PostgreSQL.

Tables: `users`, `user_roles`, `categories`, `courses`, `modules`, `lessons`, `enrollments`, `bookmarks`, `mentors`, `availability_slots`, `bookings`, `chat_conversations`, `chat_messages`, `emails`, `certificates`, `articles`, `article_reads`

Default admin account:
- Email: `phantom@htbconsult.com`
- Password: `Phantom2006++`

## Development

```bash
npm run dev   # Starts both Vite (5000) and Express (3001) concurrently
```

## Deployment

Build and serve statically:
```bash
npm run build  # Builds frontend to dist/public, compiles server to dist/
npm start      # Runs compiled server serving static frontend
```
