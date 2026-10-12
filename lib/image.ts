export const MAX_EDGE = 1568;
export const JPEG_QUALITY = 0.85;

export interface PreparedImage {
  /** Raw base64 JPEG (no data: prefix), ready for the API. */
  base64: string;
  /** Object URL of the downscaled JPEG for display. The caller revokes it. */
  url: string;
  width: number;
  height: number;
}

export class ImageDecodeError extends Error {
  constructor() {
    super("That photo couldn't be opened.");
    this.name = "ImageDecodeError";
  }
}

/** Target size that fits the longest edge into `max` without upscaling. */
export function fitWithin(width: number, height: number, max = MAX_EDGE): { width: number; height: number } {
  const scale = Math.min(1, max / Math.max(width, height));
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

type Drawable = { source: CanvasImageSource; width: number; height: number; release: () => void };

/** EXIF orientation is applied by imageOrientation "from-image"; <img> applies it by default as a fallback. */
async function decode(blob: Blob): Promise<Drawable> {
  try {
    const bitmap = await createImageBitmap(blob, { imageOrientation: "from-image" });
    return { source: bitmap, width: bitmap.width, height: bitmap.height, release: () => bitmap.close() };
  } catch {
    const url = URL.createObjectURL(blob);
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      return { source: img, width: img.naturalWidth, height: img.naturalHeight, release: () => {} };
    } catch {
      throw new ImageDecodeError();
    } finally {
      URL.revokeObjectURL(url);
    }
  }
}

function toJpeg(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new ImageDecodeError())), "image/jpeg", JPEG_QUALITY),
  );
}

async function toBase64(blob: Blob): Promise<string> {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = "";
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(binary);
}

/** Decodes any browser-readable image (HEIC on Safari included), downscales it, and re-encodes it as JPEG. */
export async function prepareImage(blob: Blob): Promise<PreparedImage> {
  const drawable = await decode(blob);
  try {
    const size = fitWithin(drawable.width, drawable.height);
    const canvas = document.createElement("canvas");
    canvas.width = size.width;
    canvas.height = size.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new ImageDecodeError();
    ctx.drawImage(drawable.source, 0, 0, size.width, size.height);
    const jpeg = await toJpeg(canvas);
    return { base64: await toBase64(jpeg), url: URL.createObjectURL(jpeg), ...size };
  } finally {
    drawable.release();
  }
}
