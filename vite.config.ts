import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import adapter from '@sveltejs/adapter-cloudflare';
import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';

export default defineConfig({
	plugins: [
		SvelteKitPWA({
			registerType: 'autoUpdate',
			manifest: {
				name: 'Kilbeggan',
				short_name: 'Kilbeggan',
				description: '活動記録をもっとシンプルに',
				theme_color: '#2563eb',
				background_color: '#f8fafc',
				display: 'standalone',
				orientation: 'portrait',
				start_url: '/',
				icons: [
					{ src: '/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' },
					{ src: '/icon-512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'maskable' }
				]
			},
			workbox: {
				globPatterns: ['**/*.{js,css,html,svg}'],
				navigateFallback: null
			},
			devOptions: { enabled: false }
		}),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter({
				// wrangler.jsonc's `main` points at our custom worker.ts (adds the
				// `scheduled` handler), so use a separate config for the adapter's
				// build step to avoid it overwriting that file.
				config: 'wrangler.build.jsonc',
				platformProxy: {
					configPath: 'wrangler.jsonc',
					persist: { path: '.wrangler/state/v3' }
				}
			}),
			typescript: {
				config: (config) => ({
					...config,
					include: [...config.include, '../drizzle.config.ts']
				})
			}
		})
	],
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'client',
					browser: {
						enabled: true,
						provider: playwright(),
						instances: [{ browser: 'chromium', headless: true }]
					},
					include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					exclude: ['src/lib/server/**']
				}
			},

			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
