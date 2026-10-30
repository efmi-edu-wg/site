/* EFMI WG EDU – shared behaviour: mobile menu and light/dark toggle.
   The chosen theme is kept in localStorage on the visitor's own device.
   This is a functional preference, not a cookie, and is never sent anywhere. */
(function () {
  "use strict";
  var root = document.documentElement;
  var STORAGE_KEY = "efmi-wg-edu-theme";

  // "TO VALIDATE" labels are hidden by main.css; open any page with ?validate to review them.
  if (/[?&]validate\b/.test(window.location.search)) root.classList.add("show-validate");

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

  // Home highlights and upcoming events: hide items after their data-until day (visitor's local date).
  // When no highlight is left the section is hidden; when no event is left the empty note is shown.
  var now = new Date();
  var today = now.getFullYear() + "-" + ("0" + (now.getMonth() + 1)).slice(-2) + "-" + ("0" + now.getDate()).slice(-2);
  Array.prototype.forEach.call(document.querySelectorAll("[data-until]"), function (el) {
    if (el.getAttribute("data-until") < today) el.classList.add("is-expired");
  });
  var hl = document.querySelector(".highlights");
  if (hl && !hl.querySelector(".highlight:not(.is-expired)")) hl.hidden = true;
  var ev = document.querySelector(".upcoming-events");
  if (ev && !ev.querySelector(".card:not(.is-expired)")) {
    var list = ev.querySelector(".grid");
    var note = ev.querySelector(".events-empty");
    if (list) list.hidden = true;
    if (note) note.hidden = false;
  }

  // Table filters: each <select name> matches a space-separated data-<name> on the rows.
  Array.prototype.forEach.call(document.querySelectorAll(".table-filters[data-filter-for]"), function (form) {
    var table = document.getElementById(form.getAttribute("data-filter-for"));
    if (!table) return;
    var rows = Array.prototype.slice.call(table.tBodies[0].rows);
    var selects = Array.prototype.slice.call(form.querySelectorAll("select"));
    var count = form.querySelector(".filter-count");
    var empty = form.parentNode.querySelector(".filter-empty");
    function apply() {
      var shown = 0;
      rows.forEach(function (row) {
        var ok = selects.every(function (s) {
          return !s.value || (" " + (row.getAttribute("data-" + s.name) || "") + " ").indexOf(" " + s.value + " ") !== -1;
        });
        row.hidden = !ok;
        if (ok) shown++;
      });
      if (count) count.textContent = "Showing " + shown + " of " + rows.length;
      if (empty) empty.hidden = shown > 0;
    }
    form.addEventListener("change", apply);
    form.addEventListener("submit", function (e) { e.preventDefault(); });
    form.hidden = false;
    apply();
  });

  // Publications: add records from the WG's Zenodo community to the static list, matched by DOI.
  // A record that is already listed only gets an "Open access copy" link. If Zenodo cannot be reached
  // or the community does not exist yet, the static list stays as it is.
  var pubList = document.querySelector("[data-zenodo-community]");
  if (pubList && window.fetch) {
    var community = pubList.getAttribute("data-zenodo-community");
    // Anonymous requests get at most 25 records per page: show each page as it arrives, up to 8 pages.
    var zenodoAdded = 0;
    var getPage = function (url, pages) {
      return fetch(url)
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function (data) {
          zenodoAdded += addZenodoPubs(pubList, data.hits.hits);
          var next = data.links && data.links.next;
          if (next && pages > 1) return getPage(next, pages - 1);
        });
    };
    getPage("https://zenodo.org/api/communities/" + encodeURIComponent(community) +
      "/records?q=resource_type.type:publication&size=25&sort=newest", 8)
      .catch(function () {})
      .then(function () { showZenodoNote(pubList, community, zenodoAdded); });
  }

  function normDoi(s) {
    return String(s || "").trim().toLowerCase().replace(/^(https?:\/\/(dx\.)?doi\.org\/|doi:)/, "").replace(/\.+$/, "");
  }

  function el(tag, attrs, text) {
    var e = document.createElement(tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (text) e.textContent = text;
    return e;
  }

  // "Hübner, Ursula H." -> "Hübner UH"; more than 6 authors -> first 3, et al.
  function authorList(creators) {
    var names = (creators || []).map(function (c) {
      var parts = String(c.name || "").split(",");
      if (parts.length < 2) return parts[0].trim();
      var initials = parts[1].trim().split(/[\s.-]+/).map(function (w) { return w.charAt(0).toUpperCase(); }).join("");
      return parts[0].trim() + " " + initials;
    });
    return names.length > 6 ? names.slice(0, 3).join(", ") + ", et al." : names.join(", ") + ".";
  }

  function oaLink(url) {
    return el("a", { "class": "oa", href: url }, "Open access copy (Zenodo)");
  }

  function addZenodoPubs(list, hits) {
    var byDoi = {};
    Array.prototype.forEach.call(list.querySelectorAll("a.doi"), function (a) {
      byDoi[normDoi(a.getAttribute("href"))] = a.parentNode;
    });
    var added = 0;
    hits.forEach(function (hit) {
      var m = hit.metadata || {};
      if (!m.resource_type || m.resource_type.type !== "publication") return;
      var zenodoUrl = hit.links && hit.links.self_html;
      var own = normDoi(hit.doi || m.doi);
      // The publisher's DOI: the record's own DOI, or a related identifier for the same work.
      var dois = [own].concat((m.related_identifiers || []).filter(function (r) {
        return r.scheme === "doi" && /^is(identicalto|versionof|previousversionof)$/i.test(r.relation);
      }).map(function (r) { return normDoi(r.identifier); }));
      var match = dois.filter(function (d) { return byDoi[d]; })[0];
      if (match) {
        var li = byDoi[match];
        if (!li.querySelector(".oa") && li.getAttribute("data-source") !== "zenodo") {
          li.appendChild(document.createTextNode(" · "));
          li.appendChild(oaLink(zenodoUrl));
        }
        return;
      }
      var doi = dois.filter(function (d) { return d.indexOf("10.5281/zenodo.") !== 0; })[0] || own;
      var year = String(m.publication_date || "").slice(0, 4);
      var j = m.journal || {};
      var title = String(m.title || "").trim();
      var item = el("li", { "data-source": "zenodo" });
      item.appendChild(document.createTextNode(authorList(m.creators) + " " + title + (/[.?!]$/.test(title) ? " " : ". ")));
      if (j.title) {
        item.appendChild(el("em", {}, j.title + "."));
        item.appendChild(document.createTextNode(" "));
      }
      item.appendChild(document.createTextNode(year + (j.volume ? ";" + j.volume : "") + (j.issue ? "(" + j.issue + ")" : "") + (j.pages ? ":" + j.pages : "") + ". "));
      if (doi) item.appendChild(el("a", { "class": "doi", href: "https://doi.org/" + doi }, "doi:" + doi));
      if (doi !== own || !doi) {
        item.appendChild(document.createTextNode(" · "));
        item.appendChild(oaLink(zenodoUrl));
      }
      yearGroup(list, year).appendChild(item);
      dois.forEach(function (d) { if (d) byDoi[d] = item; });
      added++;
    });
    return added;
  }

  function showZenodoNote(list, community, added) {
    var note = list.querySelector(".zenodo-note");
    if (!note || !added) return;
    note.appendChild(document.createTextNode("This list also includes " + added + " publication" + (added === 1 ? "" : "s") + " from the "));
    note.appendChild(el("a", { href: "https://zenodo.org/communities/" + encodeURIComponent(community) }, "WG EDU community on Zenodo"));
    note.appendChild(document.createTextNode("."));
    note.hidden = false;
  }

  // The <ul class="pubs"> under the <h3> for this year, created in order (newest first) if missing.
  function yearGroup(list, year) {
    var heads = Array.prototype.slice.call(list.querySelectorAll("h3"));
    for (var i = 0; i < heads.length; i++) {
      var y = heads[i].textContent.trim();
      if (y === year) return heads[i].nextElementSibling;
      if (y < year) {
        var h = el("h3", {}, year || "Undated"), ul = el("ul", { "class": "pubs" });
        list.insertBefore(h, heads[i]);
        list.insertBefore(ul, heads[i]);
        return ul;
      }
    }
    var h2 = el("h3", {}, year || "Undated"), ul2 = el("ul", { "class": "pubs" });
    var before = list.querySelector(".zenodo-note");
    list.insertBefore(h2, before);
    list.insertBefore(ul2, before);
    return ul2;
  }

  // Current year in footer
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
