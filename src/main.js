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
}

loadImages();


// ==============================
// Elements
// ==============================
const grid = document.getElementById("imageGrid");
const filterButtons = document.querySelectorAll(".filters button");
const zipBtn = document.getElementById("zip-download");

// スクロール保持
let savedScroll = 0;


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

  // image list 再取得
  images = Array.from(document.querySelectorAll(".grid img"));
}

let images = [];


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
  });
});


// ==============================
// Image Click → Single Page
// ==============================
function bindImageClick() {
  images.forEach((img) => {
    img.addEventListener("click", () => {
      const id = img.dataset.id;

      // スクロール保存
      savedScroll = window.scrollY;
      sessionStorage.setItem("quiet-scroll", savedScroll.toString());

      // 個別ページへ
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
}

window.addEventListener("popstate", () => {
  syncState();

  const restored = sessionStorage.getItem("quiet-scroll");
  if (restored) window.scrollTo(0, parseInt(restored, 10));
});


// ==============================
// Restore Scroll on Page Show
// ==============================
window.addEventListener("pageshow", () => {
  const restored = sessionStorage.getItem("quiet-scroll");
  if (restored) {
    window.scrollTo(0, parseInt(restored, 10));
  }
});
