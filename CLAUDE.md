## Project Overview

**Kilbeggan** is an activity-logging SaaS built on a "reverse CRM" concept.
Traditional CRMs suffer from the problem that field staff don't bother entering data. Kilbeggan flips that: it drives the cost of entry as close to zero as possible (SNS-style text posts), and leaves structuring and analysis to AI.

| Role      | Responsibility                                       |
| --------- | ---------------------------------------------------- |
| Field Rep | Just picks a customer and posts a text update        |
| AI        | Summarizes, tags, and analyzes the posts             |
| Manager   | Reviews and acts on the information AI has organized |

**Target**: Companies frustrated with CRM adoption stalling out — field-heavy roles such as manufacturing sales, real estate, insurance, and medical device sales.

---

## Tech Stack

| Area               | Technology                                                                       |
| ------------------ | -------------------------------------------------------------------------------- |
| Frontend           | SvelteKit 5 (TypeScript)                                                         |
| Styling            | SCSS                                                                             |
| Validation         | Zod                                                                              |
| ORM                | DrizzleORM                                                                       |
| Infrastructure     | Cloudflare (Workers, D1, R2, KV)                                                 |
| AI                 | Claude API (`@anthropic-ai/sdk`)                                                 |
| Email              | Resend (raw fetch, no SDK)                                                       |
| Push notifications | Web Push API (VAPID, via PWA Service Worker. No external service like OneSignal) |
| Mobile             | PWA (vite-plugin-pwa + @vite-pwa/sveltekit)                                      |
| Package manager    | bun                                                                              |

---

## Design Decisions

- **Responsive**: Covers both smartphones (field reps) and 13–15" laptops (managers). Layout switches via CSS media queries — no UA sniffing. Breakpoint is 768px (below 767px: bottom nav + full-screen; 768px and up: side nav + two-column layout)
- **PWA**: No native app needed. Adding to the home screen gets you close to a native UX
- **Offline**: Posting assumes an online connection. Offline caching support is a later phase
- **Multi-tenant**: Phase 5 or later. The current phase is implemented as a single tenant
- **Auth**: Email + password. Sessions are managed in Cloudflare KV
- **Permissions**: Within the single tenant, `accounts.role` distinguishes `admin` from `user`. Account management (`/accounts`: list, create, change role, delete) is admin-only, and its nav entry only appears in the desktop sidebar (not in the mobile bottom nav). New accounts are not activated via a password-reset link — an admin sets the initial password directly on creation (since `passwordHash` is `NOT NULL`)

---

## Directory Structure

```
src/
  lib/
    server/
      ai/         ← Claude API (client, prompt, streaming)
      auth/       ← session / KV / password
      db/         ← DrizzleORM schema + service layer
      email/      ← Resend (raw fetch)
    components/   ← Svelte components
    stores/       ← Svelte stores (.svelte.ts)
    types/        ← shared type definitions
  routes/
    api/          ← SvelteKit API routes (+server.ts)
    (app routes)  ← page routes (+page.svelte / +page.server.ts)
```

---

## Reference — Midleton

For Claude API / Resend implementation patterns, refer to Midleton. Do not reference its UI/UX.

- Path: `/Users/user/Documents/Alcogy/products/midleton`
- Claude API client: `src/lib/server/ai/client.ts`
- Resend implementation: `src/lib/server/email/providers/resend.ts`
- Auth / session: `src/lib/server/auth/session.ts`

### AI implementation notes

Even when instructed to "return JSON only," Claude sometimes wraps the response in a Markdown code fence, e.g. ` ```json ... ``` `. Anywhere under `src/lib/server/ai/` that runs `JSON.parse` on an AI response must first pass it through `stripCodeFence` in `src/lib/server/ai/json.ts` (see `score.ts` / `classify.ts`). Skipping this causes fenced responses to silently fail parsing and fall back to an error/default with no warning.

---

## Git Workflow

- Cut a branch per phase. If a phase is large, cut branches per task instead
  - e.g. `feature/phase1-wrangler-setup`, `feature/phase1-auth`
- **Push / PR / Merge are done by the user — Claude does not perform these**
- **Only commit when explicitly instructed to**
- Always update `docs/ROADMAP.md` before committing
- If work comes up that isn't covered by the roadmap, update `docs/ROADMAP.md` to reflect it
- Commit messages are written in English
- Do not add Co-Authored-By

---

## Project Configuration

- **Language**: TypeScript
- **Package Manager**: bun
- **Add-ons**: prettier, eslint, vitest, playwright, sveltekit-adapter, drizzle, mcp

---

## Coding Rules

### Page state management

Runes (`$state` / `$derived`, etc.) and component-local functions are extracted into `index.svelte.ts` and managed as a factory function. `+page.svelte` stays a thin component holding only the template and `<style>`. Pages with no state don't need an `index.svelte.ts`.

**File layout**:

```
routes/(app)/some-page/
  ├ index.svelte.ts    ← factory-function state (runes + functions)
  ├ +page.server.ts
  └ +page.svelte       ← template + style only
```

**Pattern**:

```typescript
// index.svelte.ts
import type { PageData } from './$types';

export function createSomePageState(getData: () => PageData) {
  let value = $state(0);

  // $derived can reference getData() directly (no class ordering issues)
  const derived = $derived(getData().items.filter(...));

  async function doSomething() { ... }

  return {
    get value() { return value; },
    set value(v: number) { value = v; },  // add a setter too if written via bind:value etc.
    get derived() { return derived; },
    doSomething,
  };
}
```

```svelte
<!-- +page.svelte -->
<script lang="ts">
	import { createSomePageState } from './index.svelte.ts';
	let { data } = $props();
	const state = createSomePageState(() => data);
</script>
```

**Rules**:

- Implement as a factory function. Don't use classes — combining `$derived` with external data in a class runs into ordering issues
- Pass the `data` prop as `() => data` (to preserve Svelte 5 reactivity)
- `$derived` can reference `getData()` directly from within the closure
- Return an object of getters/setters. Only add a setter for values that need to be written from outside
- Properties used with `bind:value` or `bind:this` need both a getter and a setter
- Internal variables that don't need reactivity (e.g. `mentionRange`) should be plain `let`, not `$state`
- SvelteKit modules like `goto` can be imported and used directly inside `.svelte.ts` files

---

You are able to use the Svelte MCP server, where you have access to comprehensive Svelte 5 and SvelteKit documentation. Here's how to use the available tools effectively:

## Available Svelte MCP Tools:

### 1. list-sections

Use this FIRST to discover all available documentation sections. Returns a structured list with titles, use_cases, and paths.
When asked about Svelte or SvelteKit topics, ALWAYS use this tool at the start of the chat to find relevant sections.

### 2. get-documentation

Retrieves full documentation content for specific sections. Accepts single or multiple sections.
After calling the list-sections tool, you MUST analyze the returned documentation sections (especially the use_cases field) and then use the get-documentation tool to fetch ALL documentation sections that are relevant for the user's task.

### 3. svelte-autofixer

Analyzes Svelte code and returns issues and suggestions.
You MUST use this tool whenever writing Svelte code before sending it to the user. Keep calling it until no issues or suggestions are returned.

### 4. playground-link

Generates a Svelte Playground link with the provided code.
After completing the code, ask the user if they want a playground link. Only call this tool after user confirmation and NEVER if code was written to files in their project.
