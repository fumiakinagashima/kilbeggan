import { json } from '@sveltejs/kit';

export async function POST({ request, platform, locals }) {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

	if (!platform?.env?.R2) {
		console.error('[/api/upload] R2 binding is not available');
		return json({ error: 'R2 not available' }, { status: 503 });
	}

	const formData = await request.formData();
	const file = formData.get('file') as File | null;
	if (!file || file.size === 0) return json({ error: 'No file' }, { status: 400 });

	const ext = file.name.includes('.') ? file.name.split('.').pop()! : '';
	const key = `uploads/${crypto.randomUUID()}${ext ? '.' + ext : ''}`;

	await platform.env.R2.put(key, await file.arrayBuffer(), {
		httpMetadata: { contentType: file.type || 'application/octet-stream' },
		customMetadata: { name: file.name }
	});

	return json({ key, name: file.name });
}
