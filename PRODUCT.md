# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary: current members of the EFMI Working Group on Education (WG EDU).** Teachers, programme directors and researchers in Biomedical and Health Informatics (BMHI) education from EFMI countries. The site is the group's home: they come to see the next meeting, find past event material (slides, photos), check the member list, follow publications and projects, and point colleagues to it.

Secondary audiences, served without outranking members:
- BMHI educators who are not (yet) members and may join: they use the IMIA recommendations, the mapping template, the programme database and the GenAI resources.
- Conference participants at MIE, STC and MEDINFO who hear about an open WG meeting.
- Students looking for BMHI programmes in Europe, EFMI and partner institutions.

## Product Purpose

Static website of the EFMI WG EDU (https://efmi-edu-wg.github.io/site/), the first working group EFMI established. It helps Europe educate the professionals who make digital health work: sharing what is taught and how, supporting the IMIA Recommendations on Education in BMHI, and keeping an open, up-to-date map of BMHI programmes.

Success means:
- **New members** join through the membership form (`participate.html`).
- **Event attendance** grows: more people at WG meetings held at MIE (spring), STC (autumn) and MEDINFO.

## Positioning

The official home of EFMI's oldest working group, whose members co-wrote the IMIA Recommendations on Education in BMHI (2000, 2010, 2023). It continues the former WG/AC2 database of European BMHI programmes as open data. No other site combines the EFMI mandate, the IMIA recommendations lineage and the European programme map.

## Operating Context

- Rhythm follows the conference calendar: an upcoming meeting is highlighted on the home page (`data-until` auto-hides it), then moves to the past-events timeline in `activities.html` with its own `events/aaaa.mm.dd Event name/` folder.
- Edited by non-programmers directly in GitHub's web editor, or locally; header, menu and footer are copied into every page. Changes must stay editable this way.
- Text awaiting chair approval is marked `TO VALIDATE` (hidden publicly, shown with `?validate`).
- Forms and databases live in Baserow (EU cloud), embedded with `<iframe>`: membership form, add-a-programme form, GenAI resource suggestion form; public programme grid and GenAI gallery not shared yet.
- Publications can be pulled from the Zenodo community `efmi-wg-edu`.

## Capabilities and Constraints

- Plain HTML, CSS and JavaScript; no framework, no build step, no dependencies. Hosted on GitHub Pages from `main` (work happens on `develop`).
- All colours live in `assets/css/tokens.css` (EFMI palette, light and dark mode); layout and components in `assets/css/main.css`; `assets/js/site.js` handles the mobile menu and theme toggle.
- **Privacy:** no cookies, no analytics, no third-party scripts. Anything that sends visitor data to a third party (including externally hosted fonts) must first be added to `privacy.html`.
- Language: English. Content CC BY 4.0, code MIT; the EFMI logo is excluded from the open licence.
- Members are listed only with their consent; event photos and slides only with the author's permission and credit.
- The IMIA knowledge/skill tables are not openly licensed: refer to items by number, never reproduce them.
- Not in the menu yet: `course-assistant.html` (coming soon, Mistral-based), `open-data.html`, and the database part of `programmes.html`.
- Open: maintainer name and contact e-mail.

## Brand Commitments

- **Follow the EFMI palette and logo** as defined today in `assets/css/tokens.css` and `assets/img/`.
- **Sober institutional tone:** academic and credible, no marketing voice. Claims stay factual and checkable.
- Assets: `assets/img/efmi-wg-logo.png`, `efmi-banner.webp`, `favicon.svg`, `efmi-ac2-accredited.png` (only for EFMI-accredited programmes), `imia-accredited.jpg`; originals in `logos/`.

## Evidence on Hand

- Real history and chairs since 1985 (`about.html`, `members.html`).
- Eight past event pages with photos and documents (`events/`, 2022–2025).
- Publications with DOIs (`publications.html`), European projects with member roles (`projects.html`), media coverage (`media.html`).
- IMIA mapping template download (`assets/templates/imia-mapping-template.xlsx` + `.csv`).
- Accredited programmes table (`accredited.html`) and national societies with education groups (`national.html`).
- No testimonials, membership counts or attendance figures exist; do not invent them.

## Product Principles

1. **Members first.** The next meeting and the group's own work are the fastest things to find.
2. **Every page leads somewhere useful:** joining the WG or coming to the next meeting is never more than one step away.
3. **Facts over claims.** Only verified content is public; unconfirmed items stay marked `TO VALIDATE`.
4. **Editable by anyone in the WG.** No change may require a build step or programming knowledge.
5. **Open and private by default.** Open licences, open data, and no tracking of visitors.

## Accessibility & Inclusion

WCAG 2.1 AA (see `accessibility.html`): alt text on every image, a `title` on every iframe, headings in order, meaningful link text, text contrast at least 4.5:1. Light and dark mode both supported.
