# EFMI WG EDU website

Website of the **EFMI Working Group on Education in Biomedical and Health Informatics**
(<https://efmi.org/workinggroups/edu-education/>).

- **Live site:** <https://ricardojccorreia.github.io/efmi-wg-edu/>
- **Stack:** plain HTML, CSS and JavaScript. No framework, no build step, no dependencies.
- **Hosting:** GitHub Pages, published automatically from the `main` branch.
- **Databases and forms:** Baserow (EU cloud), embedded with `<iframe>`.
- **Status:** first draft for validation by the WG chairs. Text that needs checking is marked with
  <span>`TO VALIDATE`</span> (yellow label on the page).

---

## 1. How to edit the site (no programming needed)

### Option A – in the browser (simplest)

1. Open the repository on GitHub and click the file you want to change (for example `index.html`).
2. Click the pencil icon (**Edit this file**).
3. Change the text between the tags. Example: in `<p>Old text</p>` change only `Old text`.
4. Click **Commit changes…**, write a short note (for example "Add MIE 2027 event") and confirm.
5. After about one minute the change is live. Check the **Actions** tab if it does not appear.

### Option B – on your computer

```bash
git clone https://github.com/ricardojccorreia/efmi-wg-edu.git
cd efmi-wg-edu
python3 -m http.server 8000      # then open http://localhost:8000
# edit files, then:
git add -A && git commit -m "Describe your change" && git push
```

---

## 2. Where things are

| File | What it contains |
|---|---|
| `index.html` | Home: mission, **upcoming events**, "Join the WG" button |
| `about.html` | History, **Members** (chairs & board incl. honorary chair, national representatives, members, former members) with LinkedIn/ORCID links, How to participate |
| `guidelines.html` | IMIA recommendations, EFMI guidance, frameworks, "Coming soon" course design assistant |
| `programmes.html` | Programme database (Baserow), certified courses, national lists, open data |
| `activities.html` | Past events, **publications**, European projects |
| `genai-lab.html` | GenAI questionnaire, resources, suggestion form |
| `open-knowledge.html` | EU open science infrastructures, OER, funding, policy |
| `privacy.html` | GDPR privacy notice |
| `accessibility.html` | Accessibility statement (WCAG 2.1 AA) |
| `404.html` | "Page not found" page |
| `events/aaaa.mm.dd event/` | **One folder per event**: `index.html` (event page), `photos/`, `documents/` |
| `assets/css/tokens.css` | **All colours** (EFMI palette, light and dark mode) |
| `assets/css/main.css` | Layout and components |
| `assets/js/site.js` | Mobile menu and light/dark toggle |
| `assets/js/genai-quiz-data.js` | **Questionnaire scenarios** (edit text here) |
| `assets/js/genai-quiz.js` | Questionnaire logic (normally no need to touch) |
| `assets/img/` | Logos and favicon |

### Header and footer

The header (menu) and footer are **copied into every HTML page**, between the comments
`<!-- ===== HEADER ... -->` and `<!-- ===== FOOTER ... -->`. If you change the menu or footer,
make the same change in **all** `.html` files. On your computer, use your editor's
"Find and replace in files".

---

## 3. Common tasks

### Add an upcoming event
In `index.html`, find `<!-- To add an event -->`, copy one `<article class="card">…</article>`
block and edit the date, title and text. After the event, move it to `activities.html`
(section `past-events`) as a new `<li>` at the top of the timeline.

### Add a past event (folder + page)
1. Create a folder in `events/` named `aaaa.mm.dd Event name` (e.g. `2026.10.29 EFMI STC 2026 Athens`).
   Use the date of the WG session; avoid accents in the folder name.
2. Copy `index.html` from an existing event folder into it, plus empty `photos/` and `documents/` folders.
3. Edit the title, date, place and text. Add photos with a `<figure>` block and presentations as `<li>` links
   (PDF preferred). Only publish photos and slides with the author's permission; write the credit in the caption.
4. In `activities.html`, add a line at the top of the past-events timeline linking to the folder
   (spaces become `%20`, e.g. `events/2026.10.29%20EFMI%20STC%202026%20Athens/`).

### Add profile links to a member
In `about.html`, each member has `<span class="profile-links">` with LinkedIn and ORCID links. ORCID iDs were matched by
name and affiliation; ask each member to confirm theirs.

### Add a publication
In `activities.html`, add a `<li>` to the right year inside `<ul class="pubs">`. Always include the DOI link:
```html
<li>Author A, Author B. Title. <em>Journal.</em> 2026;1:1-2. <a class="doi" href="https://doi.org/10.xxxx/xxxx">doi:10.xxxx/xxxx</a></li>
```
Optional: add the same publication to the `application/ld+json` block at the end of the page (metadata for search engines).

### Add or change a member
In `about.html`, copy a `<li>` inside the right `<ul class="people">` list. **Ask the person for consent before listing them.**

### Edit the GenAI questionnaire
Open `assets/js/genai-quiz-data.js`. Each scenario is a block `{ id, topic, text, answer, why, instead }`.
`answer` must be `"ok"`, `"caution"` or `"avoid"`. Alternatives use `type` `"local"`, `"institutional"`,
`"european"` or `"practice"`. Keep the commas between blocks.

### Remove a "TO VALIDATE" label
Once a fact is confirmed, delete `<span class="validate">TO VALIDATE…</span>`.
To list what is still open: search the repository for `TO VALIDATE`.

### Change a colour
Only in `assets/css/tokens.css`. Check text contrast is at least 4.5:1 with
<https://webaim.org/resources/contrastchecker/>.

---

## 4. Connecting Baserow

Each place where Baserow goes has an HTML comment starting with `<!-- BASEROW:` and a dashed
placeholder box. To connect it:

1. In Baserow, create the table and either a **public view** (Grid or Gallery → *Share view*) or a **form view** (*Share form*).
2. Copy the public link (`https://baserow.io/public/grid/…` or `https://baserow.io/form/…`).
3. Replace the whole `<div class="placeholder">…</div>` with:
   ```html
   <iframe class="embed-frame" title="Describe the content here" src="PASTE-LINK-HERE" loading="lazy"></iframe>
   ```
   The `title` is required for accessibility.
4. Update `privacy.html` (section 4) if the data collected changes.

| Page | Placeholder | Baserow object |
|---|---|---|
| `about.html#participate` | Membership request form | Form |
| `programmes.html#database` | Programme database | Public grid view (only approved rows) |
| `programmes.html#add` | Add a programme | Form (new rows hidden until approved) |
| `genai-lab.html#resources` | Approved resources | Public gallery view (optional) |
| `genai-lab.html#suggest` | Suggest a resource | Form |

Tip: use a "status" field (`submitted` / `approved`) and filter public views to `approved`, so nothing appears without human review.

---

## 5. Rules we keep

- **No cookies, no analytics, no external fonts or scripts.** Anything that sends visitor data to a third party must be added to `privacy.html` first.
- **Accessibility (WCAG 2.1 AA):** every image needs `alt`, every iframe needs `title`, headings in order (h1 → h2 → h3), links with meaningful text (not "click here").
- **Open by default:** content CC BY 4.0, code MIT (see `LICENSE`). The EFMI logo is excluded.
- **Language:** English.

## 6. Publishing settings (one-time, already done)

Repository **Settings → Pages → Build and deployment**: Source *Deploy from a branch*, Branch `main`, folder `/ (root)`.
The empty `.nojekyll` file tells GitHub to serve the files as they are.

## 7. Contacts

Website maintained by the WG EDU co-chair team at the University of Porto. <!-- TO VALIDATE: maintainer name and e-mail -->
