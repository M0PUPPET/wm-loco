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
   playing / opening in place.

   The media is fitted to whatever space the browser actually has: the
   overlay measures its own content box (dynamic viewport height, safe-area
   insets, caption height) and sizes the media to the largest box with the
   media's real aspect ratio. It re-fits on resize, rotation and mobile
   toolbar show/hide. Figures can be tapped to view at full resolution and
   panned; tap again to fit. Esc, the close button or the backdrop closes. */
function setupLightbox() {
  const box = document.getElementById("lightbox");
  const stage = box?.querySelector(".lightbox-stage");
  const caption = box?.querySelector(".lightbox-caption");
  const closeBtn = box?.querySelector(".lightbox-close");
  if (!box || !stage) return;

  const MAX_UPSCALE = 2; // never blow media up beyond 2x its native pixels
  let media = null;
  let ar = 16 / 9; // width / height
  let natW = 0;
  let zoomed = false;
  let lastFocus = null;
  let pausedInline = [];

  const captionFor = (trigger) => {
    const fig = trigger.closest("figure");
    const fc = fig?.querySelector("figcaption");
    if (!fc) return trigger.getAttribute("aria-label") || "";
    const parts = [...fc.querySelectorAll("h3, p")].map((e) => e.textContent.trim()).filter(Boolean);
    const text = parts.length ? parts.join(" · ") : fc.textContent;
    return text.replace(/\s+/g, " ").trim();
  };

  const fit = () => {
    if (!media || box.hidden || zoomed) return;
    const cs = getComputedStyle(box);
    const padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
    const padY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    const capH = caption && caption.offsetParent !== null && caption.textContent ? caption.offsetHeight + parseFloat(cs.rowGap || cs.gap || 0) : 0;
    const availW = Math.max(120, box.clientWidth - padX);
    const availH = Math.max(90, box.clientHeight - padY - capH);
    let w = Math.min(availW, availH * ar);
    if (natW) w = Math.min(w, natW * MAX_UPSCALE);
    media.style.width = `${Math.floor(w)}px`;
    media.style.height = `${Math.floor(w / ar)}px`;
    // figures shown well below native resolution get a "tap to zoom" hint
    stage.classList.toggle("can-zoom", media.tagName === "IMG" && natW > 0 && w < natW * 0.75);
  };

  const setZoom = (on, evt) => {
    if (!media || media.tagName !== "IMG") return;
    zoomed = on;
    stage.classList.toggle("is-zoomed", on);
    if (!on) {
      fit();
      return;
    }
    const rect = media.getBoundingClientRect();
    const fx = evt ? (evt.clientX - rect.left) / rect.width : 0.5;
    const fy = evt ? (evt.clientY - rect.top) / rect.height : 0.5;
    const w = Math.max(natW || rect.width * 2, rect.width * 1.6);
    media.style.width = `${Math.round(w)}px`;
    media.style.height = `${Math.round(w / ar)}px`;
    requestAnimationFrame(() => {
      stage.scrollLeft = fx * stage.scrollWidth - stage.clientWidth / 2;
      stage.scrollTop = fy * stage.scrollHeight - stage.clientHeight / 2;
    });
  };

  const open = (trigger) => {
    const type = trigger.dataset.lightbox;
    const src = trigger.dataset.src || trigger.getAttribute("href");
    stage.innerHTML = "";
    stage.classList.remove("is-zoomed");
    zoomed = false;
    natW = 0;

    const hintImg = trigger.querySelector("img");
    const hw = Number(hintImg?.getAttribute("width"));
    const hh = Number(hintImg?.getAttribute("height"));
    ar = hw && hh ? hw / hh : 16 / 9;

    if (type === "video") {
      media = document.createElement("video");
      media.src = src;
      if (trigger.dataset.poster) media.poster = trigger.dataset.poster;
      media.controls = true;
      media.playsInline = true;
      media.preload = "auto";
      media.loop = !/demo-v\d+/.test(src);
      media.addEventListener("loadedmetadata", () => {
        if (media.videoWidth && media.videoHeight) {
          ar = media.videoWidth / media.videoHeight;
          natW = media.videoWidth;
          fit();
        }
      });
    } else {
      media = document.createElement("img");
      media.src = src;
      media.alt = trigger.getAttribute("aria-label") || "";
      media.decoding = "async";
      media.addEventListener("load", () => {
        ar = media.naturalWidth / media.naturalHeight;
        natW = media.naturalWidth;
        fit();
      });
      media.addEventListener("click", (e) => {
        e.stopPropagation();
        setZoom(!zoomed, e);
      });
    }
    media.className = "lightbox-media";
    stage.appendChild(media);
    if (caption) caption.textContent = captionFor(trigger);

    pausedInline = [...document.querySelectorAll("video.demo-clip")].filter((v) => !v.paused);
    pausedInline.forEach((v) => v.pause());

    lastFocus = document.activeElement;
    box.hidden = false;
    document.body.classList.add("lb-lock");
    fit();
    requestAnimationFrame(() => {
      box.classList.add("is-open");
      fit();
    });
    closeBtn?.focus({ preventScroll: true });

    if (type === "video") {
      const p = media.play?.();
      if (p && p.catch) {
        p.catch(() => {
          // Autoplay with sound refused (some mobile browsers): retry muted.
          media.muted = true;
          media.play().catch(() => {});
        });
      }
    }
  };

  const close = () => {
    if (box.hidden) return;
    if (media && media.tagName === "VIDEO") media.pause();
    box.classList.remove("is-open");
    document.body.classList.remove("lb-lock");
    pausedInline.forEach((v) => v.play().catch(() => {}));
    pausedInline = [];
    setTimeout(() => {
      box.hidden = true;
      stage.innerHTML = "";
      stage.classList.remove("is-zoomed");
      media = null;
    }, 200);
    lastFocus?.focus?.({ preventScroll: true });
  };

  document.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-lightbox]");
    if (!trigger) return;
    e.preventDefault();
    open(trigger);
  });

  box.addEventListener("click", (e) => {
    if (e.target === box || (e.target === stage && !zoomed) || e.target === caption) close();
  });
  closeBtn?.addEventListener("click", close);
  document.addEventListener("keydown", (e) => {
    if (box.hidden) return;
    if (e.key === "Escape") {
      if (zoomed) setZoom(false);
      else close();
    }
  });

  let raf = 0;
  const refit = () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(fit);
  };
  window.addEventListener("resize", refit);
  window.addEventListener("orientationchange", () => setTimeout(fit, 250));
  window.visualViewport?.addEventListener("resize", refit);
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
