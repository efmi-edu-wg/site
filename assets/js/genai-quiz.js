/* GenAI Lab – questionnaire engine.
   Runs entirely in the browser. Answers are kept in memory only: nothing is
   stored, sent or logged. Reloading the page erases everything.
   Content lives in genai-quiz-data.js. */
(function () {
  "use strict";
  var data = window.GENAI_QUIZ;
  var app = document.getElementById("quiz-app");
  if (!data || !app) return;

  var scenarios = data.scenarios;
  var answers = [];   // in memory only
  var index = 0;

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === "text") node.textContent = attrs[k];
      else if (k === "class") node.className = attrs[k];
      else node.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { if (c) node.appendChild(c); });
    return node;
  }

  function cssFor(verdict) {
    return verdict === "ok" ? "good" : verdict === "caution" ? "warn" : "bad";
  }

  function alternativesList(items) {
    return el("ul", { class: "alt-list" }, items.map(function (alt) {
      var def = data.alternatives[alt.type] || { label: alt.type };
      return el("li", {}, [
        el("span", { class: "alt-badge", text: def.label }),
        document.createTextNode(alt.text)
      ]);
    }));
  }

  function progress() {
    var pct = Math.round((index / scenarios.length) * 100);
    var bar = el("div", { class: "quiz-progress", role: "progressbar", "aria-valuemin": "0",
      "aria-valuemax": String(scenarios.length), "aria-valuenow": String(index),
      "aria-label": "Questionnaire progress" }, [el("span", { style: "width:" + pct + "%" })]);
    return bar;
  }

  function renderIntro() {
    app.innerHTML = "";
    app.appendChild(el("p", { text: scenarios.length + " short situations from everyday teaching. For each one, decide whether you would do it. You will get an explanation and safer alternatives." }));
    var start = el("button", { class: "btn", type: "button", text: "Start the questionnaire" });
    start.addEventListener("click", function () { index = 0; answers = []; renderScenario(); });
    app.appendChild(start);
  }

  function renderScenario() {
    var s = scenarios[index];
    app.innerHTML = "";
    app.appendChild(el("p", { class: "meta", text: "Situation " + (index + 1) + " of " + scenarios.length + " · " + s.topic }));
    app.appendChild(progress());

    var form = el("form", { novalidate: "" });
    var fs = el("fieldset", {}, [
      el("legend", { text: "Would you do this?" }),
      el("p", { class: "scenario", text: s.text })
    ]);
    Object.keys(data.verdicts).forEach(function (key) {
      var id = "q-" + s.id + "-" + key;
      var input = el("input", { type: "radio", name: "verdict", id: id, value: key });
      fs.appendChild(el("label", { class: "choice", for: id }, [input, el("span", { text: data.verdicts[key] })]));
    });
    form.appendChild(fs);

    var status = el("p", { class: "visually-hidden", "aria-live": "polite" });
    var submit = el("button", { class: "btn", type: "submit", text: "Check my answer" });
    form.appendChild(el("div", { class: "btn-row" }, [submit]));
    form.appendChild(status);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var chosen = form.querySelector("input[name=verdict]:checked");
      if (!chosen) { status.textContent = "Please choose an option first."; status.className = ""; return; }
      answers[index] = chosen.value;
      renderFeedback(form, s, chosen.value);
    });

    app.appendChild(form);
    fs.querySelector("input").focus();
  }

  function renderFeedback(form, s, chosen) {
    form.querySelectorAll("input").forEach(function (i) { i.disabled = true; });
    form.querySelector(".btn-row").remove();

    var match = chosen === s.answer;
    var box = el("div", { class: "feedback " + cssFor(s.answer), tabindex: "-1" }, [
      el("p", {}, [
        el("span", { class: "verdict " + cssFor(s.answer), text: "Recommended: " + data.verdicts[s.answer] + ". " }),
        document.createTextNode(match ? "You agreed." : "You chose “" + data.verdicts[chosen] + "”.")
      ]),
      el("p", { text: s.why }),
      el("p", {}, [el("strong", { text: "What to do instead" })]),
      alternativesList(s.instead)
    ]);
    form.appendChild(box);

    var last = index === scenarios.length - 1;
    var next = el("button", { class: "btn", type: "button", text: last ? "See my summary" : "Next situation" });
    next.addEventListener("click", function () {
      index++;
      if (last) renderSummary(); else renderScenario();
    });
    form.appendChild(el("div", { class: "btn-row" }, [next]));
    box.focus();
  }

  function renderSummary() {
    app.innerHTML = "";
    var agreed = answers.filter(function (a, i) { return a === scenarios[i].answer; }).length;
    var heading = el("h3", { tabindex: "-1", text: "Your summary" });
    app.appendChild(heading);
    app.appendChild(el("p", { text: "You agreed with the recommendation in " + agreed + " of " + scenarios.length + " situations. This is not a test score: use it to start a conversation with colleagues." }));

    var wrap = el("div", { class: "table-wrap" });
    var table = el("table", {}, [
      el("caption", { class: "visually-hidden", text: "Summary of your answers" }),
      el("thead", {}, [el("tr", {}, [
        el("th", { scope: "col", text: "Situation" }),
        el("th", { scope: "col", text: "Your answer" }),
        el("th", { scope: "col", text: "Recommended" })
      ])])
    ]);
    var tbody = el("tbody");
    scenarios.forEach(function (s, i) {
      tbody.appendChild(el("tr", {}, [
        el("td", { text: s.text }),
        el("td", { text: data.verdicts[answers[i]] || "–" }),
        el("td", {}, [el("span", { class: "verdict " + cssFor(s.answer), text: data.verdicts[s.answer] })])
      ]));
    });
    table.appendChild(tbody);
    wrap.appendChild(table);
    app.appendChild(wrap);

    var legend = el("div", { class: "card", style: "margin-top:1.5rem" }, [el("h4", { style: "margin-top:0", text: "The three safer alternatives" })]);
    ["local", "institutional", "european"].forEach(function (k) {
      legend.appendChild(el("p", {}, [el("strong", { text: data.alternatives[k].label + ": " }), document.createTextNode(data.alternatives[k].text)]));
    });
    app.appendChild(legend);

    var print = el("button", { class: "btn btn-secondary", type: "button", text: "Print or save as PDF" });
    print.addEventListener("click", function () { window.print(); });
    var again = el("button", { class: "btn", type: "button", text: "Start again" });
    again.addEventListener("click", renderIntro);
    app.appendChild(el("div", { class: "btn-row no-print" }, [print, again]));
    heading.focus();
  }

  renderIntro();
})();
