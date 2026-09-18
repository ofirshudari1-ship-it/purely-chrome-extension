/*
 * Purely - Content Script
 * Injected into the actual page (chrome.scripting.executeScript) together
 * with shared/selectors.js and shared/i18n.js. All state lives under
 * window.__PURELY__ so it survives repeated injections into the same page.
 */
(function () {
  if (!window.__PURELY__) {
    window.__PURELY__ = {
      cleaned: false,
      readerActive: false,
      originalBodyNodes: null,
      hiddenCount: 0,
      pickerActive: false
    };
  }

  var STATE = window.__PURELY__;
  var DEFAULTS = (window.PURELY_DEFAULTS && window.PURELY_DEFAULTS.DEFAULT_SETTINGS) || {};
  var CATEGORY_SELECTORS = (window.PURELY_DEFAULTS && window.PURELY_DEFAULTS.CATEGORY_SELECTORS) || {};
  var MERGE_SETTINGS = (window.PURELY_DEFAULTS && window.PURELY_DEFAULTS.mergeSettings) || function (d) { return d; };
  var IS_VALID_SELECTOR = (window.PURELY_DEFAULTS && window.PURELY_DEFAULTS.isValidSelector) || function () { return true; };
  var RESOLVE_MODE = (window.PURELY_DEFAULTS && window.PURELY_DEFAULTS.resolveModeForHost) || function (s) { return s.mode || 'declutter'; };
  var I18N = window.PURELY_I18N;

  function modeFor(settings) {
    return RESOLVE_MODE(settings, location.hostname);
  }

  function localeFor(lang) {
    return lang === 'he' ? 'he-IL' : 'en-US';
  }

  function getSettings() {
    return new Promise(function (resolve) {
      chrome.storage.local.get('purelySettings', function (res) {
        resolve(MERGE_SETTINGS(DEFAULTS, res.purelySettings));
      });
    });
  }

  function buildSelectorList(settings) {
    var list = [];
    var categories = settings.categories || {};
    Object.keys(CATEGORY_SELECTORS).forEach(function (key) {
      if (categories[key]) {
        list = list.concat(CATEGORY_SELECTORS[key]);
      }
    });
    if (settings.customRemoveSelectors) {
      settings.customRemoveSelectors
        .split('\n')
        .map(function (s) { return s.trim(); })
        .filter(Boolean)
        .forEach(function (s) { list.push(s); });
    }
    var perSite = (settings.perSiteExtraSelectors && settings.perSiteExtraSelectors[location.hostname]) || [];
    list = list.concat(perSite);
    return list;
  }

  function getKeepSelectors(settings) {
    return (settings.customKeepSelectors || '')
      .split('\n')
      .map(function (s) { return s.trim(); })
      .filter(Boolean);
  }

  function matchesAny(el, selectors) {
    for (var i = 0; i < selectors.length; i++) {
      try {
        if (el.closest(selectors[i])) return true;
      } catch (e) { /* invalid selector - ignore */ }
    }
    return false;
  }

  function declutter(settings) {
    // Combining every category/custom selector into a single comma-separated selector
    // and running one querySelectorAll is meaningfully faster than one call per selector
    // (which used to run 60-80+ separate DOM queries on a fully-loaded settings object) -
    // querySelectorAll never returns the same element twice even if it matches more than
    // one part of the group, so this is a pure speed win with no behavior change. Invalid
    // selectors are filtered out first, since one bad selector in a combined list would
    // otherwise throw and silently skip every selector instead of just the bad one.
    var removeSelectors = buildSelectorList(settings).filter(IS_VALID_SELECTOR);
    var keepSelectors = getKeepSelectors(settings);
    var hidden = 0;

    if (removeSelectors.length) {
      var nodes;
      try {
        nodes = document.querySelectorAll(removeSelectors.join(','));
      } catch (e) {
        nodes = [];
      }
      nodes.forEach(function (node) {
        if (node.hasAttribute('data-purely-hidden')) return;
        if (keepSelectors.length && matchesAny(node, keepSelectors)) return;
        // never hide body/html themselves
        if (node === document.body || node === document.documentElement) return;
        node.setAttribute('data-purely-hidden', '1');
        hidden++;
      });
    }

    STATE.hiddenCount = hidden;
    STATE.cleaned = true;
    return hidden;
  }

  function restoreDeclutter() {
    document.querySelectorAll('[data-purely-hidden="1"]').forEach(function (node) {
      node.removeAttribute('data-purely-hidden');
    });
    STATE.hiddenCount = 0;
  }

  // Applies font-size/line-height as CSS custom properties (read by content.css) instead
  // of inline font-size/line-height directly, so the stylesheet stays the single source of
  // truth for every other typography rule (headings, meta line) and only the two tunable
  // values are ever touched from JS.
  function applyReaderTypography(container, typography) {
    var CLAMP = window.PURELY_DEFAULTS && window.PURELY_DEFAULTS.clampReaderTypography;
    var t = CLAMP ? CLAMP(typography) : (typography || { fontSize: 17, lineHeight: 1.7 });
    container.style.setProperty('--purely-reader-font-size', t.fontSize + 'px');
    container.style.setProperty('--purely-reader-line-height', String(t.lineHeight));
  }

  // --- "Reader mode" (see shared/readability.js for the local extraction engine) ---
  function activateReaderMode(settings) {
    if (STATE.readerActive) return;
    var READABILITY = window.PURELY_READABILITY;
    var main = READABILITY ? READABILITY.findMainElement(document) : document.body;
    var clone = main.cloneNode(true);
    // strip anything already marked hidden from the preserved content
    clone.querySelectorAll('[data-purely-hidden="1"]').forEach(function (n) { n.remove(); });
    clone.querySelectorAll('script, style, iframe, form, button, input, [class*="ad"]').forEach(function (n) { n.remove(); });

    // Keep the original body as real DOM nodes (not an HTML string) so restoring it
    // later never has to re-parse/re-inject markup via innerHTML.
    STATE.originalBodyNodes = Array.prototype.map.call(document.body.childNodes, function (n) {
      return n.cloneNode(true);
    });
    STATE.originalBodyClassName = document.body.className;

    var title = READABILITY ? READABILITY.extractTitle(document) : document.title;
    var byline = READABILITY ? READABILITY.extractByline(document) : '';
    var publishedDate = READABILITY ? READABILITY.extractPublishedDate(document) : null;

    // if the main title is already inside the extracted content, drop it to avoid a duplicate
    var firstHeading = clone.querySelector('h1, h2');
    if (firstHeading && firstHeading.textContent.trim() === title) {
      firstHeading.remove();
    }

    var wrapper = document.createElement('div');
    wrapper.className = 'purely-reader-container';
    applyReaderTypography(wrapper, settings.readerTypography);

    var h1 = document.createElement('h1');
    h1.className = 'purely-reader-title';
    h1.textContent = title;

    var meta = document.createElement('div');
    meta.className = 'purely-reader-meta';
    var lang = (settings && settings.language) || 'en';
    var metaBits = [location.hostname];
    if (byline) metaBits.push(byline);
    metaBits.push((publishedDate || new Date()).toLocaleDateString(localeFor(lang)));
    meta.textContent = metaBits.join(' · ');

    wrapper.appendChild(h1);
    wrapper.appendChild(meta);
    wrapper.appendChild(clone);

    document.body.replaceChildren(wrapper);
    document.body.className = '';

    STATE.readerActive = true;
    STATE.cleaned = true;
  }

  function deactivateReaderMode() {
    if (!STATE.readerActive || !STATE.originalBodyNodes) return;
    document.body.replaceChildren.apply(document.body, STATE.originalBodyNodes);
    document.body.className = STATE.originalBodyClassName || '';
    STATE.readerActive = false;
    STATE.originalBodyNodes = null;
  }

  // --- Print / PDF branding ---
  function removePrintBranding() {
    var h = document.getElementById('purely-print-header');
    var f = document.getElementById('purely-print-footer');
    if (h) h.remove();
    if (f) f.remove();
  }

  function injectPrintBranding(settings) {
    removePrintBranding();
    var branding = settings.branding || {};
    var lang = settings.language || 'en';

    var header = document.createElement('div');
    header.id = 'purely-print-header';

    if (branding.logoDataUrl) {
      var img = document.createElement('img');
      img.src = branding.logoDataUrl;
      header.appendChild(img);
    }

    var textWrap = document.createElement('div');
    var titleLine = document.createElement('div');
    titleLine.className = 'purely-header-title';
    titleLine.textContent = branding.headerText || (branding.showPageTitle !== false ? document.title : '');
    textWrap.appendChild(titleLine);

    var metaBits = [];
    if (branding.showUrl !== false) metaBits.push(location.href);
    if (branding.showDate !== false) metaBits.push(new Date().toLocaleString(localeFor(lang)));
    if (metaBits.length) {
      var metaLine = document.createElement('div');
      metaLine.className = 'purely-header-text';
      metaLine.textContent = metaBits.join(' · ');
      textWrap.appendChild(metaLine);
    }
    header.appendChild(textWrap);

    var footer = document.createElement('div');
    footer.id = 'purely-print-footer';
    var fallbackFooter = I18N ? I18N.t(lang, 'options.footerTextPlaceholder') : '';
    footer.textContent = branding.footerText || fallbackFooter;

    document.body.insertBefore(header, document.body.firstChild);
    document.body.appendChild(footer);
  }

  // --- "Pick element to remove" - manual exclusion tool for elements the automatic
  // category/selector detection misses. Hover highlights the element under the cursor;
  // clicking hides it immediately, saves a generated selector under this site in
  // chrome.storage.local (so it is remembered automatically on future visits/cleans),
  // and shows a brief on-page confirmation. Esc cancels without picking anything.
  //
  // Deliberately does *not* rely on the popup staying open or listening for a result:
  // Chrome closes extension popups the instant they lose focus, which happens the moment
  // the user clicks into the page to pick an element - so all persistence and feedback
  // here happens entirely inside the content script/page, never round-tripping to popup.js.
  var PICKER_HIGHLIGHT_CLASS = 'purely-picker-hover';
  var PICKER_BANNER_ID = 'purely-picker-banner';

  function pickerBannerText() {
    var lang = STATE.lastLang || 'en';
    return I18N ? I18N.t(lang, 'picker.bannerHint') : 'Click any element to remove it - Esc to cancel';
  }

  function showPickerBanner() {
    removePickerBanner();
    var banner = document.createElement('div');
    banner.id = PICKER_BANNER_ID;
    banner.textContent = pickerBannerText();
    document.documentElement.appendChild(banner);
  }

  function removePickerBanner() {
    var el = document.getElementById(PICKER_BANNER_ID);
    if (el) el.remove();
  }

  function showPickerToast(message) {
    var toast = document.createElement('div');
    toast.id = 'purely-picker-toast';
    toast.textContent = message;
    document.documentElement.appendChild(toast);
    setTimeout(function () { toast.remove(); }, 2200);
  }

  function startPicker(settings) {
    if (STATE.pickerActive) return;
    STATE.pickerActive = true;
    STATE.lastLang = (settings && settings.language) || 'en';
    document.addEventListener('mouseover', onPickerHover, true);
    document.addEventListener('click', onPickerClick, true);
    document.addEventListener('keydown', onPickerKeydown, true);
    document.body.classList.add('purely-picker-mode');
    showPickerBanner();
  }

  function stopPicker() {
    if (!STATE.pickerActive) return;
    STATE.pickerActive = false;
    document.removeEventListener('mouseover', onPickerHover, true);
    document.removeEventListener('click', onPickerClick, true);
    document.removeEventListener('keydown', onPickerKeydown, true);
    document.body.classList.remove('purely-picker-mode');
    removePickerBanner();
    var prev = document.querySelector('.' + PICKER_HIGHLIGHT_CLASS);
    if (prev) prev.classList.remove(PICKER_HIGHLIGHT_CLASS);
  }

  function onPickerHover(e) {
    var prev = document.querySelector('.' + PICKER_HIGHLIGHT_CLASS);
    if (prev && prev !== e.target) prev.classList.remove(PICKER_HIGHLIGHT_CLASS);
    if (e.target && e.target.nodeType === 1 && e.target !== document.body && e.target !== document.documentElement
        && e.target.id !== PICKER_BANNER_ID) {
      e.target.classList.add(PICKER_HIGHLIGHT_CLASS);
    }
  }

  function onPickerKeydown(e) {
    if (e.key === 'Escape') {
      stopPicker();
    }
  }

  // Persists the picked selector under this hostname directly in storage, merging with
  // whatever is already saved (never overwriting other sites' picks or a concurrent write).
  function saveSelectorForSite(hostname, selector) {
    return new Promise(function (resolve) {
      if (!selector) { resolve(); return; }
      chrome.storage.local.get('purelySettings', function (res) {
        var settings = MERGE_SETTINGS(DEFAULTS, res.purelySettings);
        var perSite = Object.assign({}, settings.perSiteExtraSelectors);
        var list = (perSite[hostname] || []).slice();
        if (list.indexOf(selector) === -1) list.push(selector);
        perSite[hostname] = list;
        settings.perSiteExtraSelectors = perSite;
        chrome.storage.local.set({ purelySettings: settings }, resolve);
      });
    });
  }

  function onPickerClick(e) {
    var target = e.target;
    if (!target || target.nodeType !== 1 || target === document.body || target === document.documentElement
        || target.id === PICKER_BANNER_ID) return;
    e.preventDefault();
    e.stopPropagation();

    var BUILD_SELECTOR = window.PURELY_DEFAULTS && window.PURELY_DEFAULTS.buildSelectorForElement;
    var selector = BUILD_SELECTOR ? BUILD_SELECTOR(target) : '';
    target.classList.remove(PICKER_HIGHLIGHT_CLASS);
    target.setAttribute('data-purely-hidden', '1');
    STATE.hiddenCount = (STATE.hiddenCount || 0) + 1;
    STATE.cleaned = true;
    var lang = STATE.lastLang || 'en';
    stopPicker();

    saveSelectorForSite(location.hostname, selector).then(function () {
      var msg = I18N ? I18N.t(lang, 'picker.removedToast') : 'Removed - will stay hidden on this site from now on';
      showPickerToast(msg);
    });
  }

  // --- Public API ---
  window.__PURELY_RUN__ = function (action) {
    return getSettings().then(function (settings) {
      // Resolved once per call: the per-site remembered mode when that feature is on and
      // this host has one saved, otherwise the global default mode from settings.
      var effectiveMode = modeFor(settings);

      switch (action) {
        case 'clean':
          if (effectiveMode === 'reader') {
            activateReaderMode(settings);
          } else {
            declutter(settings);
          }
          return { cleaned: true, hiddenCount: STATE.hiddenCount, mode: effectiveMode };

        case 'restore':
          stopPicker();
          deactivateReaderMode();
          restoreDeclutter();
          removePrintBranding();
          STATE.cleaned = false;
          return { cleaned: false };

        case 'startPicker':
          startPicker(settings);
          return { picking: true };

        case 'stopPicker':
          stopPicker();
          return { picking: false };

        case 'updateReaderTypography':
          if (STATE.readerActive) {
            var container = document.querySelector('.purely-reader-container');
            if (container) applyReaderTypography(container, settings.readerTypography);
          }
          return { updated: true };

        case 'prepareForPrint':
          if (effectiveMode === 'reader') {
            activateReaderMode(settings);
          } else {
            declutter(settings);
          }
          injectPrintBranding(settings);
          return { ready: true };

        case 'print':
          window.print();
          return { printed: true };

        case 'cleanAndPrint':
          if (effectiveMode === 'reader') {
            activateReaderMode(settings);
          } else {
            declutter(settings);
          }
          injectPrintBranding(settings);
          window.print();
          return { printed: true };

        case 'getState':
          return { cleaned: STATE.cleaned, mode: effectiveMode, hiddenCount: STATE.hiddenCount };

        default:
          return { error: 'unknown-action' };
      }
    });
  };
})();
