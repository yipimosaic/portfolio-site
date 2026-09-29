import { denied, isAdmin } from "../../../../lib/admin-auth";
import { getDatabase, listProjects, seedProjectsOnce, validateProject } from "../../../../lib/projects";

export const dynamic = "force-dynamic";

export async function GET(request) {
  if (!isAdmin(request.headers)) return denied();
  try {
    const db = getDatabase();
    await seedProjectsOnce(db);
    return Response.json({ projects: await listProjects(db, true) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Admin project list failed", error);
    return Response.json({ error: "项目资料暂时无法加载，请稍后重试。" }, { status: 503 });
  }
}

export async function POST(request) {
  if (!isAdmin(request.headers)) return denied();
  try {
    const parsed = validateProject(await request.json());
    if (parsed.error) return Response.json({ error: parsed.error }, { status: 400 });
    const db = getDatabase();
    await seedProjectsOnce(db);
    const item = parsed.value;
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    await db.prepare(`INSERT INTO projects
      (id, title, english, category, year, description, image_url, video_url, published, sort_order, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(id, item.title, item.english, item.category, item.year, item.description, item.image, item.video,
        item.published, item.sortOrder, now, now).run();
    return Response.json({ id }, { status: 201 });
  } catch (error) {
    console.error("Project creation failed", error);
    return Response.json({ error: "项目保存失败，请重试。" }, { status: 503 });
  }
}
