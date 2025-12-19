// ==============================
// Load JSON (public/data/images.json)
// ==============================
let flatData = [];

async function loadImages() {
  const res = await fetch("/data/images.json");
  const data = await res.json();

  // カテゴリ別 → 一つの配列へ
  flatData = Object.values(data).flat();

  renderImages();
  bindImageClick();
  syncState();
  updateSEOText();        // ← SEO強化
  updateCanonical();      // ← canonical自動生成
}

loadImages();


// ==============================
// Elements
// ==============================
const grid = document.getElementById("imageGrid");
const filterButtons = document.querySelectorAll(".filters button");
const zipBtn = document.getElementById("zip-download");

let savedScroll = 0;
let images = [];


// ==============================
// Render Images
// ==============================
function renderImages() {
  grid.innerHTML = flatData
    .map(
      (img) => `
      <img
        src="${img.src}"
        data-id="${img.id}"
        data-category="${img.category}"
        alt="${img.alt}"
        loading="lazy"
      />
    `
    )
    .join("");

  images = Array.from(document.querySelectorAll(".grid img"));
}


// ==============================
// Filter Logic
// ==============================
function applyFilter(filter) {
  filterButtons.forEach((b) => {
    b.classList.remove("active");
    b.setAttribute("aria-pressed", "false");
  });

  const btn =
    document.querySelector(`.filters button[data-filter="${filter}"]`) ||
    document.querySelector(`.filters button[data-filter="all"]`);

  if (btn) {
    btn.classList.add("active");
    btn.setAttribute("aria-pressed", "true");
  }

  images.forEach((img) => {
    img.style.display =
      filter === "all" || img.dataset.category === filter ? "block" : "none";
  });

  // SEOテキストをカテゴリに合わせて書き換え
  updateSEOText(filter);
}


// ==============================
// Filter Button Clicks
// ==============================
filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const filter = btn.dataset.filter;
    const path = filter === "all" ? "/" : `/${filter}`;
    history.pushState({}, "", path);

    applyFilter(filter);
    updateCanonical(filter);
  });
});


// ==============================
// Image Click → Single Page
// ==============================
function bindImageClick() {
  images.forEach((img) => {
    img.addEventListener("click", () => {
      const id = img.dataset.id;

      savedScroll = window.scrollY;
      sessionStorage.setItem("quiet-scroll", savedScroll.toString());

      window.location.href = `/image.html?img=${id}`;
    });
  });
}


// ==============================
// SPA Sync
// ==============================
function syncState() {
  const path = location.pathname.replace("/", "");
  applyFilter(path || "all");
  updateCanonical(path || "all");
}


// ==============================
// POPSTATE → 戻るボタン対応
// ==============================
window.addEventListener("popstate", () => {
  syncState();

  const restored = sessionStorage.getItem("quiet-scroll");
  if (restored) window.scrollTo(0, parseInt(restored, 10));
});


// ==============================
// Restore Scroll
// ==============================
window.addEventListener("pageshow", () => {
  const restored = sessionStorage.getItem("quiet-scroll");
  if (restored) {
    window.scrollTo(0, parseInt(restored, 10));
  }
});


// =========================================================
//  SEO：カテゴリごとに説明文を自動生成（Google対策の超重要部）
// =========================================================

const seoCategoryText = document.getElementById("seo-category-text");

const CATEGORY_SEO = {
  architecture: `
    <h2>Architecture AI Images for Web Design</h2>
    <p>
      Minimal architectural AI-generated images featuring soft light,
      modern geometry, and concrete textures — perfect for landing pages,
      portfolios, and high-end branding.
    </p>
  `,
  light: `
    <h2>Light & Shadow AI Images</h2>
    <p>
      Soft natural lighting studies ideal for UI backgrounds,
      hero sections, and minimal digital designs.
    </p>
  `,
  texture: `
    <h2>Minimal Texture Backgrounds</h2>
    <p>
      Neutral abstract textures perfect for modern websites,
      branding visuals, and quiet minimal layouts.
    </p>
  `,
  people: `
    <h2>Minimal People & Silhouette Images</h2>
    <p>
      Editorial-style human silhouettes and minimal lifestyle imagery
      adding emotional depth to modern web designs.
    </p>
  `,
  workspace: `
    <h2>Workspace & Creative Desk AI Images</h2>
    <p>
      Clean workspaces with soft daylight and
      balanced composition — ideal for SaaS, portfolios, and tech design.
    </p>
  `,
  nature: `
    <h2>Nature & Calm Organic AI Images</h2>
    <p>
      Soft landscapes and serene gradients inspired by natural forms,
      ideal for minimal and wellness-related web design.
    </p>
  `,
  all: `
    <h2>Free AI Images for Web Design</h2>
    <p>
      A curated collection of AI-generated images optimized for landing pages,
      branding, portfolios, and modern digital creatives.
    </p>
  `
};

function updateSEOText(filter = "all") {
  const html = CATEGORY_SEO[filter] || CATEGORY_SEO["all"];
  seoCategoryText.innerHTML = html;
}


// =========================================================
//  SEO：Canonical 自動生成（カテゴリごと）
// =========================================================

function updateCanonical(filter = "all") {
  const base = "https://quiet-ai.gushikendesign.com";
  const url = filter === "all" ? `${base}/` : `${base}/${filter}`;
  const link = document.getElementById("canonical");
  if (link) link.href = url;
}
