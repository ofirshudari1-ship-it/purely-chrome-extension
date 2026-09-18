(function () {
  const DEFAULTS = window.PURELY_DEFAULTS.DEFAULT_SETTINGS;
  const CATEGORY_ORDER = window.PURELY_DEFAULTS.CATEGORY_ORDER;
  const isValidSelector = window.PURELY_DEFAULTS.isValidSelector;
  const MAX_LOGO_BYTES = 2 * 1024 * 1024;

  const I18N = window.PURELY_I18N;
  let lang = I18N.DEFAULT_LANG;
  function t(key, vars) { return I18N.t(lang, key, vars); }

  const langSwitch = document.getElementById('langSwitch');
  const categoriesGrid = document.getElementById('categoriesGrid');
  const customRemove = document.getElementById('customRemove');
  const customKeep = document.getElementById('customKeep');
  const customRemoveError = document.getElementById('customRemoveError');
  const customKeepError = document.getElementById('customKeepError');
  const domainInput = document.getElementById('domainInput');
  const addDomainBtn = document.getElementById('addDomainBtn');
  const domainList = document.getElementById('domainList');
  const domainError = document.getElementById('domainError');
  const grantPermissionBtn = document.getElementById('grantPermissionBtn');
  const permissionStatus = document.getElementById('permissionStatus');
  const logoInput = document.getElementById('logoInput');
  const logoPreview = document.getElementById('logoPreview');
  const logoError = document.getElementById('logoError');
  const removeLogoBtn = document.getElementById('removeLogoBtn');
  const headerText = document.getElementById('headerText');
  const footerText = document.getElementById('footerText');
  const showDate = document.getElementById('showDate');
  const showUrl = document.getElementById('showUrl');
  const showPageTitle = document.getElementById('showPageTitle');
  const rememberModePerSite = document.getElementById('rememberModePerSite');
  const perSiteList = document.getElementById('perSiteList');
  const saveBtn = document.getElementById('saveBtn');
  const resetBtn = document.getElementById('resetBtn');
  const saveStatus = document.getElementById('saveStatus');
  const dirtyIndicator = document.getElementById('dirtyIndicator');
  const pageFooter = document.getElementById('pageFooter');
  const mainEl = document.querySelector('main.purely-container');

  let current = deepClone(DEFAULTS);
  let domains = [];
  let isDirty = false;
  let lastPermissionGranted = null;

  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function markDirty() {
    if (isDirty) return;
    isDirty = true;
    dirtyIndicator.classList.add('is-visible');
  }

  function clearDirty() {
    isDirty = false;
    dirtyIndicator.classList.remove('is-visible');
  }

  window.addEventListener('beforeunload', (e) => {
    if (!isDirty) return;
    e.preventDefault();
    e.returnValue = '';
  });

  function buildCategoryCheckboxes(state) {
    const previousChecked = {};
    categoriesGrid.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
      previousChecked[cb.dataset.category] = cb.checked;
    });
    const source = Object.keys(previousChecked).length ? previousChecked : state;

    categoriesGrid.innerHTML = '';
    CATEGORY_ORDER.forEach((key) => {
      const label = document.createElement('label');
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.dataset.category = key;
      input.checked = !!source[key];
      label.appendChild(input);
      label.appendChild(document.createTextNode(t('cat.' + key)));
      categoriesGrid.appendChild(label);
    });
  }

  // Flattens { hostname: string[] } into a sorted list of { hostname, selector } rows for
  // display, and re-persists the map (not the form's own settings object) on removal -
  // this section reflects live storage state rather than the current draft, since picks
  // made on a page can happen at any time, independent of unsaved edits on this page.
  function renderPerSiteList() {
    perSiteList.innerHTML = '';
    const map = current.perSiteExtraSelectors || {};
    const rows = [];
    Object.keys(map).sort().forEach((hostname) => {
      (map[hostname] || []).forEach((selector) => rows.push({ hostname, selector }));
    });

    if (!rows.length) {
      const li = document.createElement('li');
      li.className = 'purely-empty';
      li.textContent = t('options.perSiteEmpty');
      perSiteList.appendChild(li);
      return;
    }

    rows.forEach(({ hostname, selector }) => {
      const li = document.createElement('li');
      const label = document.createElement('span');
      label.className = 'purely-persite-row';
      const hostSpan = document.createElement('span');
      hostSpan.className = 'purely-persite-host';
      hostSpan.textContent = hostname;
      const selSpan = document.createElement('code');
      selSpan.className = 'purely-persite-selector';
      selSpan.textContent = selector;
      label.appendChild(hostSpan);
      label.appendChild(selSpan);
      li.appendChild(label);

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = '×';
      btn.title = t('options.perSiteRemoveTitle');
      btn.addEventListener('click', async () => {
        const updatedList = (current.perSiteExtraSelectors[hostname] || []).filter((s) => s !== selector);
        const updatedMap = Object.assign({}, current.perSiteExtraSelectors);
        if (updatedList.length) {
          updatedMap[hostname] = updatedList;
        } else {
          delete updatedMap[hostname];
        }
        current = Object.assign({}, current, { perSiteExtraSelectors: updatedMap });
        renderPerSiteList();
        await chrome.storage.local.set({ purelySettings: current });
        chrome.runtime.sendMessage({ type: 'SYNC_AUTO_CLEAN' }, () => {});
      });
      li.appendChild(btn);
      perSiteList.appendChild(li);
    });
  }

  function renderDomainList() {
    domainList.innerHTML = '';
    if (!domains.length) {
      const li = document.createElement('li');
      li.className = 'purely-empty';
      li.textContent = t('options.domainEmpty');
      domainList.appendChild(li);
      return;
    }
    domains.forEach((domain, idx) => {
      const li = document.createElement('li');
      li.textContent = domain;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = '×';
      btn.title = t('options.removeDomainTitle');
      btn.addEventListener('click', () => {
        domains.splice(idx, 1);
        renderDomainList();
        markDirty();
      });
      li.appendChild(btn);
      domainList.appendChild(li);
    });
  }

  function normalizeDomain(value) {
    return value
      .trim()
      .replace(/^https?:\/\//i, '')
      .replace(/^www\./i, '')
      .replace(/\/.*$/, '')
      .toLowerCase();
  }

  // Only real hostnames (letters/digits/hyphens, at least one dot) are accepted - this
  // catches typos and stray characters (e.g. a leftover "*" or "_") here with a clear
  // message, instead of the domain silently failing to register as a match pattern later.
  const DOMAIN_RE = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/i;
  function isValidDomain(value) {
    return DOMAIN_RE.test(value);
  }

  function renderLogoPreview(dataUrl) {
    if (dataUrl) {
      logoPreview.innerHTML = '';
      const img = document.createElement('img');
      img.src = dataUrl;
      img.alt = t('options.logoAlt');
      logoPreview.appendChild(img);
    } else {
      logoPreview.textContent = t('options.noLogo');
    }
  }

  function validateSelectorsField(textarea, errorEl) {
    const lines = textarea.value.split('\n').map((s) => s.trim()).filter(Boolean);
    const invalid = lines.filter((sel) => !isValidSelector(sel));
    textarea.classList.toggle('has-error', invalid.length > 0);
    errorEl.textContent = invalid.length
      ? t(invalid.length > 1 ? 'options.invalidSelectorMany' : 'options.invalidSelectorOne', { list: invalid.join(', ') })
      : '';
    return invalid.length === 0;
  }

  function populateForm(settings) {
    buildCategoryCheckboxes(settings.categories || {});

    document.querySelectorAll('input[name="mode"]').forEach((r) => {
      r.checked = r.value === (settings.mode || 'declutter');
    });
    rememberModePerSite.checked = !!settings.rememberModePerSite;

    document.querySelectorAll('input[name="theme"]').forEach((r) => {
      r.checked = r.value === (settings.theme || 'system');
    });

    customRemove.value = settings.customRemoveSelectors || '';
    customKeep.value = settings.customKeepSelectors || '';
    validateSelectorsField(customRemove, customRemoveError);
    validateSelectorsField(customKeep, customKeepError);

    domains = (settings.autoCleanDomains || []).slice();
    renderDomainList();
    renderPerSiteList();

    const branding = settings.branding || {};
    renderLogoPreview(branding.logoDataUrl);
    headerText.value = branding.headerText || '';
    footerText.value = branding.footerText || '';
    showDate.checked = branding.showDate !== false;
    showUrl.checked = branding.showUrl !== false;
    showPageTitle.checked = branding.showPageTitle !== false;
  }

  function collectForm() {
    const categories = {};
    categoriesGrid.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
      categories[cb.dataset.category] = cb.checked;
    });

    const modeInput = document.querySelector('input[name="mode"]:checked');
    const themeInput = document.querySelector('input[name="theme"]:checked');

    return {
      language: lang,
      theme: themeInput ? themeInput.value : 'system',
      categories,
      mode: modeInput ? modeInput.value : 'declutter',
      rememberModePerSite: rememberModePerSite.checked,
      // Not editable from this page (set automatically from the popup, or by the
      // "Pick element to remove" tool on the page itself) - carry both forward so
      // saving settings here never wipes them out.
      perSiteMode: current.perSiteMode || {},
      perSiteExtraSelectors: current.perSiteExtraSelectors || {},
      readerTypography: current.readerTypography || DEFAULTS.readerTypography,
      autoCleanDomains: domains,
      customRemoveSelectors: customRemove.value,
      customKeepSelectors: customKeep.value,
      branding: {
        logoDataUrl: logoPreview.querySelector('img') ? logoPreview.querySelector('img').src : '',
        headerText: headerText.value,
        footerText: footerText.value,
        showDate: showDate.checked,
        showUrl: showUrl.checked,
        showPageTitle: showPageTitle.checked
      }
    };
  }

  // Applies the chosen appearance immediately (no need to hit Save to preview it) -
  // 'system' removes the override so the page falls back to following the OS theme.
  function applyTheme(theme) {
    if (theme && theme !== 'system') {
      document.documentElement.setAttribute('data-theme', theme);
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }

  async function loadSettings() {
    const { purelySettings } = await chrome.storage.local.get('purelySettings');
    current = window.PURELY_DEFAULTS.mergeSettings(DEFAULTS, purelySettings);
    lang = current.language || I18N.DEFAULT_LANG;
    applyLanguageToUI();
    applyTheme(current.theme);
    populateForm(current);
    await refreshPermissionStatus();
    clearDirty();
  }

  async function refreshPermissionStatus() {
    const granted = await chrome.permissions.contains({ origins: ['<all_urls>'] });
    lastPermissionGranted = granted;
    permissionStatus.textContent = granted ? t('options.permissionGranted') : t('options.permissionMissing');
  }

  function showFooterInfo() {
    try {
      const version = chrome.runtime.getManifest().version;
      pageFooter.textContent = t('options.footerVersion', { version });
    } catch (e) { /* not critical */ }
  }

  function applyLanguageToUI() {
    I18N.apply(lang);
    langSwitch.querySelectorAll('button').forEach((b) => {
      b.classList.toggle('active', b.dataset.lang === lang);
    });
    buildCategoryCheckboxes(current.categories || {});
    renderDomainList();
    renderPerSiteList();
    renderLogoPreview(logoPreview.querySelector('img') ? logoPreview.querySelector('img').src : '');
    validateSelectorsField(customRemove, customRemoveError);
    validateSelectorsField(customKeep, customKeepError);
    if (lastPermissionGranted !== null) {
      permissionStatus.textContent = lastPermissionGranted ? t('options.permissionGranted') : t('options.permissionMissing');
    }
    showFooterInfo();
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

  // Tracks changes on every field to show "You have unsaved changes"
  // (domain input and file input have their own dedicated handling below).
  function isTrackedField(el) {
    return el && el.id !== 'domainInput' && el.id !== 'logoInput';
  }
  mainEl.addEventListener('input', (e) => { if (isTrackedField(e.target)) markDirty(); });
  mainEl.addEventListener('change', (e) => { if (isTrackedField(e.target)) markDirty(); });

  customRemove.addEventListener('input', () => validateSelectorsField(customRemove, customRemoveError));
  customKeep.addEventListener('input', () => validateSelectorsField(customKeep, customKeepError));

  document.querySelectorAll('input[name="theme"]').forEach((r) => {
    r.addEventListener('change', () => applyTheme(r.value));
  });

  addDomainBtn.addEventListener('click', () => {
    const value = normalizeDomain(domainInput.value);
    if (!value || !isValidDomain(value)) {
      domainError.textContent = t('options.domainInvalid');
      return;
    }
    if (domains.includes(value)) {
      domainError.textContent = t('options.domainDuplicate');
      return;
    }
    domainError.textContent = '';
    domains.push(value);
    domainInput.value = '';
    renderDomainList();
    markDirty();
  });

  domainInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addDomainBtn.click();
    }
  });

  grantPermissionBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'REQUEST_HOST_PERMISSION' }, async (res) => {
      await refreshPermissionStatus();
      if (res && res.granted) {
        permissionStatus.textContent = t('options.permissionJustGranted');
      }
    });
  });

  logoInput.addEventListener('change', () => {
    const file = logoInput.files && logoInput.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      logoError.textContent = t('options.logoInvalidType');
      logoInput.value = '';
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      logoError.textContent = t('options.logoTooLarge');
      logoInput.value = '';
      return;
    }

    logoError.textContent = '';
    const reader = new FileReader();
    reader.onload = () => {
      renderLogoPreview(reader.result);
      markDirty();
    };
    reader.onerror = () => {
      logoError.textContent = t('options.logoReadError');
    };
    reader.readAsDataURL(file);
  });

  removeLogoBtn.addEventListener('click', () => {
    renderLogoPreview('');
    logoInput.value = '';
    logoError.textContent = '';
    markDirty();
  });

  saveBtn.addEventListener('click', async () => {
    const removeValid = validateSelectorsField(customRemove, customRemoveError);
    const keepValid = validateSelectorsField(customKeep, customKeepError);

    if (!removeValid || !keepValid) {
      saveStatus.classList.add('is-error');
      saveStatus.textContent = t('options.saveBlockedSelectors');
      (removeValid ? customKeep : customRemove).focus();
      return;
    }

    const settings = collectForm();
    await chrome.storage.local.set({ purelySettings: settings });
    chrome.runtime.sendMessage({ type: 'SYNC_AUTO_CLEAN' }, () => {});
    saveStatus.classList.remove('is-error');
    saveStatus.textContent = t('options.saveSuccess');
    clearDirty();
    setTimeout(() => (saveStatus.textContent = ''), 2500);
  });

  resetBtn.addEventListener('click', async () => {
    if (!confirm(t('options.resetConfirm'))) return;
    current = deepClone(DEFAULTS);
    current.language = lang; // keep the language the user has already chosen
    populateForm(current);
    await chrome.storage.local.set({ purelySettings: current });
    chrome.runtime.sendMessage({ type: 'SYNC_AUTO_CLEAN' }, () => {});
    saveStatus.classList.remove('is-error');
    saveStatus.textContent = t('options.resetSuccess');
    clearDirty();
    setTimeout(() => (saveStatus.textContent = ''), 2500);
  });

  loadSettings();
})();
