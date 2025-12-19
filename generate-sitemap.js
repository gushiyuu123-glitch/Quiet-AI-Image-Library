/* ============================================================
   Quiet AI — Auto Sitemap Generator (最強版)
   すべての画像URL & カテゴリーURL を自動生成
============================================================ */

import fs from "fs";
import path from "path";

const BASE_URL = "https://quiet-ai.gushikendesign.com";
const IMAGES_JSON = "./public/data/images.json";
const OUTPUT = "./public/sitemap.xml";

// カテゴリー一覧（PushState対応）
const categories = [
  "architecture",
  "light",
  "texture",
  "people",
  "workspace",
  "nature",
  "glass",
  "fog",
  "mono", 
];

// ============================================================
// Main
// ============================================================

function generateSitemap() {
  const data = JSON.parse(fs.readFileSync(IMAGES_JSON, "utf8"));

  let urls = [];

  // --------------------------
  // Home
  // --------------------------
  urls.push(createUrl(BASE_URL, "weekly", "1.0"));

  // --------------------------
  // Categories
  // --------------------------
  categories.forEach((cat) => {
    urls.push(createUrl(`${BASE_URL}/${cat}`, "weekly", "0.9"));
  });

  // --------------------------
  // Image Pages
  // /image/architecture-011
  // --------------------------
  Object.values(data).forEach((list) => {
    list.forEach((img) => {
      urls.push(
        createUrl(`${BASE_URL}/image/${img.id}`, "monthly", "0.7")
      );
    });
  });

  // --------------------------
  // XML 出力
  // --------------------------
  const xml = wrapSitemap(urls);
  fs.writeFileSync(OUTPUT, xml, "utf8");

  console.log("✅ sitemap.xml を自動生成しました！");
}

// ============================================================
// Helper function
// ============================================================

function createUrl(loc, changefreq, priority) {
  return `
  <url>
    <loc>${loc}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

function wrapSitemap(urls) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;
}

// 実行
generateSitemap();
