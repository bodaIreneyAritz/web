(function () {
  const { I18N, WEDDING_CONFIG: CFG } = window;
  const STORAGE_KEY = "wedding-lang";

  function detectLang() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && I18N.supported.includes(saved)) return saved;

    const candidates = [
      ...(navigator.languages || []),
      navigator.language || "",
    ].map((l) => l.toLowerCase());

    for (const loc of candidates) {
      if (loc.startsWith("eu")) return "eu";
      if (loc.startsWith("ca")) return "ca";
      if (loc.startsWith("es")) return "es";
    }
    return I18N.defaultLang;
  }

  function t(lang, key) {
    return (
      I18N.strings[lang]?.[key] ??
      I18N.strings[I18N.defaultLang][key] ??
      key
    );
  }

  function applyLang(lang) {
    document.documentElement.lang = lang;
    document.title = t(lang, "docTitle");

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const value = t(lang, key);
      if (el.dataset.i18nHtml === "true") el.innerHTML = value;
      else el.textContent = value;
    });

    document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
      el.setAttribute("aria-label", t(lang, el.dataset.i18nAria));
    });

    document.querySelectorAll(".lang-btn").forEach((btn) => {
      const active = btn.dataset.lang === lang;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", String(active));
    });

    localStorage.setItem(STORAGE_KEY, lang);
  }

  const LINK_STORE = {
    form: "wedding-form-url",
    album: "wedding-album-url",
  };

  function isHttpsUrl(value) {
    try {
      const u = new URL(value);
      return u.protocol === "https:";
    } catch {
      return false;
    }
  }

  function linkHint(kind) {
    return String(CFG.linkHints?.[kind] || "").trim();
  }

  const FORM_ID_PREFIX = "1FAIpQLSf";

  /* Accept full https URL or short Forms / Photos id */
  function expandGuestLink(raw, kind) {
    let value = String(raw || "").trim();
    if (!value) return "";
    if (isHttpsUrl(value)) return value;
    if (kind === "form" && /^[\w-]+$/.test(value)) {
      if (!value.startsWith("1FAIpQLS")) value = FORM_ID_PREFIX + value;
      return `https://docs.google.com/forms/d/e/${value}/viewform`;
    }
    if (kind === "album" && /^[\w-]+$/.test(value)) {
      return `https://photos.app.goo.gl/${value}`;
    }
    return "";
  }

  /* Expanded URL must be https and, if a hint is set, contain that fragment */
  function isAcceptedGuestUrl(value, kind) {
    const url = expandGuestLink(value, kind);
    if (!url || !isHttpsUrl(url)) return false;
    const hint = linkHint(kind);
    if (!hint) return true;
    if (hint.length < 3) return false;
    return url.includes(hint);
  }

  /* Short: ?f=<id>&a=<id>  (also accepts ?form= / ?album=) */
  function resolveGuestLinks() {
    const params = new URLSearchParams(location.search);
    const fromQuery = {
      form: params.get("f") || params.get("form"),
      album: params.get("a") || params.get("album"),
    };

    let dirty = false;
    ["f", "a", "form", "album"].forEach((k) => {
      if (!params.has(k)) return;
      params.delete(k);
      dirty = true;
    });

    ["form", "album"].forEach((key) => {
      const value = fromQuery[key];
      if (value == null) return;
      const url = expandGuestLink(value, key);
      if (url && isAcceptedGuestUrl(url, key)) {
        sessionStorage.setItem(LINK_STORE[key], url);
      } else {
        sessionStorage.removeItem(LINK_STORE[key]);
      }
    });

    if (dirty) {
      const next = params.toString();
      const url =
        location.pathname + (next ? `?${next}` : "") + location.hash;
      history.replaceState(null, "", url);
    }

    const form =
      sessionStorage.getItem(LINK_STORE.form) || CFG.googleFormUrl || "";
    const album =
      sessionStorage.getItem(LINK_STORE.album) || CFG.photosAlbumUrl || "";

    return {
      form: isAcceptedGuestUrl(form, "form") ? expandGuestLink(form, "form") : "",
      album: isAcceptedGuestUrl(album, "album")
        ? expandGuestLink(album, "album")
        : "",
    };
  }

  function wireExternalLinks() {
    const map = {
      "[data-link=ceremony]": CFG.maps.ceremony,
      "[data-link=celebration]": CFG.maps.celebration,
      "[data-link=bilbao]": CFG.maps.bilbaoBus,
      "[data-link=ss]": CFG.maps.sanSebastianAirport,
      "[data-link=alameda]": CFG.maps.hotelAlameda,
      "[data-link=txiki]": CFG.maps.hostalTxikiPolit,
    };
    Object.entries(map).forEach(([sel, href]) => {
      document.querySelectorAll(sel).forEach((a) => {
        a.href = href;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
      });
    });

    document.querySelectorAll("[data-tel=alameda]").forEach((a) => {
      a.href = `tel:${CFG.phones.hotelAlameda}`;
    });
    document.querySelectorAll("[data-tel=txiki]").forEach((a) => {
      a.href = `tel:${CFG.phones.hostalTxikiPolit}`;
    });

    const links = resolveGuestLinks();

    const rsvpBtn = document.querySelector("[data-link=rsvp]");
    const rsvpPending = document.querySelector("[data-rsvp-pending]");
    if (rsvpBtn && rsvpPending) {
      if (links.form && isHttpsUrl(links.form)) {
        rsvpBtn.href = links.form;
        rsvpBtn.hidden = false;
        rsvpPending.hidden = true;
      } else {
        rsvpBtn.hidden = true;
        rsvpPending.hidden = false;
      }
    }

    const photosBtn = document.querySelector("[data-link=photos]");
    const photosPending = document.querySelector("[data-photos-pending]");
    const photosReady = document.querySelector("[data-photos-ready]");
    if (photosBtn && photosPending && photosReady) {
      if (links.album && isHttpsUrl(links.album)) {
        photosBtn.href = links.album;
        photosReady.hidden = false;
        photosPending.hidden = true;
      } else {
        photosReady.hidden = true;
        photosPending.hidden = false;
      }
    }
  }

  function setupNav() {
    const toggle = document.querySelector(".nav-toggle");
    const panel = document.querySelector(".nav-links");
    if (!toggle || !panel) return;

    const close = () => {
      panel.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    };

    toggle.addEventListener("click", () => {
      const open = panel.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });

    panel.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", close);
    });
  }

  function setupReveal() {
    const nodes = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      nodes.forEach((n) => n.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          e.target.classList.toggle("is-visible", e.isIntersecting);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    nodes.forEach((n) => io.observe(n));
  }

  function setupLangSwitcher() {
    document.querySelectorAll(".lang-btn").forEach((btn) => {
      btn.addEventListener("click", () => applyLang(btn.dataset.lang));
    });
  }

  function setupStoryViewer() {
    const root = document.querySelector("[data-story-viewer]");
    if (!root) return;

    const slides = [...root.querySelectorAll(".story-viewer-frame img")];
    const dotsWrap = root.querySelector("[data-story-dots]");
    if (slides.length < 2) return;

    let index = Math.max(
      0,
      slides.findIndex((img) => img.classList.contains("is-active"))
    );
    let timer = null;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    slides.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("aria-label", String(i + 1));
      if (i === index) dot.classList.add("is-active");
      dot.addEventListener("click", () => {
        show(i);
        restart();
      });
      dotsWrap.appendChild(dot);
    });

    const dots = [...dotsWrap.querySelectorAll("button")];

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach((img, i) => img.classList.toggle("is-active", i === index));
      dots.forEach((dot, i) => dot.classList.toggle("is-active", i === index));
    }

    function tick() {
      show(index + 1);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    function start() {
      if (reduceMotion) return;
      stop();
      timer = setInterval(tick, 4200);
    }

    function restart() {
      start();
    }

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    root.addEventListener("focusin", stop);
    root.addEventListener("focusout", start);

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop();
      else start();
    });

    start();
  }

  document.addEventListener("DOMContentLoaded", () => {
    const lang = detectLang();
    applyLang(lang);
    wireExternalLinks();
    setupNav();
    setupReveal();
    setupLangSwitcher();
    setupStoryViewer();
  });
})();
