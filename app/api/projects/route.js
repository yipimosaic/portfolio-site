import { site } from "../../content";
import { getDatabase, listProjects } from "../../../lib/projects";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = getDatabase();
    const projects = await listProjects(db);
    if (projects.length) {
      return Response.json({ projects }, { headers: { "Cache-Control": "no-store" } });
    }
    const seeded = await db.prepare("SELECT value FROM site_settings WHERE key = ?").bind("projects_seeded").first();
    return Response.json({ projects: seeded ? [] : site.projects.map((project, index) => ({ ...project, id: `original-${project.no}`, sortOrder: index + 1 })) }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Project list failed", error);
    return Response.json({ error: "项目暂时无法加载。" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
