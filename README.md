# Event TN — Frontend

Next.js frontend for the Event TN platform — a social dashboard for events, posts, and meetings with user authentication.

## Tech Stack

- **Next.js 15** (App Router, Turbopack)
- **React 19**
- **TypeScript** 5.8
- **Tailwind CSS v4**
- **Motion** (animations)
- **date-fns-tz** (date formatting)
- **next-themes** (theme switching)
- **Biome** (lint + format)

## Setup

```bash
npm install
# or
bun install
```

Create `.env.local` (optional — falls back to `http://127.0.0.1:8000`):

```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

Run:

```bash
npm run dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

## Architecture

### API Proxy

`next.config.ts` rewrites `/api/*` requests to the backend at `http://127.0.0.1:8000/api/*` during development. Server components use absolute URLs via `API_BASE_URL` (from `lib/server-config.ts`) because Next.js rewrites only apply to incoming HTTP requests, not server-side `fetch()`.

### Auth

- JWT-based authentication via Bearer token.
- Login/signup returns `access` token stored in cookies and in-memory state.
- Protected API calls include `Authorization: Bearer <token>` header.

## Project Structure

```
src/
├── apis/               # API client + per-resource functions
│   ├── client.ts       # Axios/fetch wrapper with auth
│   ├── auth.ts         # Login/signup API calls
│   ├── events.ts
│   ├── posts.ts
│   ├── comments.ts
│   ├── meetings.ts
│   └── types.ts        # TypeScript interfaces
├── app/                # Next.js App Router pages
│   ├── layout.tsx      # Root layout
│   ├── globals.css     # Tailwind v4 + theme variables
│   ├── page.tsx        # Landing page
│   ├── login/
│   ├── signup/
│   └── (dashboard)/app/  # Authenticated app routes
│       ├── page.tsx        # Home / feed
│       ├── create/         # Create post/event
│       ├── events/
│       ├── posts/
│       ├── meetings/
│       └── schedule/
├── components/         # Shared React components
│   ├── layout/         # Navbar, sidebar, etc.
│   ├── views/          # Page-level view components
│   ├── forms/          # Form components
│   └── shared/         # Reusable UI primitives
├── hooks/              # Custom React hooks
└── lib/                # Utilities + config
    └── server-config.ts  # API_BASE_URL for server components
```
