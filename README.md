# Kilbeggan

Kilbeggan is an activity-logging SaaS built on a **"reverse CRM"** concept.

Most CRMs fail for one simple reason: the field never enters data into them. Kilbeggan flips the model — it drives the cost of logging an activity as close to zero as possible (an SNS-style free-text post), and leaves the structuring, tagging, and analysis to AI.

| Traditional CRM                            | Kilbeggan                                 |
| ------------------------------------------ | ----------------------------------------- |
| Records go into structured input forms     | Records are SNS-style free-text posts     |
| The field staff structures the data        | AI structures the data                    |
| Customer records are the center of gravity | Activity history is the center of gravity |
| Heavy input burden, adoption stalls        | Just posting is enough to keep it going   |

| Role      | Responsibility                                       |
| --------- | ---------------------------------------------------- |
| Field Rep | Picks a customer and posts a text update — that's it |
| AI        | Summarizes, tags, and analyzes the posts             |
| Manager   | Reviews and acts on what AI has organized            |

See [`docs/CONCEPT.md`](docs/CONCEPT.md) for the full product concept and [`docs/ROADMAP.md`](docs/ROADMAP.md) for implementation progress.

## Features

- **Activity feed** — Twitter-style free-text posts with `@mention` to tag a customer, infinite-scroll timeline, private (not-shared) posts, file/photo attachments
- **Customer management** — minimal-friction customer records with AI-generated summaries and a 1–100 AI-computed engagement score
- **AI processing** (Claude) — automatic activity tagging, per-customer summaries, and manager-facing team summaries, with "needs follow-up" detection for customers that have gone quiet
- **Reminders** — schedule follow-ups with delivery via email, push notification, or the in-app notification center
- **Notifications** — in-app notification center plus Web Push (VAPID) support
- **Accounts** — email/password auth with `admin`/`user` roles; admins manage accounts from a dedicated screen
- **PWA** — installable to the home screen, responsive from phone (bottom nav) to laptop (sidebar) at a 768px breakpoint
- **Dark / light mode** — follows the system theme by default

## Tech Stack

| Area               | Technology                                        |
| ------------------ | ------------------------------------------------- |
| Frontend           | SvelteKit 5 (TypeScript)                          |
| Styling            | SCSS                                              |
| Validation         | Zod                                               |
| ORM                | DrizzleORM                                        |
| Infrastructure     | Cloudflare (Workers, D1, R2, KV)                  |
| AI                 | Claude API (`@anthropic-ai/sdk`)                  |
| Email              | Resend (via raw `fetch`, no SDK)                  |
| Push notifications | Web Push API (VAPID) via a PWA Service Worker     |
| Mobile             | PWA (SvelteKit's built-in Service Worker support) |
| Package manager    | [bun](https://bun.sh)                             |

## Getting Started

### Prerequisites

- [bun](https://bun.sh)
- A [Cloudflare](https://dash.cloudflare.com/sign-up) account (Workers, D1, KV, R2)
- An [Anthropic API key](https://console.anthropic.com/)
- A [Resend](https://resend.com/) API key (for email)

### 1. Install dependencies

```sh
bun install
```

### 2. Create Cloudflare resources

```sh
bunx wrangler d1 create kilbeggan
bunx wrangler kv namespace create kilbeggan
bunx wrangler r2 bucket create kilbeggan
```

Copy the resulting IDs into `wrangler.jsonc` (`d1_databases[0].database_id`, `kv_namespaces[0].id`, `r2_buckets[0].bucket_name`).

### 3. Configure environment variables

```sh
cp .env.example .env
```

Fill in `.env` with your Cloudflare account ID and a D1 API token (**Cloudflare Dashboard > My Profile > API Tokens**) — these are only needed for `bun run db:push`.

Runtime secrets (Anthropic API key, Resend API key, VAPID keys, session secret, etc.) are configured as [Wrangler secrets](https://developers.cloudflare.com/workers/configuration/secrets/) for deployment, and in `.dev.vars` for local development:

```sh
# .dev.vars (local only, gitignored)
ANTHROPIC_API_KEY=...
RESEND_API_KEY=...
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
```

### 4. Run database migrations

```sh
bun run db:generate          # generate migrations from the schema
bun run db:migrate:local     # apply them to the local D1 instance
```

### 5. Start the dev server

```sh
bun run dev
```

### Other useful commands

```sh
bun run check       # type-check
bun run lint         # prettier + eslint
bun run test         # unit tests + e2e tests
bun run build        # production build
bun run preview      # preview the production build via wrangler dev
bun run db:studio    # open Drizzle Studio against the local DB
```

## Deployment

Deployment targets Cloudflare Workers via `@sveltejs/adapter-cloudflare`. The included [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) deploys on every push to `main`, using the `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` GitHub Actions secrets.

```sh
bun run build
bunx wrangler deploy
```

Run `bun run db:migrate:remote` (or `wrangler d1 migrations apply kilbeggan --remote`) against your production D1 database before your first deploy.

## Documentation

- [`docs/CONCEPT.md`](docs/CONCEPT.md) — product concept, target market, and design principles
- [`docs/ROADMAP.md`](docs/ROADMAP.md) — phased implementation roadmap
- [`CLAUDE.md`](CLAUDE.md) — conventions for developing this project with Claude Code

## License

[MIT](LICENSE)
