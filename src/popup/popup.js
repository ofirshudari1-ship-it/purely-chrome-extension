(function () {
  const toggle = document.getElementById('cleanToggle');
  const statusHint = document.getElementById('statusHint');
  const exportBtn = document.getElementById('exportBtn');
  const restoreBtn = document.getElementById('restoreBtn');
  const pickBtn = document.getElementById('pickBtn');
  const typographyPanel = document.getElementById('typographyPanel');
  const fontSizeValue = document.getElementById('fontSizeValue');
  const fontSizeDown = document.getElementById('fontSizeDown');
  const fontSizeUp = document.getElementById('fontSizeUp');
  const lineHeightValue = document.getElementById('lineHeightValue');
  const lineHeightDown = document.getElementById('lineHeightDown');
  const lineHeightUp = document.getElementById('lineHeightUp');
  const optionsBtn = document.getElementById('optionsBtn');
  const helpBtn = document.getElementById('helpBtn');
  const tipText = document.getElementById('tipText');
  const segmented = document.getElementById('modeSegmented');
  const shortcutHint = document.getElementById('shortcutHint');
  const versionText = document.getElementById('versionText');
  const langSwitch = document.getElementById('langSwitch');

  const I18N = window.PURELY_I18N;
  const DEFAULTS = window.PURELY_DEFAULTS.DEFAULT_SETTINGS;
  let lang = I18N.DEFAULT_LANG;
  function t(key, vars) { return I18N.t(lang, key, vars); }

  let activeTabId = null;
  let activeHostname = '';
  let isRestrictedPage = false;

  const CLAMP_TYPO = window.PURELY_DEFAULTS.clampReaderTypography;
  const FONT_MIN = window.PURELY_DEFAULTS.READER_FONT_SIZE_MIN;
  const FONT_MAX = window.PURELY_DEFAULTS.READER_FONT_SIZE_MAX;
  const LINE_MIN = window.PURELY_DEFAULTS.READER_LINE_HEIGHT_MIN;
  const LINE_MAX = window.PURELY_DEFAULTS.READER_LINE_HEIGHT_MAX;
  let typography = CLAMP_TYPO(DEFAULTS.readerTypography);

  function renderTypographyControls() {
    fontSizeValue.textContent = typography.fontSize;
    lineHeightValue.textContent = typography.lineHeight.toFixed(1);
    fontSizeDown.disabled = typography.fontSize <= FONT_MIN;
    fontSizeUp.disabled = typography.fontSize >= FONT_MAX;
    lineHeightDown.disabled = typography.lineHeight <= LINE_MIN;
    lineHeightUp.disabled = typography.lineHeight >= LINE_MAX;
  }

  // Only meaningful in Reader mode (Declutter mode doesn't rebuild the page's typography).
  function refreshTypographyVisibility(mode) {
    typographyPanel.hidden = mode !== 'reader';
  }

  async function persistTypography() {
    const { purelySettings } = await chrome.storage.local.get('purelySettings');
    const updated = Object.assign({}, purelySettings, { readerTypography: typography });
    await chrome.storage.local.set({ purelySettings: updated });
    // Best-effort live update if Reader mode is already active on the page - harmless no-op
    // otherwise (the new value is simply picked up the next time Reader mode activates).
    sendAction('updateReaderTypography');
  }

  async function stepTypography(field, delta, min, max, decimals) {
    const raw = typography[field] + delta;
    const rounded = decimals ? Math.round(raw * 10) / 10 : raw;
    typography = Object.assign({}, typography, { [field]: Math.min(max, Math.max(min, rounded)) });
    renderTypographyControls();
    await persistTypography();
  }

  fontSizeDown.addEventListener('click', () => stepTypography('fontSize', -1, FONT_MIN, FONT_MAX, false));
  fontSizeUp.addEventListener('click', () => stepTypography('fontSize', 1, FONT_MIN, FONT_MAX, false));
  lineHeightDown.addEventListener('click', () => stepTypography('lineHeight', -0.1, LINE_MIN, LINE_MAX, true));
  lineHeightUp.addEventListener('click', () => stepTypography('lineHeight', 0.1, LINE_MIN, LINE_MAX, true));

  async function getMergedSettings() {
    const { purelySettings } = await chrome.storage.local.get('purelySettings');
    return window.PURELY_DEFAULTS.mergeSettings(DEFAULTS, purelySettings);
  }

  // Applies the chosen appearance immediately - 'system' removes the override so the
  // page falls back to following the OS theme.
  function applyTheme(theme) {
    if (theme && theme !== 'system') {
      document.documentElement.setAttribute('data-theme', theme);
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }

  function isRestrictedUrl(url) {
    return !url || /^(chrome|chrome-extension|edge|devtools|about|https:\/\/chrome\.google\.com\/webstore|https:\/\/chromewebstore\.google\.com)/i.test(url);
  }

  function setBusy(busy) {
    [toggle, exportBtn, restoreBtn, pickBtn].forEach((el) => (el.disabled = busy || isRestrictedPage));
    segmented.querySelectorAll('button').forEach((b) => (b.disabled = busy || isRestrictedPage));
  }

  function setLoading(btn, loading) {
    btn.classList.toggle('is-loading', loading);
  }

  function setTip(message, isError) {
    tipText.textContent = message || '';
    tipText.classList.toggle('is-error', !!isError);
  }

  function setStatus(cleaned, hiddenCount) {
    statusHint.replaceChildren();
    if (cleaned) {
      const badge = document.createElement('span');
      badge.className = 'purely-badge';
      badge.textContent = t('popup.statusCleanedBadge');
      statusHint.appendChild(badge);
      if (hiddenCount) {
        statusHint.appendChild(document.createTextNode(' ' + t('popup.statusHiddenCount', { count: hiddenCount })));
      }
    } else {
      statusHint.textContent = t('popup.statusOriginal');
    }
  }

  function sendAction(action) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: 'RUN_ACTION', action, tabId: activeTabId }, resolve);
    });
  }

  async function refreshMode() {
    const settings = await getMergedSettings();
    const mode = window.PURELY_DEFAULTS.resolveModeForHost(settings, activeHostname);
    segmented.querySelectorAll('button').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });
    typography = CLAMP_TYPO(settings.readerTypography);
    renderTypographyControls();
    refreshTypographyVisibility(mode);
  }

  async function refreshShortcuts() {
    try {
      const commands = await chrome.commands.getAll();
      const printCmd = commands.find((c) => c.name === 'clean-and-print');
      if (printCmd && printCmd.shortcut) {
        shortcutHint.textContent = t('popup.shortcutHint', { shortcut: printCmd.shortcut });
      } else {
        shortcutHint.textContent = t('popup.noShortcut');
      }
    } catch (e) { /* not critical if this fails */ }
  }

  function showVersion() {
    try {
      versionText.textContent = 'v' + chrome.runtime.getManifest().version;
    } catch (e) { /* not critical */ }
  }

  function applyLanguageToUI() {
    I18N.apply(lang);
    langSwitch.querySelectorAll('button').forEach((b) => {
      b.classList.toggle('active', b.dataset.lang === lang);
    });
    refreshShortcuts();
  }

  async function setLanguage(newLang, persist) {
    lang = newLang;
    applyLanguageToUI();
    if (persist) {
      const { purelySettings } = await chrome.storage.local.get('purelySettings');
      const updated = Object.assign({}, purelySettings, { language: lang });
      await chrome.storage.local.set({ purelySettings: updated });
      chrome.runtime.sendMessage({ type: 'SYNC_LANGUAGE' }, () => {});
    }
  }

  langSwitch.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-lang]');
    if (!btn || btn.dataset.lang === lang) return;
    setLanguage(btn.dataset.lang, true);
  });

  async function init() {
    const settings = await getMergedSettings();
    lang = settings.language || I18N.DEFAULT_LANG;
    applyLanguageToUI();
    applyTheme(settings.theme);
    showVersion();

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) return;
    activeTabId = tab.id;
    isRestrictedPage = isRestrictedUrl(tab.url);
    try {
      activeHostname = new URL(tab.url).hostname;
    } catch (e) {
      activeHostname = '';
    }

    await refreshMode();

    if (isRestrictedPage) {
      statusHint.textContent = t('popup.restrictedPage');
      typographyPanel.hidden = true;
      setBusy(true);
      return;
    }

    setBusy(true);
    const res = await sendAction('getState');
    setBusy(false);

    if (res && res.ok && res.result) {
      toggle.checked = !!res.result.cleaned;
      setStatus(res.result.cleaned, res.result.hiddenCount);
    } else {
      setStatus(false);
    }
  }

  toggle.addEventListener('change', async () => {
    const wantsClean = toggle.checked;
    setBusy(true);
    const res = await sendAction(wantsClean ? 'clean' : 'restore');
    setBusy(false);
    if (res && res.ok && res.result) {
      setStatus(res.result.cleaned, res.result.hiddenCount);
    } else {
      toggle.checked = !wantsClean;
      setTip((res && res.error) || t('popup.errorGeneric'), true);
    }
  });

  segmented.addEventListener('click', async (e) => {
    const btn = e.target.closest('button[data-mode]');
    if (!btn || btn.disabled) return;
    segmented.querySelectorAll('button').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    refreshTypographyVisibility(btn.dataset.mode);

    const settings = await getMergedSettings();
    const updated = Object.assign({}, settings, { mode: btn.dataset.mode });
    if (settings.rememberModePerSite && activeHostname) {
      updated.perSiteMode = Object.assign({}, settings.perSiteMode, { [activeHostname]: btn.dataset.mode });
    }
    await chrome.storage.local.set({ purelySettings: updated });
  });

  exportBtn.addEventListener('click', async () => {
    setBusy(true);
    setLoading(exportBtn, true);
    setTip(t('popup.preparing'));
    const res = await sendAction('cleanAndPrint');
    setLoading(exportBtn, false);
    if (!res || !res.ok) {
      setBusy(false);
      setTip((res && res.error) || t('popup.errorPrint'), true);
      return;
    }
    window.close();
  });

  restoreBtn.addEventListener('click', async () => {
    setBusy(true);
    setLoading(restoreBtn, true);
    const res = await sendAction('restore');
    setLoading(restoreBtn, false);
    setBusy(false);
    if (res && res.ok) {
      toggle.checked = false;
      setStatus(false);
      setTip('');
    } else {
      setTip((res && res.error) || t('popup.errorRestore'), true);
    }
  });

  // The picker needs the user to click directly on the page, which always steals focus
  // from (and therefore closes) this popup - so it's started here and then the popup
  // closes immediately; all of the actual picking UI/feedback lives in content.js instead.
  pickBtn.addEventListener('click', async () => {
    if (isRestrictedPage) return;
    await sendAction('startPicker');
    window.close();
  });

  optionsBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
    window.close();
  });

  helpBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('src/help/help.html') });
    window.close();
  });

  init();
})();
