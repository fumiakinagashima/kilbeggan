export async function GET({ params, platform, locals }) {
	if (!locals.user) return new Response('Unauthorized', { status: 401 });

	if (!platform?.env?.R2) {
		console.error('[/api/files] R2 binding is not available');
		return new Response('R2 not available', { status: 503 });
	}

	try {
		const obj = await platform.env.R2.get(params.key);
		if (!obj) return new Response('Not Found', { status: 404 });

		const contentType = obj.httpMetadata?.contentType ?? 'application/octet-stream';
		const isImage = contentType.startsWith('image/');
		const filename = obj.customMetadata?.name ?? params.key.split('/').pop() ?? 'file';
		const encoded = encodeURIComponent(filename);
		const disposition = isImage
			? `inline; filename*=UTF-8''${encoded}`
			: `attachment; filename*=UTF-8''${encoded}`;

		const headers = new Headers();
		headers.set('content-type', contentType);
		headers.set('content-disposition', disposition);
		headers.set('etag', obj.httpEtag);
		headers.set('cache-control', 'private, max-age=3600');

		return new Response(await obj.arrayBuffer(), { headers });
	} catch (err) {
		console.error('[/api/files] R2 GET error:', err);
		return new Response('Internal Server Error', { status: 500 });
	}
}
