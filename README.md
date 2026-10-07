# FORM / FRAME — Motion Studio

A cinematic, responsive motion-studio website built with Next.js, TypeScript, Tailwind CSS, Framer Motion, and Lucide icons. It includes seven planned site pages, a protected content console, an inquiry inbox, and portable original SVG artwork.

## What is included

- Public pages: Home, About, Services, Projects, Project details, and Contact; a branded 404 is handled separately.
- Animated, reduced-motion-aware page transitions, scroll reveals, parallax project art, filter transitions, a count-up timeline, and 3D/glass treatments.
- Optional spatial interface tones. Sound is off by default and starts only after a visitor explicitly enables it.
- A private `/atelier/console` login and console for brand/SEO details, contact information, homepage/About copy, milestones, services, portfolio records, and process steps.
- Manus OAuth sign-in, with an owner-configured identity allowlist, CSRF-bound single-use OAuth state, signed HttpOnly sessions, and protected content APIs.
- A validated contact form that persists inquiries in the admin inbox. Inbox items can be marked New, Reviewing, or Replied; records are not deleted through the UI. It does not send an email notification automatically; the studio replies from the inbox using the visitor's mail client.
- Local JSON persistence for development and Upstash Redis REST persistence for serverless production.
- Custom vector artwork, favicon, robots policy, and a complete `/manus-routes.json` page manifest.

The studio name, portfolio clients, project stories, and starter contact details are fictional demo content. Replace the sample phone, email, location, social URL, and portfolio text before using this for a real business. The bundled cover-image selector offers the three included SVG artworks; it is not a general-purpose media upload service.

## Requirements

- Node.js 20.9 or newer (Node 22 LTS is recommended)
- npm 10.9.2, pinned as the package manager in `package.json`
- An internet connection for initial dependency installation and the optional Google Fonts stylesheet

## Run locally or in Termux

On Android, install Termux from a trusted source and run:

```sh
pkg update
pkg install nodejs-lts git openssl-tool
```

From this project folder:

```sh
npm ci
cp .env.example .env.local
```

Set the following server-only values in `.env.local`:

```dotenv
MANUS_PROJECT_ID=your_manus_project_id
MANUS_OAUTH_PORTAL_URL=https://auth.example.com
MANUS_OAUTH_API_URL=https://api.example.com
ADMIN_ALLOWED_EMAILS=you@example.com
# Optional alternative: comma-separated stable Manus identity IDs
ADMIN_ALLOWED_OPEN_IDS=
ADMIN_SESSION_SECRET=replace_with_a_random_48_byte_secret
# Optional: only needed to accept the platform's Preview-injected HS256 session
MANUS_JWT_SECRET=
```

Use the Manus OAuth URLs and project ID from the owning Manus project. In production, the OAuth app must accept the exact callback URL `https://YOUR_SITE/api/admin/oauth/callback`. Do not use placeholders: enter the actual values in private local environment settings or the hosting provider's server-side project variables. Generate a session secret with Node's built-in cryptography module:

```sh
node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"
```

The allowlist values are exact administrator email addresses or stable Manus OpenIDs. Emails are matched case-insensitively. Use only the people who should manage the site. Never set these values with a `NEXT_PUBLIC_` prefix, commit `.env.local`, or include real secrets in source control.

Start and check the site:

```sh
npm run dev
# Open http://localhost:3000
npm run typecheck
npm run lint
npm run build
```

The public site can run on built-in sample content without OAuth configuration. Admin write/login routes fail closed until valid OAuth settings and an administrator allowlist are set. For local development, content and inquiries are written under `data/`. That directory is excluded from Git.

## Production storage and Vercel

The serverless deployment does not use its local filesystem for persistent records. Before relying on admin edits or accepting inquiries in production, attach an Upstash Redis REST database and set these values in the Vercel project's server-side environment variables for Preview and Production:

```dotenv
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
ADMIN_ALLOWED_EMAILS=...
ADMIN_SESSION_SECRET=...
MANUS_PROJECT_ID=...
MANUS_OAUTH_PORTAL_URL=...
MANUS_OAUTH_API_URL=...
```

Set the real Manus OAuth values, exact authorized admin identity, and an independently generated high-entropy session secret. The deployment's Manus OAuth application must accept the Vercel callback URL shown above. `MANUS_JWT_SECRET` is only needed if Preview-injected Manus JWT sessions are enabled in the matching environment. Keep all tokens and signing secrets server-only; do not prefix them with `NEXT_PUBLIC_`. Redeploy after changing production environment variables. Without storage, login or writes, the site refuses the operation with an honest configuration error rather than claiming changes were saved.

Admin sessions are HMAC-signed eight-hour HttpOnly cookies using the cross-site-compatible `webdev_app_session` name. HTTPS requests receive `SameSite=None; Secure` for Preview embeds; plain-HTTP localhost uses `SameSite=Lax`. OAuth `state` is bound to a short-lived, signed, single-use HttpOnly cookie. Login starts are rate-limited to 12 attempts per 10 minutes; contact submissions are validated and rate-limited. Production rate limits and stored business data require the configured Upstash values. Write APIs also require a same-origin request.

## Project scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server on port 3000 |
| `npm run build` | Create the production Next.js build |
| `npm run start` | Serve a completed build |
| `npm run lint` | Run Biome lint rules over the source tree |
| `npm run typecheck` | Run strict TypeScript checks |

## Structure

```text
src/app/        Public pages, dynamic project details, metadata and JSON API routes
src/components/ Reusable navigation, motion, forms, portfolio and admin UI
src/lib/        Content schema/defaults, OAuth/session security, validation and storage adapters
public/         Original SVG artwork, brand mark, robots response and route manifest
.env.example    Names and shapes of required environment values; contains no secrets
```

This project is a reusable foundation, not a claim of finished client work. Replace the sample studio details and portfolio before selling or publishing it as a real studio. Choose and add a source license separately if you intend to grant code reuse rights.
