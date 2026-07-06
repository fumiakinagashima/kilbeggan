// worker.ts (wrangler.jsonc `main`) statically imports the SvelteKit-generated
// `.svelte-kit/cloudflare/_worker.js`, which doesn't exist until `vite build` runs
// and, once built, is a minified bundle that isn't meant to be typechecked.
// A sibling .d.ts with the same basename makes TypeScript use this declared shape
// instead of resolving/checking the real (missing or generated) .js file.
import { mkdir, writeFile } from 'node:fs/promises';

const dir = '.svelte-kit/cloudflare';
const shim = `declare const worker: {
	fetch: (request: Request, env: unknown, ctx: unknown) => Response | Promise<Response>;
};
export default worker;
`;

await mkdir(dir, { recursive: true });
await writeFile(`${dir}/_worker.d.ts`, shim);
