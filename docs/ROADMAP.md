# Kilbeggan Roadmap

Goal: build out, phase by phase, a core that demonstrates "a product with this concept exists."

---

## Phase 1 — Activity logging core

> A minimal product where a field rep picks a customer, posts a text update, and can review it on a timeline.

- [x] SvelteKit project setup
- [x] Cloudflare/Wrangler setup (D1, KV, R2 bindings, local dev environment)
- [x] DB schema (users, customers, activities)
- [x] PWA setup (manifest, Service Worker)
- [x] Auth (email + password, session management via KV)
- [x] Customer master data (minimal fields + manual registration UI)
- [x] Activity post UI (Twitter-style free-text posts, @mention to pick a customer)
- [x] Activity feed (timeline view, @mentions shown in blue)
- [x] Private posts (a "not shared" flag, toggleable from the feed)
- [x] Schema revisions (customers: `company` now required; users: admin/user roles; activities: many-to-many mentions)
- [x] Routing cleanup (`/` post-only, `/fields` activity list, `/fields/[id]` activity edit, `/customers/[id]/edit` customer edit)
- [x] Dark/light mode toggle (system by default, inline script to avoid flash of unstyled theme)
- [x] File attachments and photo capture on posts (R2 upload, added `activities.attachments` column)
- [x] Preserve line breaks in posts and their display (`bodyToHtml`/`bodyToEditorHtml`, avoids layout shift)
- [x] Refactored page state management (extracted into `index.svelte.ts` as factory functions, `+page.svelte` now template-only)
- [x] Attachment improvements (show original filename, inline display for images vs. download for other types, fixed iOS sign-in)
- [x] Attachment support when editing activities (extracted `AttachmentArea` component, added file/camera buttons to the edit page)

---

## Phase 2 — AI processing layer

> AI automatically organizes and summarizes posted text.

- [x] Auto-tagging of posts (category classification via Claude Haiku: sales / complaint / info-gathering, etc., run asynchronously via `ctx.waitUntil`)
- [x] Per-customer AI summary (summary-generation button on the customer detail page, saved to D1)
- [x] Team summary for managers (`/dashboard` page, AI summary of the last 7 days of activity, cached in KV)
- [x] Anomaly detection ("needs follow-up" badge for customers untouched for 30+ days, surfaced in both the summary and customer list)
- [x] Renamed the summary page (Dashboard → Summary, `/dashboard` → `/summary`)
- [x] Customer edit form fix (converted to SPA via `use:enhance`, inline validation errors)
- [x] Switched @mentions to an ID-based format (stored as `@{id}`, resolved to the current name at render time via an `activityMentions` join; the old format is still supported for backward compatibility)

---

## Phase 3 — Manager dashboard

> A screen where managers can see the team's status in real time.

- [x] Customer score (AI scoring from 1–100, manually recalculable from the customer detail page, error message shown when there isn't enough activity)
- [ ] Automatic customer score refresh (recalculated in the background when a new activity is posted)
- [x] AI summary editing / feedback (manual summary edits with editor/timestamp tracking, a manager comment field, improved the AI prompt for mid-to-long-term analysis)
- [x] UI improvements (moved activity card actions into a kebab menu, removed the delete button from activity detail, removed the activity history section from customer detail, added a sign-out button to the mobile settings screen)
- [x] Removed the summary screen (dropped its nav entry and route to simplify)
- [x] "Needs follow-up" threshold setting (admins can change the "days since last contact" threshold from settings; added an `org_settings` table)
- [x] Exclude non-shared activities from last-contact tracking (`isPrivate = true` activities no longer count toward "needs follow-up" status)
- [x] Extracted a shared customer form component (`CustomerFormFields`, used by both new and edit)
- [x] Infinite scroll on the activity feed (30 items per page, sentinel-based via `IntersectionObserver`, cursor-based pagination)
- [x] Security fixes (worked around a `localStorage` `SecurityError` when Safari has cookies disabled, moved the `title` tag into `svelte:head`)
- [x] Unified the sign-in screen and sidebar design (card UI, typography, and account row matched to Midleton/Boann, while keeping the responsive structure)
- [x] Reminders (UI/functionality modeled on Midleton — schedule with a date/time, content, and delivery channel; list/edit/delete; delivered via a Cron Trigger running every minute plus manual runs. Delivery channels are email (Resend) and the in-app notification center only — no Slack integration)
- [x] In-app notification center (bell icon + unread badge + drawer in the sidebar; accessible from the settings screen on mobile)
- [x] Turned the notification center from a drawer into a page (`/notifications`, same card UI as the activity list; dropped the "click toggles background color" behavior in favor of a per-notification delete button; removed the `NotificationDrawer` component)
- [x] Push notifications (PWA + Web Push API, replacing OneSignal. VAPID keys; push/notificationclick handling in the Service Worker; a `push_subscriptions` table; added "push notification" as a reminder delivery channel. Sending goes through `@block65/webcrypto-web-push`, which runs on the Web Crypto API alone and is Cloudflare Workers–compatible. VAPID secrets are registered in production and delivery has been verified on a physical iPhone. Can be toggled on/off from settings)
- [x] Switched notification icons to PNG (fixed `showNotification`/manifest icon/badge not showing in some browsers when pointed at SVG; regenerated `icon-192`/`512` and `apple-touch-icon` as PNGs from the SVG source, restyled the "K" mark in a serif face with a more beige-leaning palette)
- [x] Dropped `@vite-pwa/sveltekit` in favor of SvelteKit's built-in Service Worker support (worked around an unresolved known bug [vite-pwa/sveltekit#101] where production builds fail due to a conflict between `injectManifest` and Vite 8's client/ssr build split, by switching `src/service-worker.ts` to SvelteKit's native mechanism. `manifest.webmanifest` is now served statically from `static/` and linked directly from `app.html`. Offline caching is still unimplemented — later phase — only push/notificationclick are handled. Also fixed a `datetime-local` input overflowing its card on iOS Safari)
- [x] Made the activity list the home screen (`/` is now the former `/fields` activity list, the post screen moved to `/post`. Unified the post screen header — it used to show the "KILBEGGAN" logo, now shows "Post" like every other page's title. Kept the activity edit URL at `/fields/[id]` but fixed its back-navigation target to `/`)
- [x] Navigation reorganization (removed "Post" from the footer/sidebar menu items; the top of the activity list now has a "Post" button that navigates to `/post` instead. Posting now auto-navigates back to the activity list on success. Removed the mobile route to notifications via settings; notifications are now a permanent bottom-nav/sidebar item with an unread badge)
- [x] Added account management (equivalent to Midleton's `/database/accounts`. The `/accounts` page supports listing accounts, creating new ones (name, email, initial password, role), changing roles, and deleting. API: `POST /api/accounts`, `PATCH`/`DELETE /api/accounts/[id]`. Added safeguards not present in Midleton: you can't change your own role or delete yourself, and the last remaining admin can't be demoted or deleted. New accounts don't self-activate via a password-reset link like Midleton's — an admin sets the initial password directly on creation (Kilbeggan's `passwordHash` is `NOT NULL`). The nav entry only shows in the admin's desktop sidebar, not in the mobile bottom nav)
- [x] Further navigation reorganization (unified the main nav — desktop and mobile alike — into five items: Activities, Customers, Reminders, Notifications, Settings, promoting Notifications/Reminders out of the sidebar footer into the primary nav. Desktop-only: an admin-only "Account Management" item below that, and the account name + sign-out at the very bottom. The mobile bottom nav shows only those five items, with no Account Management)
- [x] Fixed a bug where customer scoring and tagging couldn't be computed (Claude Haiku sometimes wraps `{"score":...}` in a Markdown code fence — ` ```json ... ``` ` — which broke `JSON.parse(raw.trim())` and always resulted in "Failed to compute score." Added a `stripCodeFence` helper in `src/lib/server/ai/json.ts` and applied it to both `score.ts` and `classify.ts`, which had the same bug in auto-tagging — masked there because failures silently fell back to "Other," making it hard to notice)
- [x] Unified menu/page title wording ("Activities"/"Activity List" → "Activity History", "Customers" → "Customer Management"), applied consistently across nav labels, page headings, and breadcrumb/back links

---

## Phase 4 — Automated customer data enrichment

> Minimize the effort of registering customers.

- [ ] Company info lookup via web crawling
- [ ] Customer registration via business card scanning
- [ ] Existing CRM integration (Salesforce / HubSpot API)

---

## Phase 5 — OEM support _(out of scope for the current phase)_

- [ ] Multi-tenant design
- [ ] White-labeling (logo / color settings)
- [ ] Per-customer custom fields
- [ ] Export API to external CRMs
