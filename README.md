# ✨ CodeCraft — Online Code Editor

A full-featured online IDE with multi-language support, community code sharing, and user profiles.

## Tech Stack

- **Next.js 15** — React framework
- **Convex** — Serverless backend & real-time database
- **Clerk** — Authentication & user management
- **TypeScript** — Type safety throughout

## Features

- 💻 Online IDE with 10 language support (all unlocked for free)
- 🎨 5 VSCode themes
- ✨ Smart output handling with success & error states
- 🤝 Community code sharing
- 🔍 Advanced filtering & search
- 👤 Personal profile with execution history
- 📊 Statistics dashboard
- ⚙️ Customizable font size controls

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create `.env.local` in the project root

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=
```

### 3. Add environment variables in your Convex Dashboard

Go to **Settings → Environment Variables** in the [Convex Dashboard](https://dashboard.convex.dev) and add:

```
CLERK_WEBHOOK_SECRET=
```

### 4. Configure Clerk Webhook

In your [Clerk Dashboard](https://dashboard.clerk.com):
- Go to **Webhooks** → **Add Endpoint**
- Set the URL to: `https://<your-convex-deployment>.convex.site/clerk-webhook`
- Subscribe to the **`user.created`** event
- Copy the **Signing Secret** and paste it as `CLERK_WEBHOOK_SECRET` in your Convex Dashboard

### 5. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
