export const SESSION_COOKIE = 'session';
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30日

export type SessionUser = {
	userId: string;
	name: string;
	email: string;
	role: 'admin' | 'user';
};

function sessionKey(id: string): string {
	return `session:${id}`;
}

export async function createSession(kv: KVNamespace, user: SessionUser): Promise<string> {
	const sessionId = crypto.randomUUID();
	await kv.put(sessionKey(sessionId), JSON.stringify(user), {
		expirationTtl: SESSION_TTL_SECONDS
	});
	return sessionId;
}

export async function getSession(kv: KVNamespace, sessionId: string): Promise<SessionUser | null> {
	const raw = await kv.get(sessionKey(sessionId));
	if (!raw) return null;
	return JSON.parse(raw) as SessionUser;
}

export async function destroySession(kv: KVNamespace, sessionId: string): Promise<void> {
	await kv.delete(sessionKey(sessionId));
}
