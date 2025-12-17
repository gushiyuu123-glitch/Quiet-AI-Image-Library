// ==============================
// Elements
// ==============================
const grid = document.querySelector(".grid");
const images = Array.from(document.querySelectorAll(".grid img"));
const filterButtons = document.querySelectorAll(".filters button");
const zipBtn = document.getElementById("zip-download");
// ==============================
// SEO Titles (Category based)
// ==============================
const seoTitles = {
  architecture: "Minimal Architecture Images for Web Design | Free AI Stock",
  light: "Light & Shadow Images for Web Design | Free AI Images",
  texture: "Minimal Texture Backgrounds for Web Design | Free AI Stock",
  people: "Minimal People Images for Branding | Free AI Stock",
  workspace: "Workspace Images for Websites & Startups | Free AI Stock",
  nature: "Minimal Nature Images for Web Design | Free AI Stock",
  all: "Free AI Images for Web Design | Quiet AI Image Library"
};

function updateTitle(filter) {
  document.title = seoTitles[filter] || seoTitles.all;
}

// ==============================
// Utils
// ==============================
const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

// ==============================
// Filter logic
// ==============================
function applyFilter(filter) {
  filterButtons.forEach(b => {
    b.classList.remove("active");
    b.setAttribute("aria-pressed", "false");
  });

  const activeBtn =
    document.querySelector(`.filters button[data-filter="${filter}"]`) ||
    document.querySelector(`.filters button[data-filter="all"]`);

  if (activeBtn) {
    activeBtn.classList.add("active");
    activeBtn.setAttribute("aria-pressed", "true");
  }

  images.forEach(img => {
    img.style.display =
      filter === "all" || img.dataset.category === filter
        ? "block"
        : "none";
  });
  // ✅ SEO title update
  updateTitle(filter);
  // scrollToTop(); ← 削除
}

// ==============================
// Filter button click
// ==============================
filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const filter = btn.dataset.filter;
    const path = filter === "all" ? "/" : `/${filter}`;
    history.pushState({}, "", path);
    applyFilter(filter);
  });
});

// ==============================
// Image click → single view
// ==============================
images.forEach(img => {
  img.addEventListener("click", () => {
    const id = img.dataset.id;
    history.pushState({}, "", `/?img=${id}`);
    openSingleView(id);
    scrollToTop();
  });
});

// ==============================
// Direct image URL access
// ==============================
const params = new URLSearchParams(window.location.search);
const imgId = params.get("img");
if (imgId) openSingleView(imgId);

// ==============================
// Single view (OVERLAY方式)
// ==============================
function openSingleView(id) {
  if (document.querySelector(".single-overlay")) return;

  const src = `/images/${id}.png`;

  const overlay = document.createElement("div");
  overlay.className = "single-overlay";

  overlay.innerHTML = `
    <button class="close-btn" aria-label="Close">×</button>

    <main class="single">
      <img src="${src}" alt="">
      <p class="hint">Click image to download.</p>
    </main>
  `;

  document.body.appendChild(overlay);

  // download
  overlay.querySelector("img").addEventListener("click", () => {
    const link = document.createElement("a");
    link.href = src;
    link.download = `${id}.png`;
    link.click();
  });

  // close
  overlay.querySelector(".close-btn").addEventListener("click", closeSingleView);
  document.addEventListener("keydown", escHandler, { once: true });
}
// ==============================
// Close single view
// ==============================
function closeSingleView() {
  const overlay = document.querySelector(".single-overlay");
  if (overlay) overlay.remove();

  // トップページ以外だけ URL を戻す
  if (location.pathname !== "/") {
    history.pushState({}, "", "/");
    scrollToTop();
  }
}

function escHandler(e) {
  if (e.key === "Escape") closeSingleView();
}

// ==============================
// ZIP download
// ==============================
if (zipBtn) {
  zipBtn.addEventListener("click", async () => {
    const { default: JSZip } = await import("jszip");
    const zip = new JSZip();

    const activeFilter =
      document.querySelector(".filters button.active")?.dataset.filter || "all";

    const targets = images.filter(img =>
      activeFilter === "all" || img.dataset.category === activeFilter
    );

    for (const img of targets) {
      const res = await fetch(img.src);
      const blob = await res.blob();
      zip.file(img.src.split("/").pop(), blob);
    }

    const content = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(content);
    link.download = `quiet-ai-${activeFilter}.zip`;
    link.click();
  });
}
// ==============================
// Initial & SPA state sync
// ==============================
function syncState() {
  // overlay があれば必ず消す
  const overlay = document.querySelector(".single-overlay");
  if (overlay) overlay.remove();

  // ?img などの query を必ず消す（重要）
  if (location.search) {
    history.replaceState({}, "", location.pathname);
  }

  // 一旦すべて表示
  images.forEach(img => {
    img.style.display = "block";
  });

  const path = location.pathname.replace("/", "");
  applyFilter(path || "all");
}

// 初期実行
syncState();

// 戻る・進む対応
window.addEventListener("popstate", syncState);
