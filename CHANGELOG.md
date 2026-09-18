# Changelog - Purely

## [1.5.0] - 2026-09-15 — competitor-driven product improvements

Brief competitor research (Print Friendly & PDF, Mercury Reader, Firefox Reader View, Instapaper
clipper) against Purely's actual scope (local, no-AI content extraction for clean print/PDF) -
see `SPEC.md` for the full writeup. Everything below stays 100% local, no new permissions.

### Added
- **Reader-mode typography controls** - a "Reading size" panel in the popup (shown only in
  Reader mode) with +/- steppers for text size (14-22px) and line spacing (1.3-2.1), applied
  live to the page and remembered for next time (`readerTypography` setting).
- **"Pick element to remove" tool** - click-to-exclude picker for elements automatic detection
  misses: click the new popup button, then click any element on the page to hide it instantly.
  On-page hover highlight + instruction banner + confirmation toast, Esc to cancel.
- **Per-site memory for picked elements** - each pick is saved under that hostname
  (`perSiteExtraSelectors`) and re-applied automatically on every future clean/auto-clean of
  that site, without touching the global custom-selector list. Manage or remove any of them in
  Settings → "Per-site removals" (new section 7).
- New help FAQ entry explaining the picker tool.

### Changed
- Popup/options UI polish: card elevation + hover state, smoother quick-nav and dirty-indicator
  transitions, a `.purely-btn-outline` variant added to the popup (previously options-only) for
  the new "Pick element to remove" button. No color palette changes - the existing brand colors
  are untouched.

### Fixed
- **Performance:** `src/shared/readability.js`'s Reader-mode scoring engine ran an expensive
  `querySelectorAll('a')` link-density check on every scored candidate element, including ones
  whose score could mathematically never win. Skipped for those candidates - same result,
  meaningfully less work on complex/long pages.

### Implementation note
`src/options/options.js`'s Save button rebuilds the whole settings object from the visible form
fields (it already did this for `perSiteMode`, set only from the popup). The two new fields
(`perSiteExtraSelectors`, `readerTypography`) are not edited on the options page either, so they
are carried forward from `current` the same way, to avoid a new footgun where opening Settings
and clicking Save would silently wipe out picks/typography set from the popup.

## Standards compliance re-audit (2026-09-15) — landing page fixes, no extension code changes

Full re-sweep against `_AUDIT/STANDARDS.md` (the Chrome-extension reference standard, for which
Purely is the most mature tool in the portfolio). No functional changes to the extension itself
(`manifest.json`/`src/` untouched, `node --check` clean, `Purely-v1.4.0.zip` still valid and
current) — this pass only fixed the landing page (`site/index.html`), which is **not** part of
the shipped extension package.

- **`site/index.html` was English-only with no RTL** — violated §17.0 ("same language rule as the
  rest of the product... including full RTL"), even though the extension itself has had full
  EN/HE + RTL since v1.2.0. Added a language toggle (`EN / עברית`) plus a full Hebrew translation
  of every visible string, and confirmed the existing CSS (already written with logical properties
  like `inset-inline-start`/`padding-inline-end`) flips correctly under `dir="rtl"` with no layout
  rework needed. Verified visually in-browser in both directions.
- **`site/index.html` had gone stale after the 2026-09-14 restructure and the v1.3.0→v1.4.0 bump:**
  the version pill still read `v1.3.0`, and the install steps still told visitors to unzip a
  `build/` folder and select an `extension/` subfolder — both paths were removed in the prior
  restructure (the zip is `Purely-v1.4.0.zip` at the project root, containing `manifest.json`
  directly). Corrected both to match the current, real install flow and zip filename.
- Added an explicit link to [PRIVACY.md](PRIVACY.md) from the landing page's Privacy section, and
  a footer copyright line (`© 2026 Ofir Shudari`), per §5/§17.1.
- **Flagged, not fixed (needs the owner, cannot be done from source alone):** Chrome Web Store's
  privacy-policy requirement (`STANDARDS.md` §11.10) has been under active enforcement since
  **August 1, 2026** — today's date. `PRIVACY.md`'s content was re-verified as complete and
  accurate against the current `manifest.json` permissions, but it is still not published to a
  public URL, which is required for actual Web Store submission. `store/LISTING.md` updated to
  mark this as the overdue, submission-blocking item (was previously phrased as a routine
  pre-submission step). Store screenshots/promo tile also remain unproduced — both are documented
  manual-only follow-ups for the owner.
- Re-verified the deliberate `chrome.i18n`-vs-custom-i18n deviation documented in `SPEC.md`: still
  correct and necessary — Chrome's native `_locales`/`chrome.i18n` is fixed to the browser's
  install-time locale and cannot support Purely's runtime EN↔HE toggle, so the custom
  `src/shared/i18n.js` engine stays.

## Project structure & standards compliance (2026-09-14, same-day follow-up)

No functional changes - brought the project in line with the shared multi-tool project
standard (`_AUDIT/STANDARDS.md`):

- **Restructured to the canonical Chrome-extension layout:** `manifest.json` now sits at the
  project root (was nested under `extension/`); the former `extension/{background.js, content,
  popup, options, help, welcome, lib}` moved to `src/{background.js, content, popup, options,
  help, welcome, shared}`; icons moved from `extension/icons` to `assets/icons`; the landing page
  moved from `docs/landing-page.html` to `site/index.html`.
- Updated every internal reference to match: `manifest.json` (service worker/popup/options/icon
  paths), `background.js` (dynamic content-script/CSS injection paths, `getURL()` calls,
  notification icon), the four page HTML files' `<script>`/`<img>` tags, `welcome.js`/`popup.js`
  help-page links, `build/build.ps1`, `tests/test-suite.html`, and the Hebrew install guide
  (`docs/התקנה.md`) - all previously pointed at the removed `extension/` folder.
- Final package is now a single `Purely-v<version>.zip` in the **project root** (was
  `build/purely-extension-v<version>.zip`); `build.ps1` now stages only `manifest.json` + `src/`
  + `assets/` into the zip and removes any older `Purely-v*.zip` before building, so there is
  never more than one package file.
- Added `SPEC.md` (quick-reference spec, root), `PRIVACY.md` (EN+HE privacy policy, required by
  the Chrome Web Store's Single Purpose / user-data disclosure policy since Purely reads page
  content), and `store/LISTING.md` (Web Store listing copy + submission asset checklist).
- Deleted the stale duplicate `build/purely-extension-v1.4.0.zip` left over from the previous
  packaging location (pure, fully-reconstructable build output - rebuilt fresh at the new root
  location, nothing lost).
- All JS re-validated with `node --check` after the move; `manifest.json` re-validated as
  well-formed JSON with all path references resolving correctly.
- Documented one deliberate, known deviation from the shared standard in `SPEC.md`: Purely
  keeps its custom in-app i18n engine (`src/shared/i18n.js`) instead of Chrome's built-in
  `_locales/`/`chrome.i18n` system, because the built-in system cannot be switched by the user
  at runtime (it's fixed to the browser's own locale) - runtime EN↔HE switching is a core
  requirement from the original brief that the built-in system cannot satisfy.

## v1.4.0 (2026-09-14) - UI/UX overhaul, theme system, per-site mode, performance

**Appearance & theming**
- New Appearance section in Settings: choose Light, Dark, or Follow system — applied instantly without saving, persisted across all extension pages (popup, settings, welcome, help)
- Three-state theme CSS: explicit `data-theme` attribute wins over OS preference in both directions; fixed the old two-state bug where an explicit Light choice could be overridden by a dark OS

**Per-site mode memory**
- New "Remember the mode I choose, per site" toggle in Settings → Mode
- When enabled, switching between Declutter and Reader from the popup remembers the choice per domain — all other sites keep the global default
- Saving settings never wipes the per-site map (preserves it across saves)

**Performance**
- `declutter()` now runs a single `querySelectorAll(combinedSelector)` instead of one query per selector (60-80+ → 1 DOM query)
- Invalid CSS selectors are filtered before combining so a bad selector never blocks the whole clean operation
- Content script fast path: if the script is already loaded in the tab, re-inject is skipped (2nd-click speed improvement)
- Parallel CSS + JS injection via `Promise.all`

**Language & i18n**
- Added 7 new i18n keys for the Appearance section (EN + HE), dictionary now fully balanced (148 keys each)
- Language choice persists immediately without needing to save settings

**Security audit (v1.4.0)**
- No `eval()` or `new Function()` anywhere in the codebase
- `innerHTML` only used to clear lists (`= ''`) or for a single allowlisted i18n key sourced from the hardcoded dictionary — never from user input
- All domain and CSS selector inputs validated before use
- All storage is local (`chrome.storage.local`); no external network calls

**Settings robustness**
- `mergeSettings()` field-by-field merge prevents new settings fields from disappearing after an upgrade
- `collectForm()` now preserves the `perSiteMode` map when saving (was silently wiped before)

## Documentation (2026-09-13)

No code changes - this is a documentation and project-organization pass on top of v1.3.0:

- Added a `docs/` folder holding three new documents: an **expanded spec** (problem, solution,
  value proposition, competitive research, architecture, privacy deep-dive, roadmap, business
  Q&A), a standalone **installation guide**, and a self-contained **marketing landing page**.
- `README.md` now opens with a documentation map linking to all of the above, so it works as the
  single entry point into the project instead of just an install/usage summary.

## v1.3.0 (2026-09-06) - Smarter local Reader mode, security hardening, data robustness

**Smarter Reader mode - entirely local, no AI/cloud service**
- Replaced the old "count paragraphs" heuristic with a proper content-scoring engine
  (`lib/readability.js`), in the spirit of Mozilla's Readability.js: it propagates scores from
  every paragraph/blockquote/table-cell up to its parent and grandparent, applies a bonus/penalty
  based on common positive ("article", "content", "post"...) and negative ("sidebar", "comment",
  "widget"...) class/id naming patterns, and penalizes link-heavy sections - so it reliably
  prefers the real article body over navigation, sidebars and comment sections even on pages
  without a semantic `<article>`/`<main>` tag.
- Reader mode now also pulls a cleaner title from `og:title` when present, and shows a byline
  and published date under the title when the page exposes them (`.byline`, `[rel="author"]`,
  `<time datetime>`, or the equivalent meta tags).
- This is a **local heuristic algorithm, not a hosted AI/LLM model** - it runs entirely inside
  the browser and never sends the page anywhere. Documented explicitly in a new Help FAQ entry
  and in the settings page, since "smarter" could otherwise be misread as a cloud AI feature,
  which would conflict with Purely's core no-external-servers design.

**Security hardening**
- Removed every remaining `innerHTML` assignment of dynamic content in the extension:
  - Reader mode's save/restore of the original page no longer serializes the body to an HTML
    string and reparses it; it now clones and restores real DOM nodes instead.
  - The popup's "Cleaned" status badge is now built with `createElement`/`textContent` instead
    of a template-literal `innerHTML` assignment.
  - `lib/i18n.js`'s HTML-rendering path (`data-i18n-html`) is now allowlisted to the one
    translation key that legitimately needs it, and only ever with static, translator-authored
    markup - so a future translation string can never accidentally become an XSS sink.
- Hardened the auto-clean domain input: entries are now validated against a real hostname
  pattern before being accepted, so a stray character (e.g. a leftover `*`) is rejected with a
  clear error instead of silently failing to register later on.

**Data robustness**
- Settings loaded from storage are now merged field-by-field for the nested `categories` and
  `branding` objects (`PURELY_DEFAULTS.mergeSettings`), instead of replacing them wholesale. A
  user upgrading from an older version whose saved settings predate a newer category or branding
  field now gets that field's current default instead of it silently disappearing.

**Tests**
- 5 new automated tests (18 total): the scoring engine correctly preferring real content over a
  link-heavy sidebar, `og:title` extraction, byline/date extraction, domain-format validation,
  and the new settings deep-merge behavior.

**Housekeeping**
- Ran a full correctness pass: JS syntax-checked every file, verified every path referenced by
  `manifest.json` and every HTML file's `src`/`href` actually resolves, confirmed the English and
  Hebrew dictionaries in `lib/i18n.js` have identical key sets, and removed 7 dictionary keys
  (`common.*`, `welcome.updated*`, `welcome.viewChangelog`) that were defined but never actually
  referenced anywhere in the code.

**Installer removed**
- v1.2.0 added a standalone WPF "Install Purely.exe" desktop app to make installation friendlier.
  On reflection this didn't make sense for a Chrome extension - Chrome only ever installs an
  extension through its own "Developer mode" → "Load unpacked" flow, so a separate installer
  added a maintenance burden (a whole second app, a build toolchain) without actually skipping
  any of the required Chrome steps. Removed `build/installer-src/`, `build/build-installer-exe.ps1`
  and the `purely-installer-*.zip` package; `build/build.ps1` (a plain zip of `extension/`) plus
  "Load unpacked" is the one supported way to install Purely again.

## v1.2.0 (2026-09-05) - Rebrand, bilingual UI, Help, easy installer

**Rebrand**
- Renamed the product from "נקי" to **Purely**, with an all-English default UI and a proper
  English name/description/icon set. The brand name itself stays in Latin script in both
  languages (like any product name would).
- All internal identifiers renamed to match (`PURELY_*` globals, `purely-*` CSS classes/ids,
  the `purelySettings` storage key) - purely a naming cleanup, no behavior change.

**Bilingual UI (English default, Hebrew opt-in)**
- Added a lightweight in-app i18n system (`lib/i18n.js`) independent of the browser's own
  language - the user picks English or Hebrew from a toggle inside the app itself.
- Every page (popup, settings, welcome, help) and every background notification/menu label is
  now fully translated, with the choice persisted and applied instantly everywhere, including
  the right-click menu.
- Full RTL/LTR layout support using CSS logical properties (e.g. the toggle switch now flips
  correctly in both directions) instead of hardcoded left/right values.
- Free-text branding fields (header/footer text) use `dir="auto"` so they follow whatever the
  user actually types, while CSS-selector and domain fields always stay LTR (they're code, not
  prose) regardless of UI language.
- Fixed a Hebrew grammar bug where "N invalid selectors" showed a plural noun with a singular
  adjective ("בוררים לא תקין"); now uses distinct singular/plural phrasings.

**New Help & FAQ page**
- Added `help/help.html`: a getting-started guide, a live keyboard-shortcut reference (reads the
  shortcuts actually configured in Chrome), and an accordion FAQ covering privacy, custom
  selectors, logo branding, auto-clean, and - explicitly - how to update without losing settings.
- Linked from the popup, the settings page's quick-nav, and the welcome page.

**Update without reinstalling**
- `chrome.runtime.onInstalled` now distinguishes install vs. update: a fresh install opens the
  welcome page as before, an update shows a "Purely was updated to vX.X" notification instead.
- Documented (in the Help page and README) that unpacked extensions never need to be removed and
  re-added - overwriting the folder and clicking the reload icon at `chrome://extensions` is
  enough, and all settings/logo/domains survive untouched.

**Easier installation**
- Replaced the original PowerShell/.bat installer with **`Install Purely.exe`** - a small,
  branded WPF (.NET 8) desktop app matching the extension's own look (logo, teal palette,
  rounded modern window). It detects install vs. update, copies the extension to
  `%LOCALAPPDATA%\Purely` with a live progress bar, then opens `chrome://extensions` and the
  install folder automatically - leaving only the two clicks Chrome itself requires
  ("Developer mode" + "Load unpacked").
- Published as a single ~230KB file (`build/build-installer-exe.ps1`), framework-dependent on
  the shared .NET 8 Desktop Runtime rather than bundling it - keeps the download small; Windows
  offers a one-click runtime install automatically if it's ever missing.
- The installer itself now follows Windows' light/dark app theme automatically (matching the
  extension's own dark mode), and every step transitions with a smooth cross-fade instead of an
  abrupt swap: the window fades and slides in on open, the progress bar animates fluidly, a
  short minimum display time keeps the progress bar from just flashing on fast copies, and the
  success screen's checkmark "pops" in with a bit of overshoot for a satisfying finish.
- Added to the same `purely-installer-v<version>.zip` bundle (now `Install Purely.exe` next to
  the `extension/` folder) as before, separate from the bare `build.ps1` zip used for Web Store
  upload.

## v1.1.0 (2026-09-05) - UI/UX and reliability improvements

*(Written under the product's original name, "נקי"; superseded by the Purely rebrand above.)*

**Design & UX**
- Full dark mode support in the popup, settings and welcome page, following the system theme.
- Loading spinners on "Export PDF" and "Restore" so it's always clear the extension is working.
- A visual "Cleaned" badge and hidden-element count instead of plain text.
- Quick-nav anchors at the top of the settings page.
- The popup now shows the real configured keyboard shortcut (not static text), plus a version
  number in the footer.
- A new welcome page opens automatically on first install, with a 3-step quick-start guide.

**Reliability**
- Live validation of custom CSS selectors - an invalid line is flagged in red immediately, and
  invalid settings can't be saved.
- Logo upload validation: file type (images only) and a 2MB size cap, with a clear error message.
- Duplicate domains in the auto-clean list are now rejected with a message instead of silently
  ignored.
- An "unsaved changes" indicator plus a warning before leaving the settings page unsaved.
- More accurate, friendlier error messages (e.g. explicitly detecting a protected Chrome page)
  in both the popup and notifications.
- Fixed a bug where, in reader mode, the article title could appear twice.
- Removed an unused permission (`unlimitedStorage`) from the manifest.
- **Critical fix**: removed an invalid `default_locale` from the manifest (set without a matching
  `_locales` folder) - Chrome refused to load the extension at all with that field present.

**Code cleanup**
- Added a shared helper to validate CSS selector syntax (`isValidSelector`).

## v1.0.0 (2026-09-05) - Initial release

- One-click cleaning across 11 categories (ads, navigation, pop-ups, cookie banners, social
  share, comments, and more).
- Two modes: "Declutter only" and "Reader mode".
- Custom CSS selectors ("Always remove" / "Always keep").
- Auto-clean by domain list, with an explicit permission request.
- PDF branding: logo, header and footer text.
- Right-click menu, keyboard shortcuts, and a full settings page.
