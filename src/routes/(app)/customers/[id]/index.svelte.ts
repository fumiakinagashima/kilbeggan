import type { PageData } from './$types';

export function createCustomerDetailState(getData: () => PageData) {
	// summary
	let summary = $state(getData().customer.aiSummary ?? '');
	let summaryEditedBy = $state(getData().customer.summaryEditedBy ?? '');
	let summaryEditedAt = $state<Date | null>(getData().customer.summaryEditedAt ?? null);
	let generating = $state(false);
	let editingSummary = $state(false);
	let editSummaryText = $state('');
	let savingSummary = $state(false);

	// manager comment
	let managerComment = $state(getData().customer.managerComment ?? '');
	let managerCommentEditedBy = $state(getData().customer.managerCommentEditedBy ?? '');
	let managerCommentEditedAt = $state<Date | null>(getData().customer.managerCommentEditedAt ?? null);
	let editingComment = $state(false);
	let editCommentText = $state('');
	let savingComment = $state(false);

	// score
	let score = $state<number | null>(getData().customer.score ?? null);
	let scoreReason = $state('');
	let scoreError = $state('');
	let scoring = $state(false);

	function scoreLabel(s: number): string {
		if (s >= 80) return 'hot';
		if (s >= 60) return 'warm';
		if (s >= 40) return 'neutral';
		return 'cold';
	}

	function scoreLevelText(s: number): string {
		if (s >= 80) return 'ホット';
		if (s >= 60) return 'ウォーム';
		if (s >= 40) return 'ニュートラル';
		return 'コールド';
	}

	async function generateSummary() {
		generating = true;
		try {
			const res = await fetch(`/api/customers/${getData().customer.id}/summarize`, {
				method: 'POST'
			});
			if (res.ok) {
				const result = (await res.json()) as { summary: string };
				summary = result.summary;
				summaryEditedBy = '';
				summaryEditedAt = null;
			}
		} finally {
			generating = false;
		}
	}

	function startEditSummary() {
		editSummaryText = summary;
		editingSummary = true;
	}

	function cancelEditSummary() {
		editingSummary = false;
		editSummaryText = '';
	}

	async function saveSummary() {
		if (!editSummaryText.trim()) return;
		savingSummary = true;
		try {
			const res = await fetch(`/api/customers/${getData().customer.id}/summarize`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ summary: editSummaryText })
			});
			if (res.ok) {
				const result = (await res.json()) as { summary: string; editedBy: string };
				summary = result.summary;
				summaryEditedBy = result.editedBy;
				summaryEditedAt = new Date();
				editingSummary = false;
				editSummaryText = '';
			}
		} finally {
			savingSummary = false;
		}
	}

	function startEditComment() {
		editCommentText = managerComment;
		editingComment = true;
	}

	function cancelEditComment() {
		editingComment = false;
		editCommentText = '';
	}

	async function saveComment() {
		savingComment = true;
		try {
			const res = await fetch(`/api/customers/${getData().customer.id}/comment`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ comment: editCommentText })
			});
			if (res.ok) {
				const result = (await res.json()) as { comment: string; editedBy: string };
				managerComment = result.comment;
				managerCommentEditedBy = result.editedBy;
				managerCommentEditedAt = new Date();
				editingComment = false;
				editCommentText = '';
			}
		} finally {
			savingComment = false;
		}
	}

	async function recalcScore() {
		scoring = true;
		scoreError = '';
		try {
			const res = await fetch(`/api/customers/${getData().customer.id}/score`, { method: 'POST' });
			if (res.ok) {
				const result = (await res.json()) as { score: number; reason: string };
				score = result.score;
				scoreReason = result.reason;
			} else if (res.status === 422) {
				scoreError = '現在の活動履歴ではスコアを計測できません。具体的な活動履歴を登録してください。';
			}
		} finally {
			scoring = false;
		}
	}

	function mentionMap(activity: { mentions?: { customerId: string; company: string }[] }) {
		return new Map((activity.mentions ?? []).map((m) => [m.customerId, m.company]));
	}

	return {
		get summary() { return summary; },
		get summaryEditedBy() { return summaryEditedBy; },
		get summaryEditedAt() { return summaryEditedAt; },
		get generating() { return generating; },
		get editingSummary() { return editingSummary; },
		get editSummaryText() { return editSummaryText; },
		set editSummaryText(v: string) { editSummaryText = v; },
		get savingSummary() { return savingSummary; },
		get managerComment() { return managerComment; },
		get managerCommentEditedBy() { return managerCommentEditedBy; },
		get managerCommentEditedAt() { return managerCommentEditedAt; },
		get editingComment() { return editingComment; },
		get editCommentText() { return editCommentText; },
		set editCommentText(v: string) { editCommentText = v; },
		get savingComment() { return savingComment; },
		get score() { return score; },
		get scoreReason() { return scoreReason; },
		get scoreError() { return scoreError; },
		get scoring() { return scoring; },
		scoreLabel,
		scoreLevelText,
		generateSummary,
		startEditSummary,
		cancelEditSummary,
		saveSummary,
		startEditComment,
		cancelEditComment,
		saveComment,
		recalcScore,
		mentionMap
	};
}
