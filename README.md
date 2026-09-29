# 个人作品集基础版

React + Vite 单页作品集，适配桌面和手机。五个模块：全屏首页、个人经历、精选项目、个人优势、整屏联系页。

## 运行

```bash
npm install
npm run dev
```

终端会显示本地预览地址。生产构建使用 `npm run build`。

## 替换内容

- 在 `src/content.js` 集中修改首页标题、姓名、简介、联系方式、数据、项目和能力文案。
- 用自己的照片覆盖 `public/media` 中的项目示意图，并同步修改 `image` 路径与 `alt` 文字。
- 头像放到 `public/media` 后，在 `src/content.js` 的 `portrait` 填写路径，例如 `/media/portrait.jpg`。
- 首页视频可替换 `public/media/hero-motion.webm`；如使用 MP4，需同时修改 `src/main.jsx` 的视频路径和类型。

当前未收到简历与真实作品，姓名、履历、统计数字和项目均为待填内容。现用图片仅作版式示意，不代表本人作品。

## 示意素材

首页视频：MDN CC0 flower.webm。项目示意图：Unsplash。发布正式作品集时，建议全部换成你本人有权展示的作品及肖像。
