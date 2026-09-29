import { denied, isAdmin } from "../../../../../lib/admin-auth";
import { getDatabase, validateProject } from "../../../../../lib/projects";

export const dynamic = "force-dynamic";

export async function PUT(request, context) {
  if (!isAdmin(request.headers)) return denied();
  try {
    const { id } = await context.params;
    const parsed = validateProject(await request.json());
    if (parsed.error) return Response.json({ error: parsed.error }, { status: 400 });
    const item = parsed.value;
    const result = await getDatabase().prepare(`UPDATE projects SET
      title = ?, english = ?, category = ?, year = ?, description = ?, image_url = ?, gallery_images = ?, video_url = ?,
      published = ?, sort_order = ?, updated_at = ? WHERE id = ?`)
      .bind(item.title, item.english, item.category, item.year, item.description, item.image, JSON.stringify(item.gallery), item.video,
        item.published, item.sortOrder, new Date().toISOString(), id).run();
    if (!result.meta.changes) return Response.json({ error: "项目不存在。" }, { status: 404 });
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Project update failed", error);
    return Response.json({ error: "项目更新失败，请重试。" }, { status: 503 });
  }
}

export async function DELETE(request, context) {
  if (!isAdmin(request.headers)) return denied();
  try {
    const { id } = await context.params;
    const result = await getDatabase().prepare("DELETE FROM projects WHERE id = ?").bind(id).run();
    if (!result.meta.changes) return Response.json({ error: "项目不存在。" }, { status: 404 });
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Project deletion failed", error);
    return Response.json({ error: "项目删除失败，请重试。" }, { status: 503 });
  }
}
