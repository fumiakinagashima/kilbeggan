type DraftAttachment = { key: string; url: string; name: string; mimeType: string };

class ComposeDraftStore {
	body = $state('');
	isPrivate = $state(false);
	attachments = $state<DraftAttachment[]>([]);

	clear() {
		this.body = '';
		this.isPrivate = false;
		this.attachments = [];
	}
}

export const composeDraft = new ComposeDraftStore();
