// Progressive enhancement only: the page is complete and readable without JS
// (Polish, system theme, plain anchor navigation).
(function () {
  "use strict";

  var root = document.documentElement;
  var STORE = { lang: "dt-lang", theme: "dt-theme" };
  var SITE_URL = "https://damiantomczyszyn.github.io/About-Me/";

  function store(key, value) {
    try {
      if (value === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, value);
    } catch (e) {
      return null;
    }
  }

  function onMediaChange(query, handler) {
    if (query.addEventListener) query.addEventListener("change", handler);
    else if (query.addListener) query.addListener(handler);
  }

  function setMeta(selector, value) {
    document.querySelectorAll(selector).forEach(function (el) {
      if (value) el.setAttribute("content", value);
    });
  }

  /* Language -------------------------------------------------------------- */
  var meta = {
    pl: {
      title: root.getAttribute("data-title-pl"),
      description: root.getAttribute("data-description-pl"),
      locale: "pl_PL",
      url: SITE_URL,
    },
    en: {
      title: root.getAttribute("data-title-en"),
      description: root.getAttribute("data-description-en"),
      locale: "en_GB",
      url: SITE_URL + "?lang=en",
    },
  };

  function applyLang(lang, persist) {
    lang = String(lang).toLowerCase() === "en" ? "en" : "pl";
    root.lang = lang;
    if (meta[lang].title) document.title = meta[lang].title;
    setMeta('meta[name="description"]', meta[lang].description);
    setMeta('meta[property="og:title"]', meta[lang].title);
    setMeta('meta[property="og:description"]', meta[lang].description);
    setMeta('meta[property="og:locale"]', meta[lang].locale);
    setMeta('meta[property="og:url"]', meta[lang].url);
    var canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute("href", meta[lang].url);

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
      try {
        var url = new URL(window.location.href);
        if (lang === "pl") url.searchParams.delete("lang");
        else url.searchParams.set("lang", lang);
        history.replaceState(null, "", url);
      } catch (e) {
        // file:// or sandboxed contexts: the saved choice is enough.
      }
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

  function syncTheme() {
    var dark = currentTheme() === "dark";
    if (themeBtn) themeBtn.setAttribute("aria-pressed", String(dark));
    // Once the visitor picks a theme, both theme-color metas follow it.
    if (root.hasAttribute("data-theme")) setMeta('meta[name="theme-color"]', dark ? "#0f172a" : "#f8fafc");
  }

  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      store(STORE.theme, next);
      syncTheme();
    });
  }
  onMediaChange(darkQuery, syncTheme);
  syncTheme();

  /* Mobile navigation ----------------------------------------------------- */
  var header = document.querySelector(".site-header");
  var nav = document.getElementById("site-nav");
  var menuBtn = document.querySelector("[data-menu-toggle]");

  function setMenu(open, focusFirst) {
    if (!nav || !menuBtn) return;
    nav.classList.toggle("is-open", open);
    if (header) header.classList.toggle("menu-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    if (open && focusFirst) {
      var first = nav.querySelector("a");
      if (first) first.focus();
    }
  }

  if (nav && menuBtn) {
    menuBtn.addEventListener("click", function (e) {
      // Keyboard activation (detail === 0) moves focus into the menu.
      setMenu(menuBtn.getAttribute("aria-expanded") !== "true", e.detail === 0);
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
    onMediaChange(window.matchMedia("(min-width: 961px)"), function (e) {
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
    // The hero has no nav link; observing it clears the highlight at the top.
    ["top"].concat(Object.keys(byId)).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) spy.observe(section);
    });
  }

  /* Copy e-mail ----------------------------------------------------------- */
  var status = document.getElementById("copy-status");
  var COPY_MSG = {
    pl: { ok: "Skopiowano adres e-mail", fail: "Nie udało się skopiować – adres jest zaznaczony" },
    en: { ok: "Email address copied", fail: "Couldn’t copy – the address is selected" },
  };

  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    if (!navigator.clipboard || !navigator.clipboard.writeText) return;
    btn.hidden = false;
    var timer;

    function announce(ok) {
      var msg = COPY_MSG[root.lang === "en" ? "en" : "pl"];
      if (status) status.textContent = ok ? msg.ok : msg.fail;
      btn.classList.toggle("is-done", ok);
      clearTimeout(timer);
      timer = setTimeout(function () {
        btn.classList.remove("is-done");
        if (status) status.textContent = "";
      }, 2500);
    }

    function selectValue() {
      var value = btn.parentNode.querySelector(".contact-row__value");
      if (!value || !window.getSelection) return;
      var range = document.createRange();
      range.selectNodeContents(value);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }

    btn.addEventListener("click", function () {
      navigator.clipboard.writeText(btn.getAttribute("data-copy")).then(
        function () {
          announce(true);
        },
        function () {
          selectValue();
          announce(false);
        }
      );
    });
  });
})();
