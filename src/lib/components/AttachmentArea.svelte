<script lang="ts">
	import { Paperclip, Camera, X } from '@lucide/svelte';
	import CameraScanner from './CameraScanner.svelte';

	export type AttachmentItem = { key: string; name: string; url: string; mimeType: string };

	type Props = {
		attachments: AttachmentItem[];
		uploading?: boolean;
		onFiles: (files: FileList | null) => void;
		onRemove: (key: string) => void;
	};
	let { attachments, uploading = false, onFiles, onRemove }: Props = $props();

	let fileInputEl: HTMLInputElement;
	let nativeCameraInputEl: HTMLInputElement;
	let lightboxSrc = $state<string | null>(null);
	let showCameraModal = $state(false);

	function isImage(mimeType: string) {
		return mimeType.startsWith('image/');
	}

	function handleCameraClick() {
		if (window.matchMedia('(pointer: fine)').matches) {
			showCameraModal = true;
		} else {
			nativeCameraInputEl?.click();
		}
	}

	function handleCapture(blob: Blob) {
		showCameraModal = false;
		const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
		const dt = new DataTransfer();
		dt.items.add(file);
		onFiles(dt.files);
	}
</script>

<div class="attachment-area">
	<div class="attachment-buttons">
		<input
			bind:this={fileInputEl}
			type="file"
			multiple
			style="display:none"
			onchange={(e) => onFiles((e.target as HTMLInputElement).files)}
		/>
		<input
			bind:this={nativeCameraInputEl}
			type="file"
			accept="image/*"
			capture="environment"
			style="display:none"
			onchange={(e) => onFiles((e.target as HTMLInputElement).files)}
		/>
		<button
			type="button"
			class="attach-btn"
			onclick={() => fileInputEl?.click()}
			disabled={uploading}
			title="Attach file"
		>
			<Paperclip size={16} />
		</button>
		<button
			type="button"
			class="attach-btn"
			onclick={handleCameraClick}
			disabled={uploading}
			title="Take photo"
		>
			<Camera size={16} />
		</button>
	</div>

	{#if attachments.length > 0}
		<div class="attachment-preview">
			{#each attachments as item (item.key)}
				<div class="attachment-item">
					{#if isImage(item.mimeType)}
						<button type="button" class="thumb-btn" onclick={() => (lightboxSrc = item.url)}>
							<img src={item.url} alt={item.name} />
						</button>
					{:else}
						<span class="file-icon">📄</span>
						<span class="file-name">{item.name}</span>
					{/if}
					<button type="button" class="remove-btn" onclick={() => onRemove(item.key)}>×</button>
				</div>
			{/each}
		</div>
	{/if}
</div>

{#if lightboxSrc}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_noninteractive_element_interactions -->
	<div
		class="lightbox"
		role="dialog"
		aria-modal="true"
		tabindex="-1"
		onclick={() => (lightboxSrc = null)}
		onkeydown={(e) => {
			if (e.key === 'Escape') lightboxSrc = null;
		}}
	>
		<button class="lightbox-close" onclick={() => (lightboxSrc = null)} aria-label="Close">
			<X size={24} />
		</button>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="lightbox-content" onclick={(e) => e.stopPropagation()}>
			<img src={lightboxSrc} alt="" />
		</div>
	</div>
{/if}

{#if showCameraModal}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_noninteractive_element_interactions -->
	<div
		class="camera-modal"
		role="dialog"
		aria-modal="true"
		tabindex="-1"
		onclick={() => (showCameraModal = false)}
		onkeydown={(e) => {
			if (e.key === 'Escape') showCameraModal = false;
		}}
	>
		<div class="camera-modal-inner" role="document" onclick={(e) => e.stopPropagation()}>
			<button class="modal-close" onclick={() => (showCameraModal = false)} aria-label="Close">
				<X size={20} />
			</button>
			<CameraScanner onCapture={handleCapture} autoStart />
		</div>
	</div>
{/if}

<style lang="scss">
	.attachment-area {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-top: 0.5rem;
	}

	.attachment-buttons {
		display: flex;
		gap: 0.6rem;
	}

	.attach-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		border: 1px solid var(--color-border);
		border-radius: 50%;
		background: var(--color-surface);
		color: var(--color-text-muted);
		cursor: pointer;
		transition:
			color 0.15s,
			border-color 0.15s;

		&:hover {
			color: var(--color-text);
			border-color: var(--color-text-muted);
		}

		&:disabled {
			opacity: 0.4;
			cursor: not-allowed;
		}
	}

	.attachment-preview {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		border-top: 1px solid var(--color-border);
		margin-top: 1.5rem;
		padding-top: 1.5rem;
	}

	.attachment-item {
		position: relative;
		display: flex;
		align-items: center;
		gap: 0.375rem;
		background: var(--color-background);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		padding: 0.25rem;
		max-width: 120px;

		.file-icon {
			font-size: 1.5rem;
			padding: 0.25rem;
		}

		.file-name {
			font-size: 0.75rem;
			color: var(--color-text-muted);
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			max-width: 80px;
		}
	}

	.thumb-btn {
		padding: 0;
		border: none;
		background: none;
		cursor: zoom-in;
		border-radius: 6px;
		overflow: hidden;
		flex-shrink: 0;

		img {
			display: block;
			width: 80px;
			height: 80px;
			object-fit: cover;
			border-radius: 6px;
			transition: opacity 0.15s;
		}

		&:hover img {
			opacity: 0.85;
		}
	}

	.remove-btn {
		position: absolute;
		top: -6px;
		right: -6px;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background: var(--color-text-muted);
		color: var(--color-surface);
		border: none;
		cursor: pointer;
		font-size: 0.75rem;
		line-height: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0;

		&:hover {
			background: var(--color-error);
		}
	}

	.lightbox,
	.camera-modal {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.68);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.lightbox {
		cursor: zoom-out;
	}

	.lightbox-content {
		cursor: default;

		img {
			display: block;
			max-width: min(90vw, 960px);
			max-height: 90vh;
			object-fit: contain;
			border-radius: 4px;
		}
	}

	.lightbox-close {
		position: absolute;
		top: 1rem;
		right: 1rem;
		background: rgba(0, 0, 0, 0.5);
		border: none;
		border-radius: 50%;
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #fff;
		cursor: pointer;

		&:hover {
			background: rgba(0, 0, 0, 0.75);
		}
	}

	.camera-modal-inner {
		position: relative;
		width: min(620px, 96vw);
		background: var(--color-surface);
		border-radius: 12px;
		overflow: hidden;
	}

	.modal-close {
		position: absolute;
		top: 0.625rem;
		right: 0.625rem;
		z-index: 10;
		background: rgba(0, 0, 0, 0.5);
		border: none;
		border-radius: 50%;
		width: 36px;
		height: 36px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #fff;
		cursor: pointer;

		&:hover {
			background: rgba(0, 0, 0, 0.75);
		}
	}
</style>
