(function () {
  const I18N = window.PURELY_I18N;
  let lang = I18N.DEFAULT_LANG;

  const langSwitch = document.getElementById('langSwitch');
  const shortcutClean = document.getElementById('shortcutClean');
  const shortcutPrint = document.getElementById('shortcutPrint');

  function applyLanguageToUI() {
    I18N.apply(lang);
    langSwitch.querySelectorAll('button').forEach((b) => {
      b.classList.toggle('active', b.dataset.lang === lang);
    });
  }

  async function setLanguage(newLang) {
    if (newLang === lang) return;
    lang = newLang;
    applyLanguageToUI();
    const { purelySettings } = await chrome.storage.local.get('purelySettings');
    const updated = Object.assign({}, purelySettings, { language: lang });
    await chrome.storage.local.set({ purelySettings: updated });
    chrome.runtime.sendMessage({ type: 'SYNC_LANGUAGE' }, () => {});
  }

  langSwitch.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-lang]');
    if (!btn) return;
    setLanguage(btn.dataset.lang);
  });

  async function loadShortcuts() {
    try {
      const commands = await chrome.commands.getAll();
      const clean = commands.find((c) => c.name === 'clean-page');
      const print = commands.find((c) => c.name === 'clean-and-print');
      if (clean && clean.shortcut) shortcutClean.textContent = clean.shortcut;
      if (print && print.shortcut) shortcutPrint.textContent = print.shortcut;
    } catch (e) { /* keep the defaults shown in the HTML */ }
  }

  document.getElementById('backToSettings').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  document.getElementById('closeTab').addEventListener('click', () => {
    window.close();
  });

  function applyTheme(theme) {
    if (theme && theme !== 'system') {
      document.documentElement.setAttribute('data-theme', theme);
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }

  (async function init() {
    const { purelySettings } = await chrome.storage.local.get('purelySettings');
    lang = (purelySettings && purelySettings.language) || I18N.DEFAULT_LANG;
    applyTheme(purelySettings && purelySettings.theme);
    applyLanguageToUI();
    loadShortcuts();
  })();
})();
