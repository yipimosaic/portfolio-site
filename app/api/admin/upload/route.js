import { denied, isAdmin } from "../../../../lib/admin-auth";
import { getMediaBucket } from "../../../../lib/projects";

const extensions = {
  "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif",
  "audio/mpeg": "mp3", "video/mp4": "mp4", "video/webm": "webm",
};
const maxBytes = 100 * 1024 * 1024;

export async function POST(request) {
  if (!isAdmin(request.headers)) return denied();
  const contentType = request.headers.get("content-type")?.split(";")[0]?.toLowerCase();
  const extension = extensions[contentType];
  if (!extension) return Response.json({ error: "请上传 JPG、PNG、WebP、AVIF、MP4、WebM 或 MP3 文件。" }, { status: 415 });
  const size = Number(request.headers.get("content-length") || 0);
  if (size > maxBytes) return Response.json({ error: "单个文件请控制在 100 MB 以内。" }, { status: 413 });
  if (!request.body) return Response.json({ error: "文件内容为空。" }, { status: 400 });

  try {
    const key = `${crypto.randomUUID()}.${extension}`;
    await getMediaBucket().put(key, request.body, { httpMetadata: { contentType } });
    return Response.json({ url: `/api/media/${key}`, kind: contentType.startsWith("audio/") ? "audio" : contentType.startsWith("video/") ? "video" : "image" }, { status: 201 });
  } catch (error) {
    console.error("Media upload failed", error);
    return Response.json({ error: "文件上传失败，请重试。" }, { status: 503 });
  }
}

