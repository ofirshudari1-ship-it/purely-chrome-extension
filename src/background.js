/*
 * Purely - Service Worker
 * Handles: right-click menu, keyboard shortcuts, script injection, dynamic
 * registration of auto-clean content scripts for domains the user picked
 * (optional_host_permissions), and update/install lifecycle events.
 */
importScripts('shared/i18n.js');

const CONTENT_FILES = ['src/shared/selectors.js', 'src/shared/i18n.js', 'src/shared/readability.js', 'src/content/content.js'];
const CSS_FILES = ['src/content/content.css'];
const AUTO_SCRIPT_ID = 'purely-auto-clean';
const MENU_IDS = {
  clean: 'purely-clean',
  cleanPrint: 'purely-clean-print',
  restore: 'purely-restore'
};

async function getLanguage() {
  const { purelySettings } = await chrome.storage.local.get('purelySettings');
  return (purelySettings && purelySettings.language) || self.PURELY_I18N.DEFAULT_LANG;
}

async function applyMenuLanguage() {
  const lang = await getLanguage();
  const t = self.PURELY_I18N.t;
  try {
    await chrome.contextMenus.update(MENU_IDS.clean, { title: t(lang, 'menu.clean') });
    await chrome.contextMenus.update(MENU_IDS.cleanPrint, { title: t(lang, 'menu.cleanPrint') });
    await chrome.contextMenus.update(MENU_IDS.restore, { title: t(lang, 'menu.restore') });
  } catch (e) { /* menus not created yet - ignore */ }
}

chrome.runtime.onInstalled.addListener((details) => {
  const t = self.PURELY_I18N.t;
  const lang = self.PURELY_I18N.DEFAULT_LANG;

  chrome.contextMenus.create({ id: MENU_IDS.clean, title: t(lang, 'menu.clean'), contexts: ['page'] });
  chrome.contextMenus.create({ id: MENU_IDS.cleanPrint, title: t(lang, 'menu.cleanPrint'), contexts: ['page'] });
  chrome.contextMenus.create({ id: MENU_IDS.restore, title: t(lang, 'menu.restore'), contexts: ['page'] });

  syncAutoCleanRegistrations();
  applyMenuLanguage();

  if (details.reason === 'install') {
    chrome.tabs.create({ url: chrome.runtime.getURL('src/welcome/welcome.html') });
  } else if (details.reason === 'update') {
    getLanguage().then((lang2) => {
      const version = chrome.runtime.getManifest().version;
      notify(t(lang2, 'notify.title'), t(lang2, 'notify.updated', { version }));
    });
  }
});

chrome.runtime.onStartup.addListener(() => {
  syncAutoCleanRegistrations();
  applyMenuLanguage();
});

function isRestrictedUrl(url) {
  return !url || /^(chrome|chrome-extension|edge|devtools|about|https:\/\/chrome\.google\.com\/webstore|https:\/\/chromewebstore\.google\.com)/i.test(url);
}

async function friendlyErrorMessage(tab) {
  const lang = await getLanguage();
  const t = self.PURELY_I18N.t;
  if (isRestrictedUrl(tab && tab.url)) {
    return t(lang, 'notify.restrictedPage');
  }
  return t(lang, 'notify.genericError');
}

// Calls window.__PURELY_RUN__(action) directly without injecting anything first.
// Returns undefined (not a Promise result) if Purely's API isn't loaded in this tab yet -
// every real action result is always an object, so this is an unambiguous signal.
async function tryRunDirectly(tabId, action) {
  try {
    const [{ result } = {}] = await chrome.scripting.executeScript({
      target: { tabId },
      func: (a) => (window.__PURELY_RUN__ ? window.__PURELY_RUN__(a) : undefined),
      args: [action]
    });
    return result;
  } catch (e) {
    return undefined;
  }
}

async function runAction(tabId, action) {
  // Fast path: if content.js is already loaded in this tab (e.g. the user already
  // cleaned/restored it once since the last page load), skip re-injecting every file.
  const fastResult = await tryRunDirectly(tabId, action);
  if (fastResult !== undefined) return fastResult;

  // Slow path: first action on this page load - inject CSS and JS (in parallel, since
  // neither depends on the other completing first) then run the action for real.
  await Promise.all([
    chrome.scripting.insertCSS({ target: { tabId }, files: CSS_FILES }),
    chrome.scripting.executeScript({ target: { tabId }, files: CONTENT_FILES })
  ]);
  return tryRunDirectly(tabId, action);
}

async function notify(title, message) {
  try {
    await chrome.notifications.create({
      type: 'basic',
      iconUrl: 'assets/icons/icon128.png',
      title,
      message
    });
  } catch (e) { /* no permission or notifications blocked - ignore */ }
}

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab || !tab.id) return;
  const lang = await getLanguage();
  const t = self.PURELY_I18N.t;
  try {
    if (info.menuItemId === MENU_IDS.clean) {
      const res = await runAction(tab.id, 'clean');
      notify(t(lang, 'notify.title'), t(lang, 'notify.cleanedElements', { count: res.hiddenCount || 0 }));
    } else if (info.menuItemId === MENU_IDS.cleanPrint) {
      await runAction(tab.id, 'cleanAndPrint');
    } else if (info.menuItemId === MENU_IDS.restore) {
      await runAction(tab.id, 'restore');
    }
  } catch (e) {
    notify(t(lang, 'notify.errorTitle'), await friendlyErrorMessage(tab));
  }
});

chrome.commands.onCommand.addListener(async (command) => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) return;
  try {
    if (command === 'clean-page') {
      await runAction(tab.id, 'clean');
    } else if (command === 'clean-and-print') {
      await runAction(tab.id, 'cleanAndPrint');
    }
  } catch (e) { /* restricted page - ignore */ }
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    try {
      if (msg.type === 'RUN_ACTION') {
        const tabId = msg.tabId || (await getActiveTabId());
        try {
          const result = await runAction(tabId, msg.action);
          sendResponse({ ok: true, result });
        } catch (actionError) {
          const tab = tabId ? await chrome.tabs.get(tabId).catch(() => null) : null;
          sendResponse({ ok: false, error: await friendlyErrorMessage(tab) });
        }
      } else if (msg.type === 'REQUEST_HOST_PERMISSION') {
        const granted = await chrome.permissions.request({ origins: ['<all_urls>'] });
        sendResponse({ ok: true, granted });
      } else if (msg.type === 'SYNC_AUTO_CLEAN') {
        await syncAutoCleanRegistrations();
        sendResponse({ ok: true });
      } else if (msg.type === 'SYNC_LANGUAGE') {
        await applyMenuLanguage();
        sendResponse({ ok: true });
      } else {
        sendResponse({ ok: false, error: 'unknown-message' });
      }
    } catch (e) {
      sendResponse({ ok: false, error: String(e && e.message || e) });
    }
  })();
  return true; // async response
});

async function getActiveTabId() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab && tab.id;
}

// --- Auto-clean on user-selected domains ---
async function syncAutoCleanRegistrations() {
  try {
    const { purelySettings } = await chrome.storage.local.get('purelySettings');
    const domains = (purelySettings && purelySettings.autoCleanDomains) || [];

    const existing = await chrome.scripting.getRegisteredContentScripts({ ids: [AUTO_SCRIPT_ID] });
    if (existing.length) {
      await chrome.scripting.unregisterContentScripts({ ids: [AUTO_SCRIPT_ID] });
    }

    if (!domains.length) return;

    const hasPermission = await chrome.permissions.contains({ origins: ['<all_urls>'] });
    if (!hasPermission) return;

    const matches = domains.map((d) => `*://*.${d.replace(/^\*?\.?/, '')}/*`);
    await chrome.scripting.registerContentScripts([
      {
        id: AUTO_SCRIPT_ID,
        matches,
        js: [...CONTENT_FILES, 'src/content/auto-clean.js'],
        css: CSS_FILES,
        runAt: 'document_idle'
      }
    ]);
  } catch (e) {
    console.warn('Purely: failed to sync auto-clean registrations', e);
  }
}
