const RESULTS = {
  stairs: [
    { label: "Easy", ppo: 87.0, ours: 94.2 },
    { label: "Medium", ppo: 91.4, ours: 95.7 },
    { label: "Hard", ppo: 91.3, ours: 92.0 },
  ],
  gap: [
    { label: "Easy", ppo: 0.0, ours: 98.0 },
    { label: "Medium", ppo: 0.0, ours: 100.0 },
    { label: "Hard", ppo: 0.0, ours: 90.0 },
  ],
  stones: [
    { label: "Easy", ppo: 0.0, ours: 87.0 },
    { label: "Medium", ppo: 0.0, ours: 88.3 },
    { label: "Hard", ppo: 0.0, ours: 78.2 },
  ],
};

function renderCharts() {
  document.querySelectorAll("[data-chart]").forEach((root) => {
    const key = root.dataset.chart;
    const rows = RESULTS[key];
    if (!rows) return;

    root.innerHTML = rows
      .map(
        (row) => `
      <div class="bar-group">
        <div class="bar-label">
          <span>${row.label}</span>
          <span>${row.ppo.toFixed(1)}% / ${row.ours.toFixed(1)}%</span>
        </div>
        <div class="bars">
          <div class="bar ppo" title="PPO"><span data-width="${row.ppo}"></span></div>
          <div class="bar ours" title="WM-LOCO"><span data-width="${row.ours}"></span></div>
        </div>
      </div>`
      )
      .join("");
  });
}

function animateBars(root) {
  root.querySelectorAll(".bar > span[data-width]").forEach((bar) => {
    const width = Number(bar.dataset.width);
    requestAnimationFrame(() => {
      bar.style.width = `${Math.max(width, width === 0 ? 0 : 2)}%`;
    });
  });
}

function setupSceneTabs() {
  const tabs = document.querySelectorAll(".scene-tab");
  const panels = document.querySelectorAll(".media-panel");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const scene = tab.dataset.scene;
      tabs.forEach((t) => {
        t.classList.toggle("is-active", t === tab);
        t.setAttribute("aria-selected", t === tab ? "true" : "false");
      });
      panels.forEach((panel) => {
        panel.classList.toggle("is-hidden", panel.dataset.panel !== scene);
      });
    });
  });
}

function setupNav() {
  const header = document.querySelector(".site-header");
  const nav = document.querySelector(".nav");
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelectorAll(".nav-links a");
  const sections = [...document.querySelectorAll("main section[id]")];

  const onScroll = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 12);

    const y = window.scrollY + 96;
    let current = sections[0]?.id;
    for (const section of sections) {
      if (section.offsetTop <= y) current = section.id;
    }
    links.forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === `#${current}`);
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  toggle?.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });

  links.forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      toggle?.setAttribute("aria-expanded", "false");
    });
  });
}

function setupReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    document.querySelectorAll(".bar-chart").forEach(animateBars);
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        if (entry.target.classList.contains("chart-card")) {
          const chart = entry.target.querySelector(".bar-chart");
          if (chart) animateBars(chart);
        }
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.18 }
  );

  items.forEach((el) => io.observe(el));
}

function setupCopy() {
  const btn = document.querySelector("[data-copy]");
  const code = document.querySelector("#bibtex code");
  if (!btn || !code) return;

  btn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(code.textContent.trim());
      btn.textContent = "Copied";
      btn.classList.add("is-copied");
      setTimeout(() => {
        btn.textContent = "Copy";
        btn.classList.remove("is-copied");
      }, 1600);
    } catch {
      btn.textContent = "Select manually";
    }
  });
}

function setupVideoPoster() {
  const video = document.getElementById("live-demo-video");
  if (!video) return;

  const showFirstFrame = () => {
    if (!video.paused) return;
    // Seek slightly into the file so the browser paints frame 0 as the cover.
    const target = Math.min(0.05, (video.duration || 1) * 0.001);
    if (Math.abs(video.currentTime - target) < 0.001) return;
    try {
      video.currentTime = target;
    } catch {
      /* ignore seek errors before ready */
    }
  };

  if (video.readyState >= 1) showFirstFrame();
  video.addEventListener("loadedmetadata", showFirstFrame, { once: true });
  video.addEventListener("loadeddata", showFirstFrame, { once: true });
}

renderCharts();
setupSceneTabs();
setupNav();
setupReveal();
setupCopy();
setupVideoPoster();
