/* EFMI WG EDU – shared behaviour: mobile menu and light/dark toggle.
   The chosen theme is kept in localStorage on the visitor's own device.
   This is a functional preference, not a cookie, and is never sent anywhere. */
(function () {
  "use strict";
  var root = document.documentElement;
  var STORAGE_KEY = "efmi-wg-edu-theme";

  function systemPrefersDark() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  function currentTheme() {
    return root.getAttribute("data-theme") || (systemPrefersDark() ? "dark" : "light");
  }

  // Theme toggle
  var themeBtn = document.querySelector(".theme-toggle");
  function syncThemeButton() {
    if (!themeBtn) return;
    var dark = currentTheme() === "dark";
    themeBtn.setAttribute("aria-pressed", String(dark));
    themeBtn.querySelector(".theme-label").textContent = dark ? "Dark" : "Light";
  }
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem(STORAGE_KEY, next); } catch (e) { /* storage blocked: fine */ }
      syncThemeButton();
    });
    syncThemeButton();
  }

  // Mobile navigation
  var navBtn = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (navBtn && nav) {
    navBtn.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      navBtn.setAttribute("aria-expanded", String(open));
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        nav.classList.remove("is-open");
        navBtn.setAttribute("aria-expanded", "false");
        navBtn.focus();
      }
    });
  }


  // Dropdown sub-menus: click/Enter toggles, Escape or click outside closes.
  var toggles = Array.prototype.slice.call(document.querySelectorAll(".sub-toggle"));
  function closeAll(except) {
    toggles.forEach(function (b) {
      if (b === except) return;
      b.setAttribute("aria-expanded", "false");
      b.parentNode.classList.remove("is-open");
    });
  }
  toggles.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") !== "true";
      closeAll(btn);
      btn.setAttribute("aria-expanded", String(open));
      btn.parentNode.classList.toggle("is-closed", !open);
    });
    btn.parentNode.addEventListener("mouseleave", function () { btn.parentNode.classList.remove("is-closed"); });
  });
  document.addEventListener("click", function (e) {
    if (!e.target.closest || !e.target.closest(".has-sub")) closeAll(null);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    var openBtn = toggles.filter(function (b) { return b.getAttribute("aria-expanded") === "true"; })[0];
    if (openBtn) { closeAll(null); openBtn.parentNode.classList.add("is-closed"); openBtn.focus(); }
  });

  // Home highlights: hide items after their data-until day, and the section when none is left.
  var today = new Date().toISOString().slice(0, 10);
  Array.prototype.forEach.call(document.querySelectorAll(".highlight[data-until]"), function (el) {
    if (el.getAttribute("data-until") < today) el.classList.add("is-expired");
  });
  var hl = document.querySelector(".highlights");
  if (hl && !hl.querySelector(".highlight:not(.is-expired)")) hl.hidden = true;

  // Current year in footer
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
