# Purely

**Strip ads, navigation bars, pop-ups and clutter from any web page before you print it or export it as a PDF.**

## What it does

Purely cleans up a web page in your browser — removing ads, navigation menus, pop-ups, cookie banners, social-share widgets, and comment sections — so what you print or save as a PDF is just the content you actually wanted. It offers two modes: "Declutter only" (keeps the page's original layout, just removes the junk) or "Reader mode" (rebuilds the article into a clean, readable view, similar to a browser reader view). You can add a logo and custom header/footer text that appear only in the printed or exported version, fine-tune what gets removed with custom rules per site, and click any leftover element to remove it manually. The interface is bilingual (English and Hebrew) with light, dark, and system appearance themes.

## Install

Purely is not published on the Chrome Web Store, so installation is manual and there is no automatic update:

1. Download the latest `.zip` from the [Releases page](https://github.com/ofirshudari1-ship-it/purely-chrome-extension/releases/latest).
2. Extract the zip to a folder you'll keep on your computer.
3. Open `chrome://extensions` in Chrome.
4. Turn on **Developer mode** (toggle in the top-right corner).
5. Click **Load unpacked** and select the folder you extracted.

Because this isn't a Chrome Web Store install, Chrome will never update it automatically. To get a new version later, download the new release zip and repeat the steps above.

## Key features

- **Clean this page**: one click (or `Ctrl+Shift+K`) removes ads, navigation, pop-ups, cookie banners, social widgets and comments from the current page.
- **Export a clean PDF**: cleans the page and opens the browser's print dialog in one step (`Ctrl+Shift+P`) — choose "Save as PDF" as the destination.
- **Reader mode**: rebuilds an article into a clean, typography-focused reading view, with adjustable text size and line spacing.
- **Pick element to remove**: click-to-exclude any element the automatic cleanup misses, right on the page.
- **Per-site memory**: elements you've picked, and domains you've marked for automatic cleaning, are remembered and reapplied the next time you visit that site.
- **Custom branding for printed/PDF output**: add a logo and header/footer text that appears only in the printed or exported version, never on the live page.
- **Fully reversible**: "Restore original page" instantly undoes any cleaning with no page reload needed.
- **Custom selectors**: add your own CSS rules to always remove or always keep specific elements on specific sites.

## Privacy

Purely runs entirely locally in your browser — it never sends any data to an external server, and there is no AI or cloud service involved at all. All page cleaning and reader-mode processing happens on-device. Your settings, custom selectors, auto-clean domain list, and uploaded logo are stored only on your own computer via `chrome.storage.local`. There is no analytics and no tracking.
