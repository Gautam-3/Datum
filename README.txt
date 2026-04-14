================================================================================
                    DATUM — Online Code Editor & Snippet Hub
================================================================================

A full-stack, real-time online IDE that lets developers write, execute, and
share code snippets across 10 programming languages — all inside the browser,
with zero local setup required.

--------------------------------------------------------------------------------
TABLE OF CONTENTS
--------------------------------------------------------------------------------
  1.  Project Overview
  2.  Tech Stack
  3.  Project Structure
  4.  Software Design Patterns Used
  5.  What Makes Datum Unique
  6.  Supported Programming Languages
  7.  Entity-Relationship (ER) Diagram
  8.  Environment Variables
  9.  How to Run Locally
  10. API Reference
  11. Authentication Flow
  12. Database Schema Summary

================================================================================
1. PROJECT OVERVIEW
================================================================================

Datum is a browser-based code execution and community sharing platform built
as a college project. It enables authenticated users to:

  - Write code using a full-featured Monaco editor (the same editor powering
    VS Code) with syntax highlighting for 10 languages.
  - Execute code securely against a self-hosted Piston runtime engine running
    in a Docker container — no external API dependency.
  - Share code as public snippets with titles and language tags.
  - Browse, search, filter, comment on, and star community code snippets.
  - View a personal profile dashboard with execution history, language stats,
    and starred snippet analytics.

All features except viewing the code editor are gated behind authentication
(Clerk). The platform is entirely free — there are no Pro tiers or payment
walls of any kind.

================================================================================
2. TECH STACK
================================================================================

FRONTEND
--------
  Next.js 15.0.3         — React framework with App Router, Server Components,
                           and API Routes (used for the Piston proxy).
  React 19 (RC)          — UI rendering with concurrent features.
  TypeScript 5           — End-to-end type safety across frontend and backend.
  Tailwind CSS 3         — Utility-first styling.
  Framer Motion 11       — Micro-animations and transitions throughout the UI.
  Monaco Editor          — The VS Code editor engine embedded in the browser,
    (@monaco-editor/react)  providing IntelliSense, syntax highlighting, and
                           multi-language support.
  Zustand 5              — Lightweight global state management for editor state
                           (language, theme, font size, output, errors).
  Lucide React           — Icon set.
  React Hot Toast        — Toast notification system.
  React Syntax Highlighter — Code highlighting in the Snippets viewer.

BACKEND / DATABASE
------------------
  Convex 1.17.3          — Serverless real-time backend platform. Provides:
                             • Reactive database (document-based, like MongoDB)
                             • Server-side mutations and queries (type-safe)
                             • HTTP action endpoints (used for Clerk webhook)
                             • Real-time subscriptions (auto-updating UI)
                             • Built-in authentication integration

AUTHENTICATION
--------------
  Clerk (@clerk/nextjs)  — Full-stack authentication provider. Handles:
                             • Sign up / Sign in / Sign out
                             • JWT token generation (template: "convex")
                             • User profile management
                             • Middleware-based route protection
  Svix                   — Webhook delivery and signature verification library
                           used to securely receive Clerk user.created events.

CODE EXECUTION ENGINE
---------------------
  Piston API (self-hosted) — Open-source polyglot code execution engine.
                             Runs inside a Docker container on localhost:2000.
                             Accepts POST requests with language, version, and
                             source files; returns stdout, stderr, and exit code.

  Docker                 — Containerization platform used to host the Piston
                           API runtime. Ensures a sandboxed, isolated, and
                           reproducible execution environment for all code.
                           The Piston container manages language runtimes
                           independently of the host machine.

PROXY LAYER
-----------
  Next.js API Route      — /api/execute acts as a server-side proxy between
  (/src/app/api/execute/   the browser and the Piston container, eliminating
   route.ts)               CORS restrictions and keeping the Piston URL
                           server-side only.

================================================================================
3. PROJECT STRUCTURE
================================================================================

code-craft/
├── convex/                         # Convex backend (serverless functions + DB)
│   ├── schema.ts                   # Database schema (5 tables, 7 indexes)
│   ├── auth.config.ts              # Clerk JWT provider configuration
│   ├── http.ts                     # HTTP endpoint: Clerk webhook handler
│   ├── users.ts                    # User queries and mutations
│   ├── codeExecutions.ts           # Execution history queries and mutations
│   ├── snippets.ts                 # Snippet CRUD, starring, commenting
│   └── _generated/                 # Auto-generated types and API references
│
├── src/
│   ├── app/                        # Next.js App Router pages
│   │   ├── (root)/                 # Main code editor page (layout + page)
│   │   │   ├── page.tsx            # Editor page entry point
│   │   │   ├── layout.tsx          # Root layout wrapping editor
│   │   │   └── _components/        # Editor-specific components
│   │   │       ├── Header.tsx          # Editor page top header
│   │   │       ├── EditorPanel.tsx     # Monaco editor container
│   │   │       ├── OutputPanel.tsx     # Execution output display
│   │   │       ├── RunButton.tsx       # Triggers execution + saves to Convex
│   │   │       ├── LanguageSelector.tsx# Language dropdown (all unlocked)
│   │   │       ├── ThemeSelector.tsx   # VS Code theme picker
│   │   │       └── HeaderProfileBtn.tsx# Clerk user avatar / sign-in button
│   │   │
│   │   ├── snippets/               # Community snippets section
│   │   │   ├── page.tsx            # Snippet listing + search + filter
│   │   │   ├── [id]/               # Individual snippet detail page
│   │   │   └── _components/        # Snippet-related UI components
│   │   │
│   │   ├── profile/                # User profile dashboard
│   │   │   ├── page.tsx            # Profile page entry point
│   │   │   └── _components/        # Profile UI (stats, history, header)
│   │   │
│   │   ├── api/
│   │   │   └── execute/
│   │   │       └── route.ts        # Server-side Piston proxy (avoids CORS)
│   │   │
│   │   ├── layout.tsx              # Root app layout (fonts, metadata, providers)
│   │   └── globals.css             # Global styles
│   │
│   ├── components/                 # Shared/global components
│   │   ├── NavigationHeader.tsx    # Top nav (logo, Snippets link, profile)
│   │   └── Footer.tsx              # Footer component
│   │
│   ├── store/
│   │   └── useCodeEditorStore.ts   # Zustand store: editor state + runCode()
│   │
│   ├── types/
│   │   └── index.ts                # Shared TypeScript interfaces
│   │
│   ├── hooks/                      # Custom React hooks
│   └── middleware.ts               # Clerk auth middleware (route protection)
│
├── public/                         # Static assets (language logos, icons)
├── .env.local                      # Environment variables (git-ignored)
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.ts

================================================================================
4. SOFTWARE DESIGN PATTERNS USED
================================================================================

1. PROXY PATTERN
   The Next.js API route `/api/execute` acts as a proxy between the browser
   (client) and the Piston Docker container (service). The client never
   communicates with Piston directly — it only talks to the Next.js server,
   which forwards requests. This decouples the execution engine from the
   frontend and solves CORS, hides internal service topology, and allows the
   Piston URL to be changed without touching any frontend code.

2. OBSERVER / REACTIVE PATTERN
   Convex uses a reactive data model. All `useQuery()` hooks in the frontend
   automatically re-render whenever the underlying database data changes —
   similar to the Observer pattern. For example, the Snippets page updates in
   real time when a new snippet is posted, and the profile stats update
   immediately after code is executed.

3. STORE PATTERN (FLUX / UNIDIRECTIONAL DATA FLOW)
   The code editor's state (language, theme, font size, output, errors,
   isRunning) is managed centrally in a Zustand store (`useCodeEditorStore`).
   All components that need editor state subscribe to this single store.
   State mutations only happen through defined actions (setLanguage, runCode,
   setTheme, etc.), ensuring predictable unidirectional data flow.

4. REPOSITORY PATTERN
   The Convex backend files (`users.ts`, `snippets.ts`, `codeExecutions.ts`)
   act as repositories — each file owns data access logic for its entity.
   Frontend components query/mutate through the generated `api` object without
   knowing about raw database operations. This separates data concerns from
   presentation.

5. MIDDLEWARE PATTERN
   Clerk's `middleware.ts` intercepts every incoming request before it reaches
   a page. It checks authentication state and can redirect unauthenticated
   users. This cleanly separates authentication from application logic.

6. ADAPTER PATTERN
   `LANGUAGE_CONFIG` in `_constants/index.ts` acts as an adapter layer between
   the application's language model (e.g., "javascript") and the Piston API's
   runtime model (e.g., { language: "javascript", version: "20.11.1" }). The
   rest of the app only deals with language IDs; the adapter maps them to
   whatever the execution engine requires.

================================================================================
5. WHAT MAKES DATUM UNIQUE
================================================================================

  SELF-HOSTED EXECUTION ENGINE
  Unlike most browser-based editors that depend on third-party APIs (e.g.,
  public Piston, Judge0 SaaS, JDoodle) — Datum runs its own Piston instance
  in a Docker container. This means:
    • Zero dependency on external services for code execution.
    • Complete control over language versions and sandboxing.
    • No API rate limits or quota restrictions.
    • No exposure of source code to third-party servers.

  ALL LANGUAGES FREE FOR EVERYONE
  There is no freemium model, no Pro tier, and no language gating. Every user
  gets access to all 10 languages from the moment they create an account.

  REAL-TIME REACTIVE BACKEND
  Convex's reactive database means the Snippets page, profile stats, and
  comment sections update automatically for all connected users without
  polling or manual refresh.

  EXECUTION HISTORY ANALYTICS
  Every code run is persisted to the database and tied to the user's profile.
  The profile dashboard surfaces personalised analytics: total executions,
  languages used, executions in the last 24 hours, favourite language, and
  most starred language.

  COMMUNITY FIRST
  Users can publish, discover, search, filter, star, and comment on each
  other's snippets — turning the editor into a collaborative learning space.

  MONACO EDITOR INTEGRATION
  The same editor engine used by VS Code runs in the browser, giving users a
  familiar, professional-grade editing experience with IntelliSense, bracket
  matching, and per-language syntax highlighting.

================================================================================
6. SUPPORTED PROGRAMMING LANGUAGES
================================================================================

  Language       Runtime Version    Monaco Language ID
  ─────────────────────────────────────────────────────
  JavaScript     Node.js 20.11.1    javascript
  TypeScript     TypeScript 5.0.3   typescript
  Python         Python 3.10.0      python
  Java           OpenJDK 15.0.2     java
  Go             Go 1.16.2          go
  Rust           Rust 1.68.2        rust
  C++            GCC 10.2.0         cpp
  C#             Mono 6.12.0        csharp
  Ruby           Ruby 3.0.1         ruby
  Swift          Swift 5.3.3        swift

  All 10 languages are available to every authenticated user at no cost.

================================================================================
7. ENTITY-RELATIONSHIP (ER) DIAGRAM
================================================================================

  ┌──────────────────┐
  │      USERS       │
  ├──────────────────┤
  │ PK  userId       │◄──────────────────────────────────────┐
  │     email        │                                       │
  │     name         │                                       │
  │     isPro        │                                       │
  │     proSince     │                                       │
  └──────┬───────────┘                                       │
         │ 1                                                  │
         │                                                    │
         ├─────────────────── 1:N ──────────────────┐        │
         │                                          │        │
         ▼ N                                        ▼ N      │
  ┌──────────────────┐                   ┌──────────────────┐│
  │  CODE_EXECUTIONS │                   │    SNIPPETS      ││
  ├──────────────────┤                   ├──────────────────┤│
  │ PK  _id          │                   │ PK  _id          ││
  │ FK  userId       │                   │ FK  userId       ││
  │     language     │                   │     userName     ││
  │     code         │                   │     title        ││
  │     output       │                   │     language     ││
  │     error        │                   │     code         ││
  │     _creationTime│                   └───────┬──────────┘│
  └──────────────────┘                           │           │
                                                 │ 1         │
                             ┌───────────────────┤           │
                             │                   │           │
                             ▼ N                 ▼ N         │
                  ┌──────────────────┐  ┌────────────────────┤
                  │  SNIPPET_COMMENTS│  │       STARS        │
                  ├──────────────────┤  ├────────────────────┤
                  │ PK  _id          │  │ PK  _id            │
                  │ FK  snippetId    │  │ FK  snippetId      │
                  │ FK  userId ──────┼──┼──► userId ─────────┘
                  │     userName     │  │     _creationTime  │
                  │     content(HTML)│  └────────────────────┘
                  │     _creationTime│
                  └──────────────────┘

  RELATIONSHIPS:
  • USERS      → CODE_EXECUTIONS  : One-to-Many (a user has many executions)
  • USERS      → SNIPPETS         : One-to-Many (a user owns many snippets)
  • SNIPPETS   → SNIPPET_COMMENTS : One-to-Many (a snippet has many comments)
  • SNIPPETS   → STARS            : One-to-Many (a snippet can be starred many times)
  • USERS      → STARS            : One-to-Many (a user can star many snippets)
  • USERS      → SNIPPET_COMMENTS : One-to-Many (a user can write many comments)

  Composite unique constraint on STARS (userId + snippetId) prevents a user
  from starring the same snippet more than once (enforced via Convex index
  "by_user_id_and_snippet_id").

================================================================================
8. ENVIRONMENT VARIABLES
================================================================================

  File: .env.local (in project root, never commit to Git)

  # ── Clerk Authentication ──────────────────────────────────────────────────
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=   # From Clerk Dashboard → API Keys
  CLERK_SECRET_KEY=                    # From Clerk Dashboard → API Keys

  # ── Convex Backend ────────────────────────────────────────────────────────
  CONVEX_DEPLOYMENT=                   # e.g. dev:insightful-goose-945
  NEXT_PUBLIC_CONVEX_URL=              # e.g. https://insightful-goose-945.convex.cloud

  # ── Piston Code Execution (self-hosted via Docker) ────────────────────────
  PISTON_API_URL=http://localhost:2000 # URL of the local Piston Docker container

  # ── Convex Dashboard → Environment Variables (set here, NOT in .env.local) ─
  CLERK_WEBHOOK_SECRET=               # Clerk webhook signing secret

================================================================================
9. HOW TO RUN LOCALLY
================================================================================

PREREQUISITES
  - Node.js 18+
  - npm
  - Docker (for the Piston code execution engine)
  - A Clerk account (https://clerk.com)
  - A Convex account (https://convex.dev)

STEP 1 — Set up and start the Piston API (self-hosted on Linux)
  ─────────────────────────────────────────────────────────────
  Piston is cloned and run as a Docker Compose project. Follow these steps
  exactly on your Linux machine.

  PREREQUISITES
    • Docker installed and running  (https://docs.docker.com/engine/install/)
    • Docker Compose v2+            (sudo apt install docker-compose-plugin)
    • Node.js 18+                   (for the Piston CLI)
    • Git

  a) CLONE THE PISTON REPOSITORY
       git clone https://github.com/engineer-man/piston.git
       cd piston

  b) CLEAN ANY PREVIOUS STATE (do this if you have run Piston before)
       docker compose down -v
       docker rm -f piston_api 2>/dev/null
       docker system prune -f

  c) START THE API CONTAINER ONLY
     From inside the piston/ directory:
       docker compose up -d api

     This starts the Piston API server and exposes it on port 2000.
     Do NOT run "docker compose up" without "api" — the builder service
     is not needed and will cause conflicts.

  d) VERIFY THE CONTAINER IS RUNNING
       docker ps

     You should see a container named "piston_api" running on port 2000.
     Confirm the API is reachable:
       curl http://localhost:2000/api/v2/runtimes
     (Returns an empty array [] at this point — runtimes are not yet installed.)

  e) INSTALL THE PISTON CLI DEPENDENCIES
     The CLI tool (ppman) is used to install language runtimes into the
     running container. It lives in the piston/cli/ directory.
       cd cli
       npm install
       cd ..

  f) LIST AVAILABLE RUNTIMES
       node cli/index.js ppman list
     This queries the running container and lists all installable language
     packages and their available versions.

  g) INSTALL THE REQUIRED LANGUAGE RUNTIMES
     Install all 10 languages that Datum supports:
       node cli/index.js ppman install javascript
       node cli/index.js ppman install typescript
       node cli/index.js ppman install python
       node cli/index.js ppman install java
       node cli/index.js ppman install go
       node cli/index.js ppman install rust
       node cli/index.js ppman install cpp
       node cli/index.js ppman install csharp
       node cli/index.js ppman install ruby
       node cli/index.js ppman install swift

     You can also install multiple at once:
       node cli/index.js ppman install python javascript java go

     Each runtime is downloaded into the running container.
     Installation time varies (Rust and Java may take several minutes).

  h) VERIFY RUNTIMES ARE INSTALLED
       curl http://localhost:2000/api/v2/runtimes

     You should now see a JSON array listing every installed language with
     its version. Example:
       [
         { "language": "python",     "version": "3.10.0", ... },
         { "language": "javascript", "version": "20.11.1", ... },
         ...
       ]

  i) TEST CODE EXECUTION (optional sanity check)
       curl -X POST http://localhost:2000/api/v2/execute \
         -H "Content-Type: application/json" \
         -d '{
           "language": "python",
           "version": "3.10.0",
           "files": [{ "content": "print(\"Hello from Piston\")" }]
         }'

     Expected response:
       {
         "run": {
           "stdout": "Hello from Piston\n",
           "stderr": "",
           "code": 0,
           "output": "Hello from Piston\n"
         },
         "language": "python",
         "version": "3.10.0"
       }

  IMPORTANT NOTES
    • The Piston container must be running BEFORE starting the Datum dev server.
    • Runtimes are stored inside the Docker container. If you run
      "docker compose down -v", all installed runtimes are deleted and you
      must reinstall them (step g).
    • To persist runtimes across restarts without reinstalling, use
      "docker compose stop" / "docker compose start" instead of "down -v".
    • The Piston URL used by Datum is configured in .env.local:
        PISTON_API_URL=http://localhost:2000
    • Datum's Next.js server proxies all execution requests through
      /api/execute — the browser never talks to Piston directly.

STEP 2 — Clone & install dependencies

    git clone <repo-url>
    cd code-craft
    npm install --legacy-peer-deps

STEP 3 — Set up Clerk
  a. Create a Clerk application at https://dashboard.clerk.com
  b. Copy NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY into .env.local
  c. Go to Configure → JWT Templates → New template
       - Name it exactly: convex
       - Claims: { "aud": "convex" }
       - Save
  d. Go to Webhooks → Add Endpoint
       - URL: https://<your-convex-deployment>.convex.site/clerk-webhook
       - Event: user.created
       - Copy the Signing Secret

STEP 4 — Set up Convex
  a. Create a project at https://dashboard.convex.dev
  b. Run: npx convex dev --once
     (This deploys the schema and all backend functions automatically)
  c. Add CLERK_WEBHOOK_SECRET in Convex Dashboard → Settings → Environment Variables
  d. Copy CONVEX_DEPLOYMENT and NEXT_PUBLIC_CONVEX_URL into .env.local

STEP 5 — Configure auth.config.ts
  Open convex/auth.config.ts and make sure the domain matches your
  Clerk Frontend API URL (found in Clerk Dashboard → API Keys):

    export default {
      providers: [{
        domain: "https://<your-clerk-instance>.clerk.accounts.dev",
        applicationID: "convex",
      }],
    };

  Then redeploy: npx convex dev --once

STEP 6 — Run the development server

    npm run dev

  Open http://localhost:3000

================================================================================
10. API REFERENCE
================================================================================

NEXT.JS PROXY ROUTE
  POST /api/execute
  Description : Proxies code execution requests to the local Piston container.
                Exists purely to avoid CORS — the browser calls this route,
                and the Next.js server forwards to Piston internally.
  Request Body:
    {
      "language": "python",
      "version":  "3.10.0",
      "files":    [{ "content": "print('Hello')" }]
    }
  Response:
    {
      "run": {
        "stdout":    "Hello\n",
        "stderr":    "",
        "code":      0,
        "output":    "Hello\n",
        "signal":    null
      },
      "language": "python",
      "version":  "3.10.0"
    }

CONVEX HTTP ENDPOINT
  POST /clerk-webhook
  Description : Receives the Clerk user.created webhook event. Verifies the
                Svix signature, extracts user data, and upserts a user record
                in the Convex database. Called by Clerk's servers, not the app.

CONVEX QUERIES (called from the frontend via useQuery)
  codeExecutions.getUserExecutions({ userId, paginationOpts })
  codeExecutions.getUserStats({ userId })
  snippets.getSnippets()
  snippets.getSnippetById({ snippetId })
  snippets.getSnippetComments({ snippetId })
  snippets.isSnippetStarred({ snippetId })
  snippets.getSnippetStarCount({ snippetId })
  users.getUser({ userId })

CONVEX MUTATIONS (called from the frontend via useMutation)
  codeExecutions.saveExecution({ language, code, output?, error? })
  snippets.createSnippet({ title, language, code })
  snippets.deleteSnippet({ snippetId })
  snippets.starSnippet({ snippetId })
  snippets.unstarSnippet({ snippetId })
  snippets.addComment({ snippetId, content })
  snippets.deleteComment({ commentId })
  users.syncUser()

================================================================================
11. AUTHENTICATION FLOW
================================================================================

  1. User clicks "Sign In" → Clerk's hosted UI handles all credential management.
  2. On first sign-up, Clerk fires a user.created webhook to Convex.
  3. Convex verifies the Svix signature, creates a user record in the DB.
  4. On every page load, Clerk's middleware runs (middleware.ts) and attaches
     the user session to the request.
  5. When the frontend needs to call a Convex query/mutation, it calls
     clerk.session.getToken({ template: "convex" }) to get a short-lived JWT.
  6. The JWT is attached to every Convex request; Convex validates it against
     the configured Clerk domain (auth.config.ts) and extracts the user identity.
  7. Protected Convex functions call ctx.auth.getUserIdentity() to get the
     authenticated user's subject (Clerk userId).

================================================================================
12. DATABASE SCHEMA SUMMARY
================================================================================

  TABLE             FIELDS                                      INDEXES
  ──────────────────────────────────────────────────────────────────────────────
  users             userId, email, name, isPro, proSince        by_user_id
  codeExecutions    userId, language, code, output?, error?     by_user_id
  snippets          userId, userName, title, language, code     by_user_id
  snippetComments   snippetId, userId, userName, content        by_snippet_id
  stars             userId, snippetId                           by_user_id
                                                                by_snippet_id
                                                                by_user_id_and_snippet_id

  All tables use Convex's auto-generated _id and _creationTime fields.
  All userId fields store the Clerk user ID (subject claim from JWT).

================================================================================
                          END OF README
================================================================================
