import { headers } from "next/headers";
import { isAdmin } from "../../lib/admin-auth";
import AdminClient from "./admin-client";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const requestHeaders = await headers();
  if (!isAdmin(requestHeaders)) {
    return <main className="admin-root admin-denied"><p className="admin-kicker">PROJECT DESK / PRIVATE</p><h1>无法进入管理页</h1><p>请使用网站所有者的账号打开此页面。</p><a href="/">← 返回作品集</a></main>;
  }
  return <AdminClient />;
}
