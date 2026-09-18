(function () {
  const I18N = window.PURELY_I18N;
  let lang = I18N.DEFAULT_LANG;

  const langSwitch = document.getElementById('langSwitch');
  const versionLine = document.getElementById('versionLine');

  function applyLanguageToUI() {
    I18N.apply(lang);
    langSwitch.querySelectorAll('button').forEach((b) => {
      b.classList.toggle('active', b.dataset.lang === lang);
    });
    try {
      versionLine.textContent = I18N.t(lang, 'welcome.versionLine', { version: chrome.runtime.getManifest().version });
    } catch (e) { /* not critical */ }
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

  document.getElementById('openOptions').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  document.getElementById('openHelp').addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('src/help/help.html') });
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
  })();
})();
