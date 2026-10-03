import { env } from "cloudflare:workers";
import { site } from "../app/content";

export function getDatabase() {
  if (!env.DB) throw new Error("Project database is unavailable");
  return env.DB;
}

export function getMediaBucket() {
  if (!env.BUCKET) throw new Error("Project media storage is unavailable");
  return env.BUCKET;
}

export async function seedProjectsOnce(db) {
  const seeded = await db.prepare("SELECT value FROM site_settings WHERE key = ?").bind("projects_seeded").first();
  if (seeded) return;

  const timestamp = new Date().toISOString();
  const statements = site.projects.map((project, index) => db.prepare(
    `INSERT OR IGNORE INTO projects
      (id, title, english, category, year, description, image_url, gallery_images, video_url, published, sort_order, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    `original-${project.no}`, project.title, project.english || "", project.category || "",
    project.year || "", project.description || "", project.image,
    JSON.stringify(project.gallery || [project.image]), project.video || "",
    1, Number(project.no) || index + 1, timestamp, timestamp
  ));
  statements.push(db.prepare("INSERT OR IGNORE INTO site_settings (key, value) VALUES (?, ?)").bind("projects_seeded", timestamp));
  await db.batch(statements);
}

export async function listProjects(db, includeDrafts = false) {
  // Import this supplied work once so later edits or deletion in admin stay authoritative.
  const importKey = "panda_film_06_imported";
  const imported = await db.prepare("SELECT value FROM site_settings WHERE key = ?").bind(importKey).first();
  if (!imported) {
    const project = site.projects.find(project => project.no === "06");
    if (project) {
      const timestamp = new Date().toISOString();
      await db.batch([
        db.prepare(`INSERT OR IGNORE INTO projects
          (id, title, english, category, year, description, image_url, gallery_images, video_url, published, sort_order, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
          .bind("original-06", project.title, project.english, project.category, project.year, "",
            project.image, JSON.stringify([project.image]), project.video, 1, 6, timestamp, timestamp),
        db.prepare("INSERT OR IGNORE INTO site_settings (key, value) VALUES (?, ?)").bind(importKey, timestamp),
      ]);
    }
  }
  // Replace only the original untouched placeholder; later admin edits take precedence.
  const project04 = site.projects.find(project => project.no === "04");
  if (project04) {
    await db.prepare(`UPDATE projects SET title = ?, english = ?, category = ?, year = ?,
      image_url = ?, gallery_images = ?, video_url = ?, updated_at = ?
      WHERE id = ? AND title = ? AND english = ?`)
      .bind(project04.title, project04.english, project04.category, project04.year,
        project04.image, JSON.stringify([project04.image]), project04.video,
        new Date().toISOString(), "original-04", "项目名称待补充", "PROJECT TITLE / 04").run();
  }
  const sql = `SELECT id, title, english, category, year, description, image_url, gallery_images, video_url,
    published, sort_order, created_at, updated_at FROM projects
    ${includeDrafts ? "" : "WHERE published = 1"}
    ORDER BY sort_order ASC, created_at ASC`;
  const { results } = await db.prepare(sql).all();
  return results.map((row, index) => {
    let gallery = [];
    try { gallery = JSON.parse(row.gallery_images || "[]"); } catch {}
    gallery = Array.isArray(gallery) ? gallery.filter(safeMediaUrl) : [];
    if (!gallery.length && safeMediaUrl(row.image_url)) gallery = [row.image_url];
    return ({
    id: row.id,
    no: String(index + 1).padStart(2, "0"),
    title: row.title,
    english: row.english,
    category: row.category,
    year: row.year,
    description: row.description,
    image: row.image_url,
    gallery,
    video: row.video_url || "",
    published: Boolean(row.published),
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    });
  });
}

function safeMediaUrl(value) {
  return typeof value === "string" && (
    value.startsWith("/api/media/") || value.startsWith("/media/") || /^https:\/\//i.test(value)
  );
}

export function validateProject(input) {
  if (!input || typeof input !== "object") return { error: "项目资料格式不正确。" };
  const title = String(input.title || "").trim();
  const image = String(input.image || "").trim();
  const gallery = Array.isArray(input.gallery)
    ? input.gallery.map(value => String(value || "").trim()).filter(Boolean).slice(0, 30)
    : [];
  const video = String(input.video || "").trim();
  if (!title || title.length > 120) return { error: "请输入 120 字以内的项目名称。" };
  if (!safeMediaUrl(image)) return { error: "请上传项目封面图片。" };
  if (gallery.some(value => !safeMediaUrl(value))) return { error: "图库中有无效图片地址。" };
  if (video && !safeMediaUrl(video)) return { error: "视频地址不正确。" };
  const description = String(input.description || "").trim();
  if (description.length > 2000) return { error: "项目介绍请控制在 2000 字以内。" };
  const sortOrder = Number(input.sortOrder);
  return { value: {
    title,
    english: String(input.english || "").trim().slice(0, 160),
    category: String(input.category || "").trim().slice(0, 120),
    year: String(input.year || "").trim().slice(0, 30),
    description,
    image,
    gallery: gallery.length ? Array.from(new Set([image, ...gallery])) : [image],
    video,
    published: input.published === false ? 0 : 1,
    sortOrder: Number.isFinite(sortOrder) ? Math.round(sortOrder) : 0,
  } };
}
