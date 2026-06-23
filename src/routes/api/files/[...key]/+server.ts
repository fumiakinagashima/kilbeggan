export async function GET({ params, platform, locals }) {
	if (!locals.user) return new Response('Unauthorized', { status: 401 });

	const obj = await platform!.env.R2.get(params.key);
	if (!obj) return new Response('Not Found', { status: 404 });

	const headers = new Headers();
	obj.writeHttpMetadata(headers);
	headers.set('etag', obj.httpEtag);
	headers.set('cache-control', 'private, max-age=3600');

	return new Response(obj.body as ReadableStream, { headers });
}
