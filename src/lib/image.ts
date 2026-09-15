const MAX_DIMENSION = 2048;
const JPEG_QUALITY = 0.85;

export async function compressImage(file: File): Promise<File> {
	if (!file.type.startsWith('image/')) return file;

	return new Promise((resolve) => {
		const img = new Image();
		const url = URL.createObjectURL(file);
		img.onload = () => {
			URL.revokeObjectURL(url);
			const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
			const w = Math.round(img.width * scale);
			const h = Math.round(img.height * scale);
			const canvas = document.createElement('canvas');
			canvas.width = w;
			canvas.height = h;
			canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
			canvas.toBlob(
				(blob) => {
					if (!blob) {
						resolve(file);
						return;
					}
					const name = file.name.replace(/\.[^.]+$/, '.jpg');
					const compressed = new File([blob], name, { type: 'image/jpeg' });
					resolve(compressed.size < file.size ? compressed : file);
				},
				'image/jpeg',
				JPEG_QUALITY
			);
		};
		img.onerror = () => {
			URL.revokeObjectURL(url);
			resolve(file);
		};
		img.src = url;
	});
}
