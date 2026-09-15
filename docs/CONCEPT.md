## Concept

Existing CRMs haven't solved their core problem: field staff don't enter data. AI-native CRMs run into the same wall.
Kilbeggan attacks the problem from the other direction — **drive the field's input cost toward zero, and let AI own the structuring.**

### The "reverse CRM" idea

| Traditional CRM                            | Kilbeggan                                 |
| ------------------------------------------ | ----------------------------------------- |
| Records go into structured input forms     | Records are SNS-style free-text posts     |
| The field staff structures the data        | AI structures the data                    |
| Customer records are the center of gravity | Activity history is the center of gravity |
| Heavy input burden, adoption stalls        | Just posting is enough to keep it going   |

### Division of roles

- **Field Rep**: Just picks a customer and posts a text update
- **AI**: Summarizes, structures, and analyzes the posts
- **Manager**: Reviews and acts on the information AI has organized
- **Customer data**: Acquired automatically via web crawling or existing CRM integration, with office staff filling any gaps

---

## Target

### Companies with the right pain points

- Already have a CRM, but the field doesn't enter data
- Managers can't get a real-time read on what's happening in the field
- Field-heavy roles with little time at a desk (manufacturing sales, real estate, insurance, medical devices, etc.)

### Business model

Considering **OEM / white-label** distribution, while also keeping **running it as a SaaS** on the table.

- Embedded into industry-specific SaaS products
- Supplied as an add-on to existing CRMs (Salesforce / HubSpot, etc.)
- Inbound interest generated via social media presence

---

## Tech Stack

| Area               | Technology                                  |
| ------------------ | ------------------------------------------- |
| Frontend           | SvelteKit (TypeScript)                      |
| Styling            | SCSS                                        |
| Validation         | Zod                                         |
| ORM                | DrizzleORM                                  |
| Infrastructure     | Cloudflare (Workers, D1, R2, KV)            |
| AI                 | Claude API (Anthropic)                      |
| Push notifications | OneSignal                                   |
| Email              | Resend                                      |
| Mobile             | PWA (vite-plugin-pwa + @vite-pwa/sveltekit) |

### Design principles

- **Mobile-first**: Designed on the assumption that field reps use it from a smartphone
- **PWA**: No native app needed — adding to the home screen gets close to a native UX
- **Offline awareness**: Posting assumes an online connection; caching is handled in a later phase
- **OEM-ready**: Tenant isolation and white-labeling are designed in from the start

---

## Roadmap

### Phase 1 — Activity logging core

- [ ] Project setup (SvelteKit + Cloudflare + DrizzleORM)
- [ ] PWA setup (manifest, Service Worker)
- [ ] Auth (session / KV)
- [ ] Customer master data (minimal fields + manual entry)
- [ ] Activity posting UI (pick customer + enter text + submit)
- [ ] Activity feed (timeline view)

### Phase 2 — AI processing layer

- [ ] Auto-tagging posts (AI category classification: deal / complaint / info-gathering, etc.)
- [ ] Per-customer AI summary (recent activity summary)
- [ ] Team summary for managers (daily / weekly)
- [ ] Anomaly detection (e.g. alerts for long-untouched customers)

### Phase 3 — Manager dashboard

- [ ] Team activity overview
- [ ] Per-customer temperature visualization
- [ ] AI summary review / feedback
- [ ] Push notifications (OneSignal)

### Phase 4 — Automated customer data enrichment

- [ ] Company info lookup via web crawling
- [ ] Existing CRM integration (Salesforce / HubSpot API)
- [ ] Customer registration via business card scanning

### Phase 5 — OEM support

- [ ] Multi-tenant design
- [ ] White-labeling (logo / color settings)
- [ ] Per-customer custom fields
- [ ] Export API to external CRMs

---

## Related products

- **Midleton**: an AI-native CRM (planned for open-source release). Serves as Kilbeggan's development foundation and track record.
