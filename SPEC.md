# SPEC.md — Purely (Clean Pages for Print & PDF)

Short-form spec pointer. The full expanded spec (problem/solution, competitive research,
architecture, privacy deep-dive, roadmap, business Q&A) lives in
[docs/מסמך_אפיון.md](docs/מסמך_אפיון.md) (Hebrew) — this file is the quick-reference summary
required by the project standard, kept in sync with it.

## What it does

A Manifest V3 Chrome extension that strips ads, navigation bars, pop-ups, cookie banners and
other clutter from any web page, then prepares it for printing or a clean PDF export — with
optional logo/header/footer branding on the exported output. Two modes: **Declutter only**
(keeps the page's original layout) and **Reader mode** (rebuilds a fully clean reading view,
scored locally by `src/shared/readability.js` — no cloud/AI service).

## Who it's for

Anyone who wants to print or export a web page (an article, a receipt, a form, documentation)
without ads, navigation chrome, or pop-ups cluttering the output.

## Architecture

```
manifest.json          MV3 entry point
src/
  background.js         service worker — menu, shortcuts, script injection, auto-clean registration
  content/               content scripts (declutter/reader logic, auto-clean on matched domains)
  popup/                 toolbar popup UI
  options/               full settings page
  welcome/                first-run onboarding page
  help/                   FAQ / shortcuts reference
  shared/                 i18n engine, default settings + selector catalog, local Readability engine
assets/icons/            action + Chrome Web Store icons (16/32/48/128)
site/                   marketing landing page (self-contained, open directly in a browser)
store/                  Chrome Web Store listing text + screenshot/promo-tile requirements
tests/                  browser-run automated test suite (see tests/test-suite.html)
```

## Data & privacy

- Runs entirely locally in the browser. No external servers, no analytics, no telemetry.
- Settings (categories, custom selectors, auto-clean domain list, branding, language, theme,
  per-site mode) are stored only in `chrome.storage.local` on the user's machine.
- `activeTab` + `scripting` cover on-demand cleaning; `optional_host_permissions: <all_urls>`
  is requested (not granted by default) only if the user opts into the auto-clean-on-domain
  feature, which needs standing access to specific sites the user lists.
- See [PRIVACY.md](PRIVACY.md) for the full disclosure required by the Chrome Web Store's
  Single Purpose / user data policy.

## Known, deliberate deviation from the shared tool standard

The project standard (`STANDARDS.md` §4) calls for Chrome's built-in `_locales/` +
`chrome.i18n` system instead of a custom in-app switcher. Purely intentionally keeps its
existing custom engine (`src/shared/i18n.js` + `data-i18n` attributes) instead, because
`chrome.i18n` is fixed to the browser's own locale and cannot be changed by the user at
runtime — Purely's requirement (instant EN↔HE switching from inside the popup/settings,
independent of the browser's language) is not achievable with the built-in system. This is
recorded here rather than silently diverging from the standard; revisiting it would mean
losing runtime language switching, which is a core requirement from the original brief.

## v1.5.0 additions (2026-09-15) — competitor research + product improvements

Brief competitor scan (Print Friendly & PDF, Mercury Reader, Firefox Reader View, Instapaper
clipper) against Purely's actual purpose (local, no-AI content extraction for clean print/PDF)
turned up three gaps worth closing without breaking the local/no-cloud model:

1. **Reader-mode typography controls.** Print Friendly & PDF and Reader View both let the
   reader tune text size before printing/reading; Purely's Reader mode had a fixed 17px/1.7
   line-height. Added a "Reading size" panel in the popup (visible only in Reader mode) with
   +/- steppers for font size (14-22px) and line spacing (1.3-2.1), applied live via CSS custom
   properties (`--purely-reader-font-size`/`--purely-reader-line-height` in `content.css`) and
   persisted in `readerTypography` settings.
2. **"Pick element to remove" - click-to-exclude tool.** Print Friendly & PDF's biggest
   differentiator over pure automatic extraction is letting the user click directly on anything
   the automatic detection missed. Purely previously required hand-writing a CSS selector in
   Settings. Added a popup button that puts the page into a hover-highlight picker mode
   (`src/content/content.js`); clicking an element hides it immediately and the tool generates
   a selector (`buildSelectorForElement` in `src/shared/selectors.js`) automatically.
3. **Local automation: per-site memory for picks.** Rather than a global list, picked selectors
   are saved under `perSiteExtraSelectors[hostname]` in `chrome.storage.local` and applied
   automatically on every future clean of that site (including auto-clean) - a lightweight,
   fully local equivalent of "remembering per-site cleanup aggressiveness", listed and
   removable in Settings → "Per-site removals" (new options.html section).

Deliberately **not** added: a saved-pages/reading-library feature (real gap vs. Instapaper, but
a bigger scope change - storing/indexing full page snapshots - than fits a single incremental
pass); a combined "clean + print" one-click action (already existed as the popup's "Export
clean PDF" button and the `Ctrl+Shift+P` shortcut, so there was nothing to add there).

Also fixed during the pass (performance sweep, not a new feature): `src/shared/readability.js`'s
`scoreDocument()` ran the O(subtree) `getLinkDensity()` (a `querySelectorAll('a')` per
candidate) for every scored element, including ones whose combined score could mathematically
never win (`baseScore <= 0` implies `finalScore <= 0`, which never beats the 0-initialized
`bestScore`). Skipping the link-density check for those candidates is a pure, behavior-preserving
perf win, meaningful on complex pages (forums, long Wikipedia-style articles) with many
low-scoring candidate elements.

All of the above stays 100% local - no new permissions, no network calls, nothing added to
`PRIVACY.md`'s data flow.

## Roadmap

See the "roadmap" section of [docs/מסמך_אפיון.md](docs/מסמך_אפיון.md) for the fuller discussion;
short list: Chrome Web Store listing + screenshots, additional locales beyond EN/HE, a
saved-pages local library (see "deliberately not added" above), export/import for custom
selectors and per-site picks.
