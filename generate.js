// =====================================
// Quiet AI Image Library - Auto Generator (最強版)
// ファイル名の自動リネーム + 連番付与 + images.json の自動生成
// =====================================

import fs from "fs";
import path from "path";

const IMAGES_DIR = "./public/images";
const OUTPUT_JSON = "./public/data/images.json";

// SEO alt テキスト生成（C：最強SEOモード）
function generateAltText(category, filename) {
  const cleaned = filename.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ").trim();

  const phrases = {
    architecture:
      "minimal modern architectural space with soft natural light and subtle concrete texture, suitable for sophisticated web design and branding visuals",
    light:
      "calm natural lighting atmosphere with soft gradients and delicate shadow expressions, ideal for minimal UI backgrounds and artistic layouts",
    texture:
      "subtle material texture with elegant neutral tones, perfect for refined website backgrounds and premium design projects",
    people:
      "minimal lifestyle scene featuring a human presence in a quiet modern environment, adding depth and emotional nuance to visual storytelling",
    workspace:
      "clean creative workspace with soft daylight and balanced negative space, excellent for productivity or tech-focused design concepts",
    nature:
      "soft natural landscape with serene tones and subtle organic patterns, ideal for calm-themed creative and branding uses",
  };

  const phrase =
    phrases[category] ||
    "minimal calm visual suitable for modern web design and branding";

  return `${cleaned}: ${phrase}.`;
}

// =====================================
// メイン処理：カテゴリごとに自動連番 & 自動リネーム
// =====================================

const data = {};

const categories = fs.readdirSync(IMAGES_DIR);

categories.forEach((category) => {
  const categoryPath = path.join(IMAGES_DIR, category);
  if (!fs.statSync(categoryPath).isDirectory()) return;

  const files = fs
    .readdirSync(categoryPath)
    .filter((f) => /\.(png|jpg|jpeg|webp)$/i.test(f));

  // 既存の architecture-001.png のような番号つきファイルから最大番号を検出
  let maxNumber = 0;
  files.forEach((file) => {
    const match = file.match(new RegExp(`${category}-(\\d+)\\.`));
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNumber) maxNumber = num;
    }
  });

  const newList = [];

  files.forEach((file) => {
    const ext = path.extname(file);

    let finalName = file;

    // 既に正しい名前のものはスキップ
    const alreadyNumbered = new RegExp(`${category}-(\\d+)\\.`).test(file);

    if (!alreadyNumbered) {
      // → 新規画像として連番を振る
      maxNumber++;
      finalName = `${category}-${String(maxNumber).padStart(3, "0")}${ext}`;

      // リネーム実行
      fs.renameSync(
        path.join(categoryPath, file),
        path.join(categoryPath, finalName)
      );
    }

    const id = finalName.replace(/\.[^/.]+$/, "");

    newList.push({
      id,
      category,
      src: `/images/${category}/${finalName}`,
      alt: generateAltText(category, id),
      loading: "lazy",
    });
  });

  data[category] = newList;
});

// JSON保存
fs.writeFileSync(OUTPUT_JSON, JSON.stringify(data, null, 2), "utf8");

console.log("🔥 完了：自動連番 + 自動リネーム + images.json 生成！");
