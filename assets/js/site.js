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

  // Theme toggle: the button names the mode it switches to ("Switch to dark mode").
  var themeBtn = document.querySelector(".theme-toggle");
  function syncThemeButton() {
    if (!themeBtn) return;
    var dark = currentTheme() === "dark";
    themeBtn.removeAttribute("aria-pressed");
    var prefix = themeBtn.querySelector(".visually-hidden");
    if (prefix) prefix.textContent = "Switch to ";
    themeBtn.querySelector(".theme-label").textContent = dark ? "Light mode" : "Dark mode";
  }
  // Keep the label right when the system theme changes while the page is open.
  if (window.matchMedia) {
    var mq = window.matchMedia("(prefers-color-scheme: dark)");
    if (mq.addEventListener) mq.addEventListener("change", syncThemeButton);
    else if (mq.addListener) mq.addListener(syncThemeButton);
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

  // Conference papers: read the CSV named in data-papers-src and show it as a list grouped by event.
  // Only rows with status "Validated" are shown (add ?preview to the address to see "Proposed" rows too).
  // data-papers-event limits the list to one event; data-papers-filters adds the filter bar.
  Array.prototype.forEach.call(document.querySelectorAll("[data-papers-src]"), function (box) {
    if (!window.fetch) return;
    fetch(box.getAttribute("data-papers-src"))
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then(function (text) { renderPapers(box, parseCsv(text)); })
      .catch(function () {
        var msg = box.querySelector(".paper-loading");
        if (msg) msg.textContent = "The list could not be loaded. You can still download the CSV file.";
      });
  });

  // RFC 4180 CSV: quoted fields may hold commas, line breaks and doubled quotes. Returns objects keyed by the header row.
  function parseCsv(text) {
    var rows = [], row = [], field = "", q = false;
    text = text.replace(/^﻿/, "");
    for (var i = 0; i < text.length; i++) {
      var c = text.charAt(i);
      if (q) {
        if (c === '"') { if (text.charAt(i + 1) === '"') { field += '"'; i++; } else q = false; }
        else field += c;
      } else if (c === '"') q = true;
      else if (c === ",") { row.push(field); field = ""; }
      else if (c === "\n" || c === "\r") {
        if (c === "\r" && text.charAt(i + 1) === "\n") i++;
        row.push(field); field = "";
        if (row.join("") !== "") rows.push(row);
        row = [];
      } else field += c;
    }
    row.push(field);
    if (row.join("") !== "") rows.push(row);
    var head = (rows.shift() || []).map(function (h) { return h.trim().toLowerCase(); });
    return rows.map(function (r) {
      var o = {};
      head.forEach(function (h, k) { o[h] = (r[k] || "").trim(); });
      return o;
    });
  }

  var TYPE_ORDER = ["Keynote", "Workshop", "Panel", "Paper", "Short communication", "Poster"];
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  function safeUrl(u) { return /^(https?:\/\/|[\w.\-\/%]+$)/i.test(u) && !/^javascript:/i.test(u) ? u : ""; }
  function shortDate(d) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d || "");
    return m ? parseInt(m[3], 10) + " " + MONTHS[parseInt(m[2], 10) - 1] + " " + m[1] : d;
  }
  function topicsOf(p) { return p.topics.split(";").map(function (t) { return t.trim(); }).filter(Boolean); }

  function renderPapers(box, all) {
    var preview = /[?&]preview\b/.test(location.search);
    var only = box.getAttribute("data-papers-event");
    var base = box.getAttribute("data-papers-base") || "";
    var papers = all.filter(function (p) {
      var st = (p.status || "").toLowerCase();
      return p.title && (st === "validated" || (preview && st === "proposed")) && (!only || p.event === only);
    });
    var loading = box.querySelector(".paper-loading");
    if (loading) loading.remove();
    if (!papers.length) {
      box.appendChild(el("p", { "class": "filter-empty" }, "No entries yet."));
      return;
    }

    // Events newest first; inside an event, by type, then in CSV order.
    var events = [];
    papers.forEach(function (p, i) {
      p._i = i;
      var e = events.filter(function (x) { return x.name === p.event; })[0];
      if (!e) { e = { name: p.event, page: p.event_page, last: "", items: [] }; events.push(e); }
      if (p.date > e.last) e.last = p.date;
      e.items.push(p);
    });
    events.sort(function (a, b) { return a.last < b.last ? 1 : -1; });

    var filters = box.hasAttribute("data-papers-filters") ? paperFilters(box, papers, events) : null;
    events.forEach(function (e) {
      var sec = el("section", { "class": "paper-event" });
      if (!only) {
        var h = el("h3", {});
        var page = safeUrl(e.page);
        if (page) h.appendChild(el("a", { href: base + page }, e.name)); else h.textContent = e.name;
        sec.appendChild(h);
      }
      var ul = el("ul", { "class": "paper-items" });
      e.items.sort(function (a, b) {
        var ta = TYPE_ORDER.indexOf(a.type), tb = TYPE_ORDER.indexOf(b.type);
        return (ta < 0 ? 99 : ta) - (tb < 0 ? 99 : tb) || a._i - b._i;
      }).forEach(function (p) { ul.appendChild(paperItem(p, base, filters)); });
      sec.appendChild(ul);
      box.appendChild(sec);
    });
    if (filters) filters.apply();
  }

  function paperItem(p, base, filters) {
    var li = el("li", { "class": "paper" });
    li._paper = p;
    var top = el("p", { "class": "paper-kind" }, p.type || "Paper");
    if ((p.status || "").toLowerCase() === "proposed") top.appendChild(el("span", { "class": "paper-proposed" }, "Proposed"));
    li.appendChild(top);
    var doi = normDoi(p.doi);
    var href = doi ? "https://doi.org/" + doi : safeUrl(p.link);
    var title = el("p", { "class": "paper-title" });
    if (href) title.appendChild(el("a", { href: href }, p.title)); else title.textContent = p.title;
    li.appendChild(title);
    var meta = [p.authors, p.affiliation, [p.session, shortDate(p.date)].filter(Boolean).join(", ")].filter(Boolean).join(" · ");
    if (meta) li.appendChild(el("p", { "class": "paper-meta" }, meta));
    if (p.relevance) li.appendChild(el("p", { "class": "paper-why" }, p.relevance));
    var foot = el("p", { "class": "paper-tags" });
    topicsOf(p).forEach(function (t) {
      var a = el("a", { "class": "tag", href: base + "conference-papers.html?topic=" + encodeURIComponent(t) }, t);
      if (filters) a.addEventListener("click", function (ev) { ev.preventDefault(); filters.set("topic", t); });
      foot.appendChild(a);
    });
    foot.appendChild(el("span", { "class": "paper-link" }, doi ? "doi:" + doi : (href ? "Link: conference programme" : "")));
    var slides = safeUrl(p.slides || "");
    if (slides) foot.appendChild(el("a", { "class": "paper-slides", href: (/^https?:/i.test(slides) ? "" : base) + slides, type: "application/pdf" }, "Slides (PDF)"));
    li.appendChild(foot);
    return li;
  }

  // Filter bar: event, type and topic selects plus free-text search. Starting values come from ?event=, ?type=, ?topic=, ?q=.
  function paperFilters(box, papers, events) {
    var form = el("form", { "class": "table-filters paper-filters", role: "search", "aria-label": "Filter the list" });
    function uniq(list) { return list.filter(function (v, i) { return v && list.indexOf(v) === i; }); }
    var opts = {
      event: events.map(function (e) { return e.name; }),
      type: uniq(papers.map(function (p) { return p.type; })).sort(function (a, b) { return TYPE_ORDER.indexOf(a) - TYPE_ORDER.indexOf(b); }),
      topic: uniq([].concat.apply([], papers.map(topicsOf))).sort()
    };
    var labels = { event: "Event", type: "Type", topic: "Topic" };
    var params = new URLSearchParams(location.search);
    var controls = {};
    Object.keys(opts).forEach(function (k) {
      var label = el("label", {}, labels[k]);
      var sel = el("select", { name: k });
      sel.appendChild(el("option", { value: "" }, "All"));
      opts[k].forEach(function (v) { sel.appendChild(el("option", { value: v }, v)); });
      if (params.get(k)) sel.value = params.get(k);
      label.appendChild(sel);
      form.appendChild(label);
      controls[k] = sel;
    });
    var sl = el("label", {}, "Search");
    var search = el("input", { type: "search", name: "q", placeholder: "Title, author, institution…" });
    search.value = params.get("q") || "";
    sl.appendChild(search);
    form.appendChild(sl);
    var count = el("p", { "class": "filter-count", role: "status" });
    form.appendChild(count);
    box.insertBefore(form, box.firstChild);
    var empty = el("p", { "class": "filter-empty", hidden: "" }, "No entries match these filters.");
    box.appendChild(empty);

    function apply() {
      var q = search.value.trim().toLowerCase(), shown = 0;
      Array.prototype.forEach.call(box.querySelectorAll(".paper-event"), function (sec) {
        var any = false;
        Array.prototype.forEach.call(sec.querySelectorAll(".paper"), function (li) {
          var p = li._paper;
          var ok = (!controls.event.value || p.event === controls.event.value) &&
            (!controls.type.value || p.type === controls.type.value) &&
            (!controls.topic.value || topicsOf(p).indexOf(controls.topic.value) !== -1) &&
            (!q || [p.title, p.authors, p.affiliation, p.relevance, p.session].join(" ").toLowerCase().indexOf(q) !== -1);
          li.hidden = !ok;
          if (ok) { shown++; any = true; }
        });
        sec.hidden = !any;
      });
      count.textContent = shown === papers.length ? papers.length + " entries" : "Showing " + shown + " of " + papers.length;
      empty.hidden = shown > 0;
    }
    form.addEventListener("input", apply);
    form.addEventListener("change", apply);
    form.addEventListener("submit", function (e) { e.preventDefault(); });
    return {
      apply: apply,
      set: function (k, v) { controls[k].value = v; apply(); form.scrollIntoView({ block: "start" }); }
    };
  }

  // Current year in footer
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
