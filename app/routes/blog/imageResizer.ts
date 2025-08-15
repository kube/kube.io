import { createCanvas, loadImage } from "canvas";
import type { LoaderFunctionArgs } from "react-router";

// Crop a remote Unsplash image locally and return the cropped image
// Query params:
// - image (required): Unsplash image path (e.g., 'photo-...')
// - x, y (optional, default 0): top-left crop origin. Accepts pixels (e.g., 120), percent (e.g., 25%), or ratio (e.g., 0.25)
// - w, h or width, height (optional): crop size. Accepts pixels/percent/ratio; defaults to remaining bounds from x,y
// - format (optional): png | jpeg. Default: png
// - quality (optional 0..1): for jpeg encoding
export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return new Response("Missing 'id' query parameter", { status: 400 });
    }

    const url = id.startsWith("+")
      ? "https://adrien-noat.fr/wp-content/uploads/2024/12/MG_4557-Modifier.jpg"
      : `https://images.unsplash.com/${id}?w=1000`;

    const xParam = searchParams.get("x");
    const yParam = searchParams.get("y");
    const wParam = searchParams.get("w") ?? searchParams.get("width");
    const hParam = searchParams.get("h") ?? searchParams.get("height");
    const formatParam = (searchParams.get("format") || "png").toLowerCase();
    const qualityParam = parseFloatOrDefault(searchParams.get("quality"), 0.9);

    const format =
      formatParam === "jpeg" || formatParam === "jpg"
        ? "image/jpeg"
        : "image/png"; // Default and fallback

    // Load image directly from URL
    const img = await loadImage(url);

    console.log(
      `Resizing image ${url} to crop at (${xParam}, ${yParam}) with size (${wParam}, ${hParam})`
    );

    // Resolve inputs to pixel values (supports px, %, or ratio 0..1)
    const x = toPixels(xParam, img.width, 0);
    const y = toPixels(yParam, img.height, 0);

    // Calculate crop box, clamped to source bounds
    const cropX = Math.min(Math.max(0, x), img.width);
    const cropY = Math.min(Math.max(0, y), img.height);
    const maxW = img.width - cropX;
    const maxH = img.height - cropY;
    const desiredW = toPixels(wParam, img.width, NaN);
    const desiredH = toPixels(hParam, img.height, NaN);
    const cropW = clampToBounds(isFinite(desiredW) ? desiredW : maxW, 1, maxW);
    const cropH = clampToBounds(isFinite(desiredH) ? desiredH : maxH, 1, maxH);

    // Draw cropped region into output canvas
    // Output size equals crop size (no scaling). Adjust if you want scaling.
    const canvas = createCanvas(cropW, cropH);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

    // Encode
    const bodyBuffer =
      format === "image/jpeg"
        ? canvas.toBuffer("image/jpeg", {
            quality: clampToBounds(qualityParam, 0, 1),
          })
        : canvas.toBuffer("image/png");

    // Convert to ArrayBuffer for Response BodyInit compatibility
    const body = bodyBuffer.buffer.slice(
      bodyBuffer.byteOffset,
      bodyBuffer.byteOffset + bodyBuffer.byteLength
    );

    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": format,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err: any) {
    return new Response(`Image crop error: ${err?.message || String(err)}`, {
      status: 500,
    });
  }
};

function parseFloatOrDefault(v: string | null, d: number) {
  const n = v == null ? NaN : parseFloat(v);
  return isNaN(n) ? d : n;
}

function clampToBounds(n: number, min: number, max: number) {
  const val = isFinite(n) ? n : min;
  return Math.max(min, Math.min(max, val));
}

// Convert a parameter string to pixels based on a total reference dimension.
// Supports:
// - "50%" => 0.5 * total
// - "200" or "200px" => 200
// - "0.5" (0..1) => 0.5 * total
// - null/undefined/invalid => defaultValue
function toPixels(value: string | null, total: number, defaultValue: number) {
  if (value == null) return defaultValue;
  const v = value.trim();
  if (!v) return defaultValue;
  if (v.endsWith("%")) {
    const p = parseFloat(v.slice(0, -1));
    return isNaN(p) ? defaultValue : (p / 100) * total;
  }
  if (v.endsWith("px")) {
    const px = parseFloat(v.slice(0, -2));
    return isNaN(px) ? defaultValue : px;
  }
  const n = parseFloat(v);
  if (isNaN(n)) return defaultValue;
  if (n >= 0 && n <= 1) {
    return n * total; // treat as ratio
  }
  return n; // pixels
}
