# Purely - Clean Pages for Print & PDF

A Chrome extension that strips ads, navigation bars, pop-ups and banners from any web page,
then gets it ready for printing or a clean PDF export - with optional logo branding.
Runs entirely locally in the browser, no external servers.

Current version: **1.5.0** (see [CHANGELOG.md](CHANGELOG.md)). The UI defaults to English and
can be switched to Hebrew at any time from the small **EN / עב** toggle in the popup, settings,
welcome and help pages - the choice is remembered and applied everywhere immediately. Appearance
(Light/Dark/System) is independently switchable from Settings → Appearance.

## Documentation map

This README is the entry point. For anything deeper, go to:

| Document | What's in it |
|---|---|
| [SPEC.md](SPEC.md) | **Quick-reference spec** - architecture, data/privacy summary, known deviations from the shared tool standard. |
| [docs/מסמך_אפיון.md](docs/מסמך_אפיון.md) | **Expanded spec** - the problem, the solution, why it's worth using, competitive research, full feature list, architecture, privacy/security deep-dive, permissions, roadmap, business Q&A. (Hebrew) |
| [docs/התקנה.md](docs/התקנה.md) | **Installation guide** - step-by-step, plus updating, uninstalling, and troubleshooting. (Hebrew) |
| [site/index.html](site/index.html) | **Marketing / landing page** - a shareable, self-contained one-pager explaining Purely to a new audience. Open it directly in a browser. |
| [PRIVACY.md](PRIVACY.md) | **Privacy policy** (EN+HE) - what data is collected (none, beyond local settings) and why each permission is needed. |
| [store/LISTING.md](store/LISTING.md) | Chrome Web Store listing copy (EN+HE) and submission asset checklist. |
| [CHANGELOG.md](CHANGELOG.md) | **Version history** - what changed in every release, and why. |
| [tests/test-suite.html](tests/test-suite.html) | Automated test suite for the core logic (see [Tests](#tests) below). |

## Installation

Chrome only allows installing an extension that isn't from the Web Store via its built-in
"Developer mode" flow - there's no separate installer file for a Chrome extension, so this is
the one way to install Purely locally:

1. Unzip `Purely-v<version>.zip` (or use this project folder directly if you already have it),
   and open Chrome to `chrome://extensions`
2. Turn on **"Developer mode"** (top-right toggle)
3. Click **"Load unpacked"**
4. Select the project's root folder - the one containing `manifest.json` directly
5. Pin the Purely icon to the toolbar via the puzzle-piece icon 🧩 if it's not visible

## Usage

- **Quick clean:** click the Purely icon in the toolbar → turn on "Clean this page".
- **Export a PDF:** in the same popup, click "Export clean PDF" - the page is cleaned
  automatically and Chrome's print dialog opens; choose "Save as PDF" as the destination.
- **Right-click menu:** right-clicking any page also shows "Clean this page" / "Clean & Print" /
  "Restore original page".
- **Keyboard shortcuts:** `Ctrl+Shift+K` to clean quickly, `Ctrl+Shift+P` to clean + open print.
- **Restore:** if cleaning hid something you wanted to keep, click "Restore original page" -
  instant and fully reversible.
- **Help:** click "Help" in the popup (or the Help pill in Settings) for a full FAQ, keyboard
  shortcut reference, and troubleshooting tips.

## Settings

Click "Settings" in the popup, or right-click the extension icon → "Options". From there you can:

- Toggle categories to clean (ads, navigation, pop-ups, cookie banners, social share, comments...)
- Choose the default mode: "Declutter only" (keeps layout) or "Reader mode" (rebuilt reading view)
- Add custom CSS selectors per site ("Always remove" / "Always keep")
- Set up domains that get cleaned **automatically** on every load (requires a one-time permission)
- Upload a **logo** and header/footer text that appear only in the printed/PDF version
- Switch the UI language between English and Hebrew

## Project structure

```
Purely - Chrome Extension/
├── manifest.json               MV3 entry point
├── Purely-v<version>.zip        Final packaged extension - single ZIP, root of the project
├── README.md                   This file - the entry point
├── SPEC.md                      Quick-reference spec (English)
├── PRIVACY.md                   Privacy policy (EN+HE)
├── CHANGELOG.md                 Version history
├── docs/
│   ├── מסמך_אפיון.md              Expanded spec: problem, solution, architecture, privacy, roadmap
│   └── התקנה.md                   Standalone installation guide
├── site/
│   └── index.html                Marketing / landing page (self-contained, open directly)
├── store/
│   └── LISTING.md                 Chrome Web Store listing copy + submission asset checklist
├── tests/
│   └── test-suite.html           Automated test suite for the cleaning/reader/branding/i18n logic
├── build/
│   └── build.ps1                  Packages the extension into Purely-v<version>.zip at the root
├── assets/
│   └── icons/                     Brand icons (16/32/48/128 + master)
└── src/
    ├── background.js             Service worker - menus, shortcuts, script injection, update lifecycle
    ├── shared/
    │   ├── selectors.js            Default cleaning selector lists + settings schema/merge + validation
    │   ├── i18n.js                 In-app English/Hebrew dictionary and translation helper
    │   └── readability.js          Local "Smart Reader" content-scoring engine (no AI/cloud service)
    ├── content/
    │   ├── content.js               Cleaning / reader-mode / PDF-branding logic that runs on the page
    │   ├── content.css              Hiding styles, reader-mode typography (incl. dark mode), print header/footer
    │   └── auto-clean.js            Only runs on domains added to "auto-clean"
    ├── popup/                      Quick-action popup (dark mode, loading spinners, language switch)
    ├── options/                    Full settings page (validation, quick-nav, unsaved-changes indicator)
    ├── welcome/                    First-run "Welcome" page, opened automatically on install
    └── help/                       In-app Help & FAQ page (getting started, shortcuts, troubleshooting)
```

## Packaging (ZIP)

```powershell
cd "build"
./build.ps1
```

This packages `manifest.json` + `src/` + `assets/` into `Purely-v<version>.zip` in the **project
root** - ready for Chrome Web Store upload, or to hand to someone else to unzip and "Load
unpacked" themselves. The script also removes any older `Purely-v*.zip` left in the root first,
so there is never more than one package file at a time.

## Updating without reinstalling

Because Purely is loaded as an unpacked extension, updating never requires removing it first:
just replace the contents of whatever folder you originally pointed "Load unpacked" at with the
new version's files, then click the small reload icon (⟳) on Purely's card at
`chrome://extensions`.

All settings, the logo, custom selectors, auto-clean domains and the chosen language are stored
in `chrome.storage.local` and are completely unaffected by that - only the code changes.

## Privacy

Purely never sends any data to an external server. All cleaning happens inside the browser, and
settings (including the logo) are stored only on the user's computer via `chrome.storage.local`.
No analytics, no tracking, no ads. Full policy: [PRIVACY.md](PRIVACY.md).

## Tests

A standalone test suite (not bundled into the shipped extension) exercises the cleaning / reader
mode / branding / i18n logic at the function level, without needing an actual install:

```powershell
python -m http.server 8791
# then open: http://localhost:8791/tests/test-suite.html
```

Any static file server works (the page must be loaded over HTTP, not `file://`, so the scripts
load correctly). All rows should show green (PASS).

## Ideas for a future version

- Fully automatic PDF export (skipping the print dialog) via the Chrome DevTools Protocol.
- Further reader-mode refinements (hero image detection, subheadings, estimated reading time).
- Per-site saved profiles (e.g. always "Reader mode" on blogs, "Declutter only" on booking sites).
- Publish to the Chrome Web Store for one-click install and automatic updates.
