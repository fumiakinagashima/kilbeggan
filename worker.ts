// Custom Worker entry point (wrangler.jsonc `main`).
//
// Wraps the SvelteKit-generated worker (built to .svelte-kit/cloudflare/_worker.js via
// wrangler.build.jsonc, see vite.config.ts) and adds a `scheduled` handler for the
// reminder delivery Cron Trigger. Kept outside src/ so svelte-check doesn't try to
// type-check the generated bundle that doesn't exist until `vite build` runs.
import { getDb } from './src/lib/server/db';
import { processDueReminders } from './src/lib/server/reminders/delivery';
import sveltekitWorker from './.svelte-kit/cloudflare/_worker.js';

export default {
	fetch: sveltekitWorker.fetch,
	async scheduled(_controller, env, ctx) {
		const db = getDb(env.DB);
		ctx.waitUntil(processDueReminders(db, env));
	}
} satisfies ExportedHandler<Env>;
