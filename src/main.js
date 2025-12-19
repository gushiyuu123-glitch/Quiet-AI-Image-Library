// ==============================
// Load JSON
// ==============================
import imagesData from "./images.json";

// ==============================
// Elements
// ==============================
const grid = document.getElementById("imageGrid");
const filterButtons = document.querySelectorAll(".filters button");
const zipBtn = document.getElementById("zip-download");

// ==============================
// Insert images dynamically
// ==============================
grid.innerHTML = imagesData
  .map(
    img => `
      <img 
        src="${img.src}" 
        data-id="${img.id}" 
        data-category="${img.category}" 
        alt="${img.alt}"
      />
    `
  )
  .join("");

const images = Array.from(document.querySelectorAll(".grid img"));

// ==============================
// SEO Titles
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

const isMobile = () =>
  /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

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

  updateTitle(filter);
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
// Single view
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
      <p class="hint">Tap image to download.</p>
      <div class="save-toast">長押しで保存できます</div>
    </main>
  `;

  document.body.appendChild(overlay);

  overlay.querySelector("img").addEventListener("click", () =>
    handleImageDownload(src, id)
  );

  overlay
    .querySelector(".close-btn")
    .addEventListener("click", closeSingleView);

  document.addEventListener("keydown", escHandler, { once: true });
}

// ==============================
// Download handler
// ==============================
function handleImageDownload(src, id) {
  if (isMobile()) {
    window.open(src, "_blank");

    const toast = document.querySelector(".save-toast");
    toast.classList.add("visible");
    setTimeout(() => toast.classList.remove("visible"), 1600);
  } else {
    const link = document.createElement("a");
    link.href = src;
    link.download = `${id}.png`;
    link.click();
  }
}

// ==============================
// Close single
// ==============================
function closeSingleView() {
  const overlay = document.querySelector(".single-overlay");
  if (overlay) overlay.remove();

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
      document.querySelector(".filters button.active")?.dataset.filter ||
      "all";

    const targets = imagesData.filter(
      img =>
        activeFilter === "all" || img.category === activeFilter
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
// SPA sync
// ==============================
function syncState() {
  const overlay = document.querySelector(".single-overlay");
  if (overlay) overlay.remove();

  if (location.search) {
    history.replaceState({}, "", location.pathname);
  }

  images.forEach(img => {
    img.style.display = "block";
  });

  const path = location.pathname.replace("/", "");
  applyFilter(path || "all");
}

syncState();
window.addEventListener("popstate", syncState);
