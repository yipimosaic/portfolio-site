import type { Metadata } from "next";
import "./portfolio.css";
import "./admin.css";

export const metadata: Metadata = {
  title: "视觉创作者 / Portfolio",
  description: "导演、美术指导、摄影指导与视觉设计师的个人作品集。",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
