export function formatDate(date: Date): string {
	return date.toLocaleDateString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric' });
}

const JST_TIME_ZONE = 'Asia/Tokyo';

const jstPartsFormatter = new Intl.DateTimeFormat('en-US', {
	timeZone: JST_TIME_ZONE,
	year: 'numeric',
	month: '2-digit',
	day: '2-digit',
	hour: '2-digit',
	minute: '2-digit',
	hourCycle: 'h23'
});

function getJstParts(d: Date): {
	year: string;
	month: string;
	day: string;
	hour: string;
	minute: string;
} {
	const parts = jstPartsFormatter.formatToParts(d);
	const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
	return {
		year: get('year'),
		month: get('month'),
		day: get('day'),
		hour: get('hour'),
		minute: get('minute')
	};
}

/**
 * Converts an `<input type="datetime-local">` value ("YYYY-MM-DDTHH:mm", JST wall-clock time)
 * into the corresponding Date (a UTC instant). Since Cloudflare Workers is fixed to UTC,
 * explicitly append the +09:00 offset instead of using `new Date(value)`.
 */
export function parseJstDatetime(value: string): Date {
	return new Date(`${value}+09:00`);
}

export function formatJstDateTime(d: string | Date): string {
	const dt = typeof d === 'string' ? new Date(d) : d;
	const { year, month, day, hour, minute } = getJstParts(dt);
	return `${year}/${month}/${day} ${hour}:${minute}`;
}

export function toJstDatetimeLocal(d: Date): string {
	const { year, month, day, hour, minute } = getJstParts(d);
	return `${year}-${month}-${day}T${hour}:${minute}`;
}

export function nowJstDatetimeLocal(): string {
	return toJstDatetimeLocal(new Date());
}

export function timeAgo(date: Date): string {
	const diff = Date.now() - date.getTime();
	const minutes = Math.floor(diff / 60_000);
	if (minutes < 1) return 'Just now';
	if (minutes < 60) return `${minutes}m ago`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours}h ago`;
	const days = Math.floor(hours / 24);
	if (days < 30) return `${days}d ago`;
	return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
}
