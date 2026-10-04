import { getMediaBucket } from "../../../../lib/projects";

export const dynamic = "force-dynamic";

async function getFile(request, context, headOnly = false) {
  try {
    const { key } = await context.params;
    if (!/^[a-f0-9-]{36}\.(jpg|png|webp|avif|mp4|webm|mp3)$/.test(key)) return new Response("Not found", { status: 404 });
    const bucket = getMediaBucket();
    const metadata = await bucket.head(key);
    if (!metadata) return new Response("Not found", { status: 404 });

    let start = 0;
    let end = metadata.size - 1;
    const range = request.headers.get("range");
    if (range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(range);
      if (!match || (!match[1] && !match[2])) {
        return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${metadata.size}` } });
      }
      if (!match[1]) {
        const suffix = Number(match[2]);
        start = Math.max(0, metadata.size - suffix);
      } else {
        start = Number(match[1]);
        if (match[2]) end = Math.min(Number(match[2]), end);
      }
      if (start > end || start >= metadata.size) {
        return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${metadata.size}` } });
      }
    }

    const headers = new Headers();
    metadata.writeHttpMetadata(headers);
    headers.set("Accept-Ranges", "bytes");
    headers.set("Cache-Control", "private, max-age=31536000, immutable");
    headers.set("Content-Length", String(end - start + 1));
    if (range) headers.set("Content-Range", `bytes ${start}-${end}/${metadata.size}`);
    if (headOnly) return new Response(null, { status: range ? 206 : 200, headers });

    const object = await bucket.get(key, range ? { range: { offset: start, length: end - start + 1 } } : undefined);
    if (!object) return new Response("Not found", { status: 404 });
    return new Response(object.body, { status: range ? 206 : 200, headers });
  } catch (error) {
    console.error("Media fetch failed", error);
    return new Response("Media unavailable", { status: 503 });
  }
}

export async function GET(request, context) { return getFile(request, context); }
export async function HEAD(request, context) { return getFile(request, context, true); }

