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
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.15 }
  );
  items.forEach((el) => io.observe(el));
}

/* Click a video or figure -> open it enlarged in an overlay instead of
   playing / opening in place. Esc, the close button, or a click on the
   backdrop closes it. */
function setupLightbox() {
  const box = document.getElementById("lightbox");
  const stage = box?.querySelector(".lightbox-stage");
  const closeBtn = box?.querySelector(".lightbox-close");
  if (!box || !stage) return;
  let lastFocus = null;

  const open = (type, src, poster, label) => {
    stage.innerHTML = "";
    let el;
    if (type === "video") {
      el = document.createElement("video");
      el.src = src;
      if (poster) el.poster = poster;
      el.controls = true;
      el.autoplay = true;
      el.playsInline = true;
      el.loop = !/demo-v\d+/.test(src);
    } else {
      el = document.createElement("img");
      el.src = src;
      el.alt = label || "";
    }
    el.className = "lightbox-media";
    stage.appendChild(el);
    lastFocus = document.activeElement;
    box.hidden = false;
    document.body.classList.add("lb-lock");
    requestAnimationFrame(() => box.classList.add("is-open"));
    closeBtn?.focus({ preventScroll: true });
    if (type === "video") el.play?.().catch(() => {});
  };

  const close = () => {
    if (box.hidden) return;
    const v = stage.querySelector("video");
    if (v) v.pause();
    box.classList.remove("is-open");
    document.body.classList.remove("lb-lock");
    setTimeout(() => {
      box.hidden = true;
      stage.innerHTML = "";
    }, 200);
    lastFocus?.focus?.({ preventScroll: true });
  };

  document.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-lightbox]");
    if (!trigger) return;
    e.preventDefault();
    const src = trigger.dataset.src || trigger.getAttribute("href");
    open(trigger.dataset.lightbox, src, trigger.dataset.poster, trigger.getAttribute("aria-label"));
  });

  box.addEventListener("click", (e) => {
    if (e.target === box || e.target === stage) close();
  });
  closeBtn?.addEventListener("click", close);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
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

setupNav();
setupReveal();
setupLightbox();
setupCopy();
