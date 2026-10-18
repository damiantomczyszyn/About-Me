# Damian Tomczyszyn — portfolio

Personal portfolio site: **https://damiantomczyszyn.github.io/About-Me/** (English: `?lang=en`).

Static HTML/CSS with a little vanilla JavaScript, served by GitHub Pages from `main`. No build step, no external CDNs, no cookies or analytics.

## Structure

| Path | What it is |
|---|---|
| `index.html` | The whole page, Polish and English side by side |
| `css/styles.css` | Design tokens (light/dark), layout, print styles |
| `js/main.js` | Progressive enhancement: language and theme toggles, mobile menu, copy e-mail |
| `fonts/` | Self-hosted Inter and JetBrains Mono (variable, latin + latin-ext) |
| `img/` | Portrait (WebP/JPEG, 320/480 px), favicon, Open Graph image |
| `docs/CV_Dark_Uniwersalne.html` | Source of the CV |
| `docs/Damian_Tomczyszyn_CV_Uniwersalne.pdf` | The CV linked from the site (keep this file name stable) |

## Editing content

Every piece of text exists twice, as a pair of elements with `lang="pl"` and `lang="en"`:

```html
<span lang="pl">Kontakt</span><span lang="en">Contact</span>
```

CSS shows only the pair matching `<html lang>`. Without JavaScript the page is Polish. Attributes that can't be paired (such as `aria-label` and `alt`) use `data-label-pl` / `data-label-en` and `data-alt-pl` / `data-alt-en`. The page title and description live in `data-title-*` / `data-description-*` on `<html>`.

In the skills section, `tag--pro` marks technologies used in the current job (per the CV). Leave it off everything else.

## Regenerating the CV PDF

Use a real browser print, not "Microsoft Print to PDF", which turns the text into images, so ATS systems can't read it and links stop working. With Playwright:

```js
await page.goto('file:///…/docs/CV_Dark_Uniwersalne.html', { waitUntil: 'networkidle' });
await page.pdf({ path: 'docs/Damian_Tomczyszyn_CV_Uniwersalne.pdf', format: 'A4', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
```

Or open the HTML in Chrome, choose Print → Save as PDF, set margins to None and turn on Background graphics.

## Local preview

```sh
python3 -m http.server 8000
# open http://localhost:8000/
```
