'use strict';

// Case study pages follow the portfolio's saved language and theme.
(function () {
  const store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  const theme = store.get("theme");
  if (theme === "dark" || theme === "light") document.documentElement.setAttribute("data-theme", theme);

  const nodes = document.querySelectorAll("[data-i18n-id]");
  nodes.forEach(function (el) { el.dataset.textEn = el.textContent; });

  const button = document.querySelector("[data-lang-toggle]");

  const apply = function (lang) {
    const id = lang === "id";
    document.documentElement.lang = id ? "id" : "en";
    nodes.forEach(function (el) { el.textContent = id ? el.dataset.i18nId : el.dataset.textEn; });
    // same convention as the portfolio: the button shows the current language
    if (button) button.textContent = id ? "ID" : "EN";
  };

  const browser = (navigator.language || "").toLowerCase().indexOf("id") === 0 ? "id" : "en";
  apply(store.get("lang") || browser);

  if (button) {
    button.addEventListener("click", function () {
      const next = document.documentElement.lang === "id" ? "en" : "id";
      store.set("lang", next);
      apply(next);
    });
  }
})();
