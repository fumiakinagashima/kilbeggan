export function formatDate(date: Date): string {
	return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'numeric', day: 'numeric' });
}

export function timeAgo(date: Date): string {
	const diff = Date.now() - date.getTime();
	const minutes = Math.floor(diff / 60_000);
	if (minutes < 1) return 'たった今';
	if (minutes < 60) return `${minutes}分前`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours}時間前`;
	const days = Math.floor(hours / 24);
	if (days < 30) return `${days}日前`;
	return date.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' });
}
