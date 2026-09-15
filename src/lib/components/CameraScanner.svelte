<script lang="ts">
	import { onMount, tick } from 'svelte';

	type ScanState = 'init' | 'starting' | 'live' | 'error';

	type Props = {
		onCapture: (blob: Blob) => void;
		autoStart?: boolean;
	};
	let { onCapture, autoStart = false }: Props = $props();

	let scanState = $state<ScanState>('init');
	let errorMsg = $state('');

	let viewportEl: HTMLDivElement;
	let videoEl: HTMLVideoElement;
	let overlayCanvas: HTMLCanvasElement;

	let stream: MediaStream | null = null;

	function getCoverCrop(
		videoW: number,
		videoH: number,
		containerW: number,
		containerH: number
	): { sx: number; sy: number; sw: number; sh: number } {
		const videoRatio = videoW / videoH;
		const containerRatio = containerW / containerH;
		if (videoRatio > containerRatio) {
			const sh = videoH;
			const sw = sh * containerRatio;
			return { sx: (videoW - sw) / 2, sy: 0, sw, sh };
		}
		const sw = videoW;
		const sh = sw / containerRatio;
		return { sx: 0, sy: (videoH - sh) / 2, sw, sh };
	}

	function captureFrame(): HTMLCanvasElement {
		const containerW = viewportEl.clientWidth;
		const containerH = viewportEl.clientHeight;
		const crop = getCoverCrop(videoEl.videoWidth, videoEl.videoHeight, containerW, containerH);
		const scale = Math.min(1, 1600 / Math.max(crop.sw, crop.sh));
		const outW = Math.max(1, Math.round(crop.sw * scale));
		const outH = Math.max(1, Math.round(crop.sh * scale));
		const canvas = document.createElement('canvas');
		canvas.width = outW;
		canvas.height = outH;
		canvas
			.getContext('2d')!
			.drawImage(videoEl, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, outW, outH);
		return canvas;
	}

	function drawGuide() {
		if (!overlayCanvas || !viewportEl) return;
		const w = viewportEl.clientWidth;
		const h = viewportEl.clientHeight;
		overlayCanvas.width = w;
		overlayCanvas.height = h;
		const ctx = overlayCanvas.getContext('2d')!;
		ctx.clearRect(0, 0, w, h);
		const gw = w * 0.85;
		const gh = gw / 1.585;
		const x = (w - gw) / 2;
		const y = (h - gh) / 2;
		ctx.save();
		ctx.setLineDash([10, 8]);
		ctx.lineWidth = 2;
		ctx.strokeStyle = 'rgba(255,255,255,0.6)';
		ctx.strokeRect(x, y, gw, gh);
		ctx.restore();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.code !== 'Space' || scanState !== 'live') return;
		const tag = (document.activeElement as HTMLElement | null)?.tagName;
		if (tag === 'BUTTON' || tag === 'INPUT' || tag === 'TEXTAREA') return;
		e.preventDefault();
		shutter();
	}

	onMount(() => {
		window.addEventListener('resize', drawGuide);
		window.addEventListener('keydown', handleKeydown);
		if (autoStart) startCamera();
		return () => {
			window.removeEventListener('resize', drawGuide);
			window.removeEventListener('keydown', handleKeydown);
			stream?.getTracks().forEach((t) => t.stop());
			stream = null;
		};
	});

	async function startCamera() {
		scanState = 'starting';
		errorMsg = '';
		await tick();
		try {
			stream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: { ideal: 'environment' } },
				audio: false
			});
			videoEl.srcObject = stream;
			await videoEl.play();
			scanState = 'live';
			await tick();
			drawGuide();
		} catch (e) {
			stream?.getTracks().forEach((t) => t.stop());
			stream = null;
			scanState = 'error';
			const name = e instanceof Error ? e.name : '';
			if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
				errorMsg = 'Camera access was not granted.';
			} else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
				errorMsg = 'No camera found.';
			} else {
				errorMsg = 'Failed to start the camera.';
			}
		}
	}

	function shutter() {
		if (scanState !== 'live' || !videoEl.videoWidth) return;
		const canvas = captureFrame();
		canvas.toBlob(
			(blob) => {
				if (blob) onCapture(blob);
			},
			'image/jpeg',
			0.9
		);
	}
</script>

<div class="scanner">
	{#if scanState === 'init'}
		<div class="placeholder">
			<button class="start-btn" onclick={startCamera}>Start Camera</button>
		</div>
	{:else if scanState === 'starting'}
		<div class="placeholder">
			<p class="hint">Starting camera…</p>
		</div>
	{:else if scanState === 'error'}
		<div class="placeholder">
			<p class="error-text">{errorMsg}</p>
			<button class="start-btn" onclick={startCamera}>Retry</button>
		</div>
	{/if}

	<div class="viewport" bind:this={viewportEl} class:hidden={scanState !== 'live'}>
		<video bind:this={videoEl} playsinline muted autoplay></video>
		<canvas bind:this={overlayCanvas} class="overlay"></canvas>
		<p class="status">Tap the shutter (or press Space) to capture</p>
		<button class="shutter" onclick={shutter} aria-label="Capture"></button>
	</div>
</div>

<style lang="scss">
	.scanner {
		width: 100%;
		height: 100%;
	}

	.placeholder {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 12px;
		height: 260px;
		padding: 2rem;
		text-align: center;
	}

	.hint {
		font-size: 0.9375rem;
		color: var(--color-text-muted);
		margin: 0;
	}

	.error-text {
		font-size: 0.9375rem;
		color: var(--color-error);
		margin: 0;
	}

	.start-btn {
		padding: 0.5rem 1.25rem;
		background: var(--color-primary);
		color: #fff;
		border: none;
		border-radius: 20px;
		font-size: 0.875rem;
		font-weight: 600;
		cursor: pointer;
		transition: opacity 0.15s;
		&:hover {
			opacity: 0.88;
		}
	}

	.viewport {
		position: relative;
		width: 100%;
		aspect-ratio: 4/3;
		background: #000;
		overflow: hidden;
		border-radius: 8px;

		&.hidden {
			display: none;
		}

		video {
			width: 100%;
			height: 100%;
			object-fit: cover;
			display: block;
		}
	}

	.overlay {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
	}

	.status {
		position: absolute;
		top: 10px;
		left: 50%;
		transform: translateX(-50%);
		margin: 0;
		padding: 4px 14px;
		border-radius: 20px;
		background: rgba(0, 0, 0, 0.55);
		color: #fff;
		font-size: 0.75rem;
		white-space: nowrap;
	}

	.shutter {
		position: absolute;
		bottom: 16px;
		left: 50%;
		transform: translateX(-50%);
		width: 60px;
		height: 60px;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.85);
		border: 4px solid rgba(255, 255, 255, 0.6);
		cursor: pointer;
		transition: opacity 0.15s;
		&:hover {
			opacity: 0.88;
		}
	}
</style>
