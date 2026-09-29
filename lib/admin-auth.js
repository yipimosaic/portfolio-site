import { site } from "../app/content";

export function isAdmin(headers) {
  const email = headers.get("oai-authenticated-user-email")?.trim().toLowerCase();
  const userId = headers.get("oai-authenticated-user-id");
  return Boolean(userId && email === site.email.toLowerCase());
}

export function denied() {
  return Response.json({ error: "只有网站所有者可以管理项目。" }, {
    status: 403,
    headers: { "Cache-Control": "no-store" },
  });
}
