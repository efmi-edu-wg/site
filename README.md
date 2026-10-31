# EFMI WG EDU website

Website of the **EFMI Working Group on Education in Biomedical and Health Informatics**
(<https://efmi.org/workinggroups/edu-education/>).

- **Live site:** <https://efmi-edu-wg.github.io/site/>
- **Stack:** plain HTML, CSS and JavaScript. No framework, no build step, no dependencies.
- **Hosting:** GitHub Pages, published automatically from the `main` branch.
- **Databases and forms:** Baserow (EU cloud), embedded with `<iframe>`.
- **Status:** public. Text that still needs checking by the WG chairs is marked with
  <span>`TO VALIDATE`</span>. These labels are hidden on the public site; add `?validate` to any page URL
  (for example `index.html?validate`) to show them as yellow labels.
- **Not in the menu yet:** `course-assistant.html`, `open-data.html` and the database part of `programmes.html`
  (its form is still linked from How to participate and Accredited programmes). Add them back to the menu on every page when ready.

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
git clone https://github.com/efmi-edu-wg/site.git
cd site
python3 -m http.server 8000      # then open http://localhost:8000
# edit files, then:
git add -A && git commit -m "Describe your change" && git push
```

---

## 2. Where things are

| Menu | Page file | What it contains |
|---|---|---|
| Home | `index.html` | **Highlight** (next activity / news), mission, **upcoming events**, "Join the WG" button |
| About | `about.html` | About the WG and history |
| | `members.html` | **Members** (chairs & board incl. honorary chair, national representatives, members, former members) with LinkedIn/ORCID |
| | `education-groups.html` | **Education groups worldwide**: IMIA WG05 and the education groups of the IMIA regions (AMIA, HELINA…) |
| | `participate.html` | How to participate + Baserow membership form |
| Guidelines | `guidelines.html` | IMIA recommendations and EFMI guidance |
| | | IMIA **mapping template** download: `assets/templates/imia-mapping-template.xlsx` + `.csv` |
| | `frameworks.html` | Related competency frameworks |
| | `course-assistant.html` | "Coming soon" course design assistant (Mistral) |
| Programmes | `programmes.html` | Programme database (Baserow) + "add a programme" form |
| | `accredited.html` | EFMI/IMIA accredited programmes, with the EFMI AC2 mark |
| | `national.html` | EFMI national societies, their **education WGs** and national course lists |
| | `open-data.html` | Open data, Zenodo, FAIR |
| Activities | `activities.html` | **Events** timeline (links to `events/…` pages) |
| | `publications.html` | Publications (with schema.org metadata) |
| | `projects.html` | European projects |
| | `open-knowledge.html` | EU open science infrastructures, OER, funding, policy |
| GenAI Lab | `educational-resources.html` | Teaching materials shared by educators + Baserow submission form |
| | `genai-resources.html` | Resources, safer alternatives + Baserow suggestion form |
| | `genai-lab.html` | Redirect to `genai-resources.html` (keeps old links working) |
| Footer | `privacy.html`, `accessibility.html` | Privacy notice, accessibility statement |
| – | `404.html` | "Page not found" (uses absolute `/site/` paths) |
| – | `events/aaaa.mm.dd event/` | **One folder per event**: `index.html`, `photos/`, `documents/` |
| `assets/css/tokens.css` | **All colours** (EFMI palette, light and dark mode) |
| `assets/css/main.css` | Layout and components |
| `assets/js/site.js` | Mobile menu and light/dark toggle |
| `assets/img/` | Logos and favicon |

### Header, menu and footer

The header (menu with sub-menus) and footer are **copied into every HTML page**, between
`<!-- ===== HEADER ... -->` and `<!-- ===== FOOTER ... -->`. Event pages use the same menu with `../../` in front of each link.
To add a page to a sub-menu: create the page (copy a page of the same section), then add one
`<li><a href="new-page.html">Title</a></li>` to the right `<ul class="submenu">` in **all** pages, and add the same link
to the tabs (`<ul class="subnav">`) of the pages in that section. On your computer, use "Find and replace in files".
On phones the sub-menus are shown expanded inside the "Menu" button.
The header also has two icon links, **WG EDU on efmi.org** and **WG EDU on LinkedIn** (`<div class="header-links">`), and the footer has a
"Follow WG EDU" column with the same links. If an address changes, use "Find and replace in files" for
`https://efmi.org/workinggroups/edu-education/` or `https://www.linkedin.com/showcase/edu-efmi-wg`.

---

## 3. Common tasks

### Change the highlight on the home page
The box right under the title of `index.html` shows the next activity or a news item. Find `<!-- HIGHLIGHTS`
and edit the `<article class="highlight">` block: label (e.g. "Now · EFMI STC 2026" or "News"), title, date, text and buttons.
Copy the block to show more than one. Set `data-until="YYYY-MM-DD"` to the last day it should appear: after that
day it hides itself, and when no highlight is left the whole box disappears. Remove `data-until` to keep it until you change it.

### Add an upcoming event
In `index.html`, find `<!-- To add an event -->`, copy one `<article class="card">…</article>`
block and edit the date, title and text. Set `data-until="YYYY-MM-DD"` to the last day of the event: after that
day the card hides itself, and when no card is left the page shows "No WG meeting is scheduled yet". An event that
is already in the highlight box does not need a card as well. After the event, move it to `activities.html`
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
In `members.html`, each member has `<span class="profile-links">` with LinkedIn and ORCID links. ORCID iDs were matched by
name and affiliation; ask each member to confirm theirs.

### Add a national society's education group
In `national.html`, find the country row and replace `<span class="validate">TO VALIDATE</span>` with a link.

### Add an accredited programme
In `accredited.html`, copy a `<tr>` of the table. Keep the small AC2 mark only for EFMI-accredited programmes.

### Update the IMIA mapping template
The spreadsheet in `assets/templates/` is a download linked from `guidelines.html#mapping-template`. Edit it in Excel or
LibreOffice and keep the sheet names (`Instructions`, `Programme`, `Quick check`, `Coverage`, `Expert mapping`; `Lists` is hidden and feeds the
drop-downs). The plain-language domain descriptions are in row 5 of `Quick check` (WG EDU text, to be approved by the WG). Raise the version number on the Instructions sheet and on the Guidelines page, and update the CSV (headers
and example row of `Quick check`). Do not paste the IMIA knowledge/skill tables into it: the paper is not openly licensed,
so the template refers to items by number.

### Add a publication
In `publications.html`, add a `<li>` to the right year inside `<ul class="pubs">`. Always include the DOI link:
```html
<li>Author A, Author B. Title. <em>Journal.</em> 2026;1:1-2. <a class="doi" href="https://doi.org/10.xxxx/xxxx">doi:10.xxxx/xxxx</a></li>
```
Optional: add the same publication to the `application/ld+json` block at the end of the page (metadata for search engines).

**Or via Zenodo:** publications (resource type *Publication*) in the Zenodo community `efmi-wg-edu` are added to the
list in the browser. If the DOI is already on the page, the entry only gets an "Open access copy (Zenodo)" link.
For an accepted manuscript, enter the publisher's DOI in Zenodo as a related identifier ("Is identical to" or
"Is version of") so it matches. The community slug is set in `data-zenodo-community` on `publications.html`.

### Add or change a member
In `members.html`, copy a `<li>` inside the right `<ul class="people">` list. **Ask the person for consent before listing them.**

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

Database **EFMI_EDU_WG** on baserow.io (workspace of Ricardo Correia). Current state:

| Page | What | Baserow table → view | State |
|---|---|---|---|
| `participate.html` | Membership form | Members → *Join form* | **embedded** |
| `programmes.html#add` | Add a programme | Programmes → *Submit form* | **embedded** |
| `genai-resources.html#suggest` | Suggest a resource | GenAI Resources → *Suggest form* | **embedded** |
| `educational-resources.html#share` | Share an educational resource | Educational Resources → *Submit form* (review in *Review queue*) | **embedded** |
| `programmes.html#database` | Programme database | Programmes → *Public* (grid) | placeholder, view not shared yet |
| `educational-resources.html#shared` | Approved teaching materials | Educational Resources | static cards, added by hand after approval |
| `genai-resources.html#resources` | Approved resources | GenAI Resources → *Public* (gallery) | static cards for now, view not shared yet |

The form link (`https://baserow.io/form/…`) stays the same when you edit fields in Baserow, so the site
does not need to change. If you rename a field that the privacy notice mentions, update `privacy.html`.

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
