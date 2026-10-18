// Progressive enhancement only: the page is complete and readable without JS
// (Polish, system theme, all projects visible, plain anchor navigation).
(function () {
  "use strict";

  var root = document.documentElement;
  var STORE = { lang: "dt-lang", theme: "dt-theme" };

  function store(key, value) {
    try {
      if (value === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, value);
    } catch (e) {
      return null;
    }
  }

  /* Language -------------------------------------------------------------- */
  var meta = {
    pl: {
      title: root.getAttribute("data-title-pl"),
      description: root.getAttribute("data-description-pl"),
      locale: "pl_PL",
    },
    en: {
      title: root.getAttribute("data-title-en"),
      description: root.getAttribute("data-description-en"),
      locale: "en_US",
    },
  };

  function setMeta(selector, value) {
    var el = document.querySelector(selector);
    if (el && value) el.setAttribute("content", value);
  }

  function applyLang(lang, persist) {
    if (lang !== "pl" && lang !== "en") lang = "pl";
    root.lang = lang;
    if (meta[lang].title) document.title = meta[lang].title;
    setMeta('meta[name="description"]', meta[lang].description);
    setMeta('meta[property="og:title"]', meta[lang].title);
    setMeta('meta[property="og:description"]', meta[lang].description);
    setMeta('meta[property="og:locale"]', meta[lang].locale);

    document.querySelectorAll("[data-set-lang]").forEach(function (btn) {
      btn.setAttribute("aria-pressed", String(btn.getAttribute("data-set-lang") === lang));
    });

    // Attributes that can't be expressed with lang-paired elements.
    document.querySelectorAll("[data-label-pl]").forEach(function (el) {
      el.setAttribute("aria-label", el.getAttribute("data-label-" + lang));
    });
    document.querySelectorAll("[data-alt-pl]").forEach(function (el) {
      el.setAttribute("alt", el.getAttribute("data-alt-" + lang));
    });

    if (persist) {
      store(STORE.lang, lang);
      var url = new URL(window.location.href);
      if (lang === "pl") url.searchParams.delete("lang");
      else url.searchParams.set("lang", lang);
      history.replaceState(null, "", url);
    }
  }

  document.querySelectorAll("[data-set-lang]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      applyLang(btn.getAttribute("data-set-lang"), true);
    });
  });
  applyLang(root.lang, false);

  /* Theme ----------------------------------------------------------------- */
  var themeBtn = document.querySelector("[data-theme-toggle]");
  var darkQuery = window.matchMedia("(prefers-color-scheme: dark)");

  function currentTheme() {
    return root.getAttribute("data-theme") || (darkQuery.matches ? "dark" : "light");
  }

  function syncThemeColor() {
    setMeta('meta[name="theme-color"]', currentTheme() === "dark" ? "#0f172a" : "#f8fafc");
  }

  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      store(STORE.theme, next);
      syncThemeColor();
    });
  }
  if (darkQuery.addEventListener) darkQuery.addEventListener("change", syncThemeColor);
  syncThemeColor();

  /* Mobile navigation ----------------------------------------------------- */
  var nav = document.getElementById("site-nav");
  var menuBtn = document.querySelector("[data-menu-toggle]");

  function setMenu(open) {
    if (!nav || !menuBtn) return;
    nav.classList.toggle("is-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
  }

  if (nav && menuBtn) {
    menuBtn.addEventListener("click", function () {
      setMenu(menuBtn.getAttribute("aria-expanded") !== "true");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menuBtn.getAttribute("aria-expanded") === "true") {
        setMenu(false);
        menuBtn.focus();
      }
    });
    window.matchMedia("(min-width: 861px)").addEventListener("change", function (e) {
      if (e.matches) setMenu(false);
    });
  }

  /* Current section in nav ------------------------------------------------ */
  var links = Array.prototype.slice.call(document.querySelectorAll(".nav__link[href^='#']"));
  if ("IntersectionObserver" in window && links.length) {
    var byId = {};
    links.forEach(function (a) {
      byId[a.getAttribute("href").slice(1)] = a;
    });
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          links.forEach(function (a) {
            a.removeAttribute("aria-current");
          });
          var link = byId[entry.target.id];
          if (link) link.setAttribute("aria-current", "true");
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    Object.keys(byId).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) spy.observe(section);
    });
  }

  /* Project filter -------------------------------------------------------- */
  var filters = document.querySelectorAll("[data-filter]");
  var projects = document.querySelectorAll("[data-tags]");
  var status = document.getElementById("filter-status");

  function applyFilter(value) {
    var shown = 0;
    projects.forEach(function (card) {
      var match = value === "all" || card.getAttribute("data-tags").split(" ").indexOf(value) !== -1;
      card.hidden = !match;
      if (match) shown++;
    });
    filters.forEach(function (btn) {
      btn.setAttribute("aria-pressed", String(btn.getAttribute("data-filter") === value));
    });
    if (status) {
      status.textContent = root.lang === "en" ? shown + " projects shown" : "Widoczne projekty: " + shown;
    }
  }

  filters.forEach(function (btn) {
    btn.addEventListener("click", function () {
      applyFilter(btn.getAttribute("data-filter"));
    });
  });

  /* Copy e-mail ----------------------------------------------------------- */
  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var text = btn.getAttribute("data-copy");
      var done = function () {
        var label = btn.querySelector("[lang='" + root.lang + "']") || btn;
        var original = label.textContent;
        label.textContent = root.lang === "en" ? "Copied" : "Skopiowano";
        setTimeout(function () {
          label.textContent = original;
        }, 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () {});
      }
    });
  });
})();
