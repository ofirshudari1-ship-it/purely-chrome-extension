/*
 * Purely - default element lists for cleaning + default settings.
 * Loaded both inside the injected content script and inside the
 * popup/options/welcome/help pages. A single global (PURELY_DEFAULTS)
 * is used instead of ES modules for simplicity across contexts.
 */
(function (root) {
  var CATEGORY_SELECTORS = {
    ads: [
      '.adsbygoogle', 'ins.adsbygoogle', '[id^="google_ads"]', '[id*="ad-slot"]',
      '[class*="ad-container"]', '[class*="ad-wrapper"]', '[class*="ad-banner"]',
      '[class*="advertisement"]', '[id*="advertisement"]', '[class*="sponsored-"]',
      '[data-ad-slot]', '[data-ad]', '.ad', '.ads', '.banner-ad',
      'iframe[src*="doubleclick"]', 'iframe[src*="googlesyndication"]',
      'iframe[id^="google_ads_iframe"]', '[class*="taboola"]', '[id*="taboola"]',
      '[class*="outbrain"]', '[id*="outbrain"]', '[class*="mgid"]'
    ],
    nav: [
      'header', 'nav', '[role="navigation"]', '.navbar', '.nav-bar', '.site-header',
      '.main-nav', '.top-bar', '.breadcrumb', '.breadcrumbs', '.menu-main'
    ],
    sidebar: [
      'aside', '.sidebar', '[role="complementary"]', '.widget-area', '.side-column'
    ],
    popups: [
      '.modal', '[class*="popup"]', '[id*="popup"]', '[class*="overlay"]', '.lightbox',
      '[role="dialog"]', '[aria-modal="true"]', '[class*="newsletter"]',
      '[class*="subscribe-box"]', '[class*="paywall"]', '[class*="interstitial"]'
    ],
    cookie: [
      '[class*="cookie"]', '[id*="cookie"]', '[class*="gdpr"]', '[id*="gdpr"]',
      '[id*="consent"]', '[class*="consent-banner"]', '#onetrust-banner-sdk',
      '.cc-banner', '.cc-window'
    ],
    social: [
      '.share', '[class*="social-share"]', '[class*="share-buttons"]', '.addthis',
      '.sharethis', '[class*="follow-us"]', '[class*="social-icons"]'
    ],
    comments: [
      '#comments', '.comments', '[class*="comment-section"]', '#disqus_thread',
      '.fb-comments', '[id*="comment-list"]'
    ],
    related: [
      '[class*="related-posts"]', '[class*="related-articles"]', '[class*="recommended"]',
      '[class*="you-may-like"]', '[class*="also-read"]', '[class*="more-stories"]',
      '[class*="read-next"]'
    ],
    sticky: [
      '.sticky', '.fixed-header', '.floating-bar', '[class*="sticky-"]',
      '[class*="floating-"]'
    ],
    footer: [
      'footer', '.site-footer', '.page-footer'
    ],
    media: [
      'video[autoplay]', '[class*="video-background"]', '[class*="autoplay-video"]'
    ]
  };

  // סדר הקטגוריות לתצוגה בהגדרות; התוויות עצמן מגיעות מ-i18n.js (מפתחות cat.*)
  var CATEGORY_ORDER = ['ads', 'nav', 'sidebar', 'popups', 'cookie', 'social', 'comments', 'related', 'sticky', 'footer', 'media'];

  var CATEGORY_DEFAULT_STATE = {
    ads: true,
    nav: true,
    sidebar: false,
    popups: true,
    cookie: true,
    social: true,
    comments: false,
    related: true,
    sticky: true,
    footer: false,
    media: true
  };

  // Clamped range for the reader-mode typography controls (popup + content script both
  // import these instead of hard-coding the numbers twice).
  var READER_FONT_SIZE_MIN = 14;
  var READER_FONT_SIZE_MAX = 22;
  var READER_LINE_HEIGHT_MIN = 1.3;
  var READER_LINE_HEIGHT_MAX = 2.1;

  function clamp(value, min, max) {
    var n = Number(value);
    if (!isFinite(n)) return min;
    return Math.min(max, Math.max(min, n));
  }

  var DEFAULT_SETTINGS = {
    language: 'en', // 'en' | 'he'
    theme: 'system', // 'system' | 'light' | 'dark' - applies to Purely's own pages
    categories: CATEGORY_DEFAULT_STATE,
    mode: 'declutter', // 'declutter' | 'reader' - global default mode
    rememberModePerSite: false, // when true, switching mode on a site remembers it for next time
    perSiteMode: {}, // { hostname: 'declutter' | 'reader' }, only used when rememberModePerSite is true
    autoCleanDomains: [],
    customRemoveSelectors: '',
    customKeepSelectors: '',
    // { hostname: string[] } - selectors picked with the popup's "Pick element to remove"
    // tool are remembered per-site automatically, separately from the global custom-remove
    // textarea above (which the user edits by hand in Settings).
    perSiteExtraSelectors: {},
    // Reader-mode reading/printing typography, adjustable live from the popup.
    readerTypography: {
      fontSize: 17, // px, see READER_FONT_SIZE_MIN/MAX
      lineHeight: 1.7 // unitless, see READER_LINE_HEIGHT_MIN/MAX
    },
    branding: {
      logoDataUrl: '',
      headerText: '',
      footerText: '', // empty = falls back to the localized "Generated with Purely" placeholder
      showDate: true,
      showUrl: true,
      showPageTitle: true
    }
  };

  // Resolves the mode that should actually run on a given hostname: the per-site
  // remembered mode when the feature is on and one is saved for this host, otherwise
  // the global default mode.
  function resolveModeForHost(settings, hostname) {
    if (settings.rememberModePerSite && settings.perSiteMode && settings.perSiteMode[hostname]) {
      return settings.perSiteMode[hostname];
    }
    return settings.mode || 'declutter';
  }

  // Checks that a CSS selector is syntactically valid (does not check whether
  // it actually matches anything, only that it does not throw).
  function isValidSelector(selector) {
    if (!selector) return true;
    try {
      document.createDocumentFragment().querySelector(selector);
      return true;
    } catch (e) {
      return false;
    }
  }

  // Merges a settings object loaded from storage on top of DEFAULT_SETTINGS,
  // field by field for the nested "categories" and "branding" objects instead
  // of replacing them wholesale. This matters across upgrades: if a future
  // version adds a new category or branding field, a user's settings saved
  // under an older version (missing that key) still gets the new key's
  // default value instead of silently losing it because the whole nested
  // object got overwritten.
  function mergeSettings(defaults, stored) {
    var result = {};
    Object.keys(defaults).forEach(function (key) { result[key] = defaults[key]; });
    if (!stored) return result;

    Object.keys(stored).forEach(function (key) {
      var value = stored[key];
      var defaultValue = defaults[key];
      var isPlainObject = value && typeof value === 'object' && !Array.isArray(value);
      var defaultIsPlainObject = defaultValue && typeof defaultValue === 'object' && !Array.isArray(defaultValue);
      if (isPlainObject && defaultIsPlainObject) {
        result[key] = Object.assign({}, defaultValue, value);
      } else if (value !== undefined) {
        result[key] = value;
      }
    });
    return result;
  }

  // Builds a reasonably specific, stable CSS selector for an element the user picked
  // manually (see content.js's "click to remove" picker). Prefers a real id, then a
  // short run of class names, then falls back to a tag+:nth-of-type path scoped to a
  // few ancestors - good enough to re-match the same element/its siblings on later
  // visits without being so broad it hides unrelated parts of the page.
  function buildSelectorForElement(el) {
    if (!el || el.nodeType !== 1) return '';
    if (el.id && /^[a-zA-Z][\w-]*$/.test(el.id)) {
      return '#' + el.id;
    }
    var classes = (el.className && typeof el.className === 'string')
      ? el.className.trim().split(/\s+/).filter(function (c) { return /^[a-zA-Z][\w-]*$/.test(c); }).slice(0, 3)
      : [];
    if (classes.length) {
      var classSelector = el.tagName.toLowerCase() + classes.map(function (c) { return '.' + c; }).join('');
      if (isValidSelector(classSelector)) return classSelector;
    }

    // Fallback: a short path of tag:nth-of-type steps, up to 3 ancestors deep.
    var parts = [];
    var node = el;
    for (var depth = 0; node && node.nodeType === 1 && depth < 3; depth++) {
      var tag = node.tagName.toLowerCase();
      var parent = node.parentElement;
      if (parent) {
        var siblings = Array.prototype.filter.call(parent.children, function (c) { return c.tagName === node.tagName; });
        if (siblings.length > 1) {
          tag += ':nth-of-type(' + (siblings.indexOf(node) + 1) + ')';
        }
      }
      parts.unshift(tag);
      node = parent;
    }
    return parts.join(' > ');
  }

  root.PURELY_DEFAULTS = {
    CATEGORY_SELECTORS: CATEGORY_SELECTORS,
    CATEGORY_ORDER: CATEGORY_ORDER,
    CATEGORY_DEFAULT_STATE: CATEGORY_DEFAULT_STATE,
    DEFAULT_SETTINGS: DEFAULT_SETTINGS,
    READER_FONT_SIZE_MIN: READER_FONT_SIZE_MIN,
    READER_FONT_SIZE_MAX: READER_FONT_SIZE_MAX,
    READER_LINE_HEIGHT_MIN: READER_LINE_HEIGHT_MIN,
    READER_LINE_HEIGHT_MAX: READER_LINE_HEIGHT_MAX,
    clampReaderTypography: function (typography) {
      typography = typography || {};
      return {
        fontSize: clamp(typography.fontSize, READER_FONT_SIZE_MIN, READER_FONT_SIZE_MAX),
        lineHeight: clamp(typography.lineHeight, READER_LINE_HEIGHT_MIN, READER_LINE_HEIGHT_MAX)
      };
    },
    isValidSelector: isValidSelector,
    mergeSettings: mergeSettings,
    resolveModeForHost: resolveModeForHost,
    buildSelectorForElement: buildSelectorForElement
  };
})(typeof window !== 'undefined' ? window : this);
