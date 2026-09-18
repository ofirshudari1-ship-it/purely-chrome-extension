/*
 * Purely - lightweight in-app i18n (independent of chrome.i18n, so the user
 * can switch language from inside the app without depending on the browser's
 * own UI language). Default language is English; Hebrew is a full translation.
 */
(function (root) {
  var STRINGS = {
    en: {
      'brand.name': 'Purely',
      'brand.tagline': 'Clean pages for Print & PDF',

      'popup.toggleTitle': 'Clean this page',
      'popup.statusChecking': 'Checking status...',
      'popup.statusOriginal': 'Page is still in its original state',
      'popup.statusCleanedBadge': 'Cleaned',
      'popup.statusHiddenCount': 'Hid {count} elements',
      'popup.modeDeclutter': 'Declutter only',
      'popup.modeReader': 'Reader mode',
      'popup.exportButton': 'Export clean PDF',
      'popup.restoreButton': 'Restore original page',
      'popup.optionsLink': 'Settings',
      'popup.helpLink': 'Help',
      'popup.restrictedPage': "Can't run on this protected page",
      'popup.preparing': 'Preparing the page and opening print...',
      'popup.errorGeneric': 'Something went wrong. Try refreshing the page.',
      'popup.errorPrint': "Couldn't print this page. Refresh and try again.",
      'popup.errorRestore': 'Something went wrong while restoring the page.',
      'popup.noShortcut': 'Set a keyboard shortcut in the extension settings',
      'popup.shortcutHint': '{shortcut} = Clean + PDF',
      'popup.pickButton': 'Pick element to remove',
      'popup.pickHint': "Missed something? Click this, then click the element on the page - it's remembered on this site from now on.",
      'popup.typographyTitle': 'Reading size',
      'popup.fontSizeLabel': 'Text size',
      'popup.lineHeightLabel': 'Line spacing',

      'picker.bannerHint': 'Click any element to remove it - Esc to cancel',
      'picker.removedToast': 'Removed - will stay hidden on this site from now on',

      'welcome.heroTitle': 'Welcome to Purely',
      'welcome.heroSub': 'Purely strips ads, navigation and pop-ups from any web page, then gets it ready for print or a clean PDF - with your own logo.',
      'welcome.step1Title': 'Clean with one click',
      'welcome.step1Body': 'Click the Purely icon in your toolbar (you may need to pin it 📌) and turn on "Clean this page".',
      'welcome.step2Title': 'Pick a mode',
      'welcome.step2Body': '"Declutter only" keeps the original layout. "Reader mode" rebuilds a fully clean reading view - like Reader View.',
      'welcome.step3Title': 'Export a branded PDF',
      'welcome.step3Body': 'Click "Export clean PDF" - the print dialog opens with your logo and header. Choose "Save as PDF" and you\'re done.',
      'welcome.tip': '💡 Tip: right-click any page and choose Purely from the menu, or use the keyboard shortcuts <kbd>Ctrl+Shift+K</kbd> to clean quickly and <kbd>Ctrl+Shift+P</kbd> to clean + PDF.',
      'welcome.openSettings': 'Open full settings',
      'welcome.openHelp': 'Help & FAQ',
      'welcome.start': 'Start browsing',
      'welcome.privacyLine': '🔒 Purely runs entirely locally in your browser - no external servers, no data collection.',
      'welcome.versionLine': 'Version {version}',

      'options.pageTitle': 'Purely Settings',
      'options.pageSubtitle': 'Full control over what gets cleaned, how it looks, and how your PDF is branded.',
      'options.navCategories': 'Categories',
      'options.navMode': 'Mode',
      'options.navCustomCss': 'Custom CSS',
      'options.navAutoClean': 'Auto-clean',
      'options.navBranding': 'PDF branding',
      'options.navHelp': 'Help',

      'options.section1.title': '1. Categories to clean',
      'options.section1.hint': 'Choose which kinds of elements get removed when you clean a page.',
      'cat.ads': 'Ads',
      'cat.nav': 'Navigation bars & menus',
      'cat.sidebar': 'Sidebars',
      'cat.popups': 'Pop-ups & modals',
      'cat.cookie': 'Cookie / consent banners',
      'cat.social': 'Social share buttons',
      'cat.comments': 'Reader comments',
      'cat.related': 'Related / recommended articles',
      'cat.sticky': 'Sticky elements',
      'cat.footer': 'Footer',
      'cat.media': 'Background video / media',

      'options.section2.title': '2. Default mode',
      'options.section2.hint': '"Declutter only" keeps the page\'s original layout. "Reader mode" rebuilds a fully clean reading view using a local content-scoring engine (like Reader View) - runs entirely on your device, nothing is sent anywhere.',
      'options.modeDeclutterLabel': 'Declutter only (keeps layout)',
      'options.modeReaderLabel': 'Reader mode (reading layout)',
      'options.rememberModePerSite': 'Remember the mode I choose, per site',
      'options.rememberModePerSiteHint': 'When on, switching mode from the popup on a specific site is remembered for that site - other sites keep using the default above.',

      'options.navAppearance': 'Appearance',
      'options.section6.title': '6. Appearance',
      'options.section6.hint': "Choose how Purely's own popup, settings, welcome and help pages look - independent of your system's theme.",
      'options.themeSystem': 'Match system',
      'options.themeLight': 'Light',
      'options.themeDark': 'Dark',

      'options.navPerSite': 'Per-site removals',
      'options.section7.title': '7. Per-site removals (from "Pick element to remove")',
      'options.section7.hint': 'Elements you picked directly on a page (popup → "Pick element to remove") are remembered per site and applied automatically every time you clean that site. Remove any of them here.',
      'options.perSiteEmpty': "No per-site picks yet - use \"Pick element to remove\" in the popup on a page first.",
      'options.perSiteRemoveTitle': 'Remove this saved selector',

      'options.section3.title': '3. Custom CSS selectors',
      'options.section3.hint': 'Advanced: one selector per line. "Always remove" overrides the defaults; "Always keep" blocks removal even if the category is checked.',
      'options.customRemoveLabel': 'Always remove (one CSS selector per line)',
      'options.customKeepLabel': 'Always keep (one CSS selector per line)',
      'options.invalidSelectorOne': 'Invalid selector: {list}',
      'options.invalidSelectorMany': 'Invalid selectors: {list}',

      'options.section4.title': '4. Auto-clean on domains',
      'options.section4.hint': "Pages on this list are cleaned automatically as soon as they load, no click needed. Requires site access permission (you'll be asked when you click the button).",
      'options.domainPlaceholder': 'example.com',
      'options.addButton': 'Add',
      'options.domainEmpty': 'No domains yet',
      'options.domainInvalid': 'Enter a valid domain, e.g. example.com',
      'options.domainDuplicate': 'That domain is already in the list',
      'options.grantPermission': 'Grant site access permission',
      'options.permissionGranted': '✓ Permission granted - auto-clean is active',
      'options.permissionMissing': "Not granted yet - auto-clean won't run until you approve",
      'options.permissionJustGranted': '✓ Permission approved',

      'options.section5.title': '5. PDF branding',
      'options.section5.hint': 'Add a logo and fixed text that will appear in the header/footer of every PDF you export.',
      'options.noLogo': 'No logo',
      'options.logoAlt': 'Logo',
      'options.removeLogo': 'Remove logo',
      'options.removeDomainTitle': 'Remove',
      'options.logoInvalidType': 'Please upload an image file only (PNG, JPG, SVG, WebP)',
      'options.logoTooLarge': 'File is too large - the maximum size is 2MB',
      'options.logoReadError': 'Could not read the file, try another one',
      'options.headerTextLabel': 'Header text (default: page title)',
      'options.headerTextPlaceholder': 'e.g. My Company Name',
      'options.footerTextLabel': 'Footer text',
      'options.footerTextPlaceholder': 'Generated with Purely',
      'options.showDate': 'Show date',
      'options.showUrl': 'Show page URL',
      'options.showPageTitle': 'Show page title',

      'options.save': 'Save settings',
      'options.reset': 'Reset to defaults',
      'options.resetConfirm': 'Reset all settings to their defaults?',
      'options.unsavedChanges': 'You have unsaved changes',
      'options.saveSuccess': '✓ Saved successfully',
      'options.resetSuccess': '✓ Reset to defaults',
      'options.saveBlockedSelectors': '✗ Fix the invalid CSS selectors before saving',

      'options.privacyTitle': '🔒 Privacy',
      'options.privacyBody': 'Purely runs entirely locally in your browser. It never sends data to an external server, collects no analytics, and your logo/settings are stored only on your computer (chrome.storage.local).',
      'options.footerVersion': 'Purely version {version} · runs entirely locally in your browser, no external servers',

      'help.pageTitle': 'Purely Help & FAQ',
      'help.pageSubtitle': 'Everything you need to get the most out of Purely.',
      'help.gettingStartedTitle': 'Getting started',
      'help.gettingStarted1': 'Click the Purely icon in the toolbar and turn on "Clean this page" to hide ads, navigation and pop-ups.',
      'help.gettingStarted2': 'Pick "Declutter only" to keep the original layout, or "Reader mode" for a fully clean reading view.',
      'help.gettingStarted3': 'Click "Export clean PDF" to open the print dialog with your branding already applied - choose "Save as PDF".',
      'help.shortcutsTitle': 'Keyboard shortcuts',
      'help.shortcutClean': 'Clean the current page',
      'help.shortcutPrint': 'Clean the page and open print / PDF export',
      'help.shortcutsNote': 'You can change these shortcuts any time at chrome://extensions/shortcuts.',
      'help.faqTitle': 'Frequently asked questions',
      'help.faq1Q': 'Does Purely send my browsing data anywhere?',
      'help.faq1A': 'No. Purely runs entirely inside your browser. It never sends page content, browsing history, or settings to any external server. Your logo and settings are stored only on your own computer.',
      'help.faq2Q': "Cleaning didn't remove something on a specific site - what can I do?",
      'help.faq2A': 'Open Settings → "Custom CSS selectors" and add a CSS selector for that element under "Always remove". If you\'re not sure of the selector, right-click the element, choose Inspect, and copy a class or id from the highlighted HTML.',
      'help.faq3Q': "Cleaning removed something I actually wanted to keep - what can I do?",
      'help.faq3A': 'Add that element\'s CSS selector under "Always keep" in Settings → "Custom CSS selectors". It will never be hidden, even if its category is enabled.',
      'help.faq4Q': 'How do I add my logo to exported PDFs?',
      'help.faq4A': 'Open Settings → "PDF branding", upload a logo image (PNG/JPG/SVG/WebP, up to 2MB), and optionally set header/footer text. It will appear only in the printed/PDF version, never while browsing.',
      'help.faq5Q': 'How do I make a site clean automatically, without clicking anything?',
      'help.faq5A': 'Open Settings → "Auto-clean on domains", add the domain, and click "Grant site access permission" once. From then on, that site is cleaned automatically on every page load.',
      'help.faq6Q': 'How do I update Purely without losing my settings?',
      'help.faq6A': 'Just replace the extension folder with the new version\'s files, then click the reload icon (⟳) on the Purely card at chrome://extensions. No need to remove and re-add it - your settings, logo and domain list all stay exactly as they were.',
      'help.faq7Q': "Why can't Purely clean chrome:// pages or the Chrome Web Store?",
      'help.faq7A': "Chrome blocks extensions from running on its own internal pages and on the Web Store, for security reasons. This isn't something Purely can work around.",
      'help.faq8Q': 'Does "Reader mode" use AI, or send my page to a server to be analyzed?',
      'help.faq8A': 'No. Reader mode uses a scoring engine that runs entirely inside your browser - it weighs things like paragraph density, link ratio, and common class/id naming patterns to guess which part of the page is the real article, similar in spirit to Firefox\'s Reader View. It is not a hosted AI/LLM model, and the page is never sent anywhere for it to work - the whole point of Purely is that nothing leaves your browser.',
      'help.faq9Q': "Is there an easier way than writing a CSS selector by hand?",
      'help.faq9A': 'Yes - click "Pick element to remove" in the popup, then click the element on the page. It\'s hidden immediately and remembered automatically for that site, so it stays hidden on every future visit. Manage or undo any of these per-site picks any time in Settings → "Per-site removals".',
      'help.backToSettings': '← Back to settings',
      'help.backToPopup': 'Close',

      'menu.clean': 'Purely: Clean this page',
      'menu.cleanPrint': 'Purely: Clean & Print / Export PDF',
      'menu.restore': 'Purely: Restore original page',
      'notify.title': 'Purely',
      'notify.errorTitle': 'Purely - Error',
      'notify.cleanedElements': 'Hid {count} elements on the page',
      'notify.restrictedPage': "Can't run on a protected Chrome page (such as chrome:// or the Web Store).",
      'notify.genericError': 'Something went wrong cleaning the page. Try refreshing and trying again.',
      'notify.updated': 'Updated to v{version} - click the icon to see what\'s new.'
    },

    he: {
      'brand.name': 'Purely',
      'brand.tagline': 'ניקוי עמודים להדפסה ו-PDF',

      'popup.toggleTitle': 'נקה את העמוד',
      'popup.statusChecking': 'בודק מצב...',
      'popup.statusOriginal': 'העמוד עדיין במצב מקורי',
      'popup.statusCleanedBadge': 'נוקה',
      'popup.statusHiddenCount': 'הוסתרו {count} אלמנטים',
      'popup.modeDeclutter': 'ניקוי בלבד',
      'popup.modeReader': 'קורא נקי',
      'popup.exportButton': 'ייצוא ל-PDF נקי',
      'popup.restoreButton': 'שחזור העמוד המקורי',
      'popup.optionsLink': 'הגדרות',
      'popup.helpLink': 'עזרה',
      'popup.restrictedPage': 'לא ניתן לפעול בעמוד מוגן זה',
      'popup.preparing': 'מכין את העמוד ופותח הדפסה...',
      'popup.errorGeneric': 'משהו השתבש. אפשר לנסות לרענן את העמוד.',
      'popup.errorPrint': 'לא ניתן להדפיס עמוד זה. נסה לרענן ולנסות שוב.',
      'popup.errorRestore': 'משהו השתבש בשחזור העמוד.',
      'popup.noShortcut': 'הגדר קיצור מקלדת בהגדרות התוסף',
      'popup.shortcutHint': '{shortcut} = ניקוי + PDF',
      'popup.pickButton': 'בחר אלמנט להסרה',
      'popup.pickHint': 'משהו לא נוקה? לחץ כאן, ואז לחץ על האלמנט בעמוד - הוא ייזכר באתר הזה מעכשיו.',
      'popup.typographyTitle': 'גודל קריאה',
      'popup.fontSizeLabel': 'גודל טקסט',
      'popup.lineHeightLabel': 'ריווח שורות',

      'picker.bannerHint': 'לחץ על כל אלמנט כדי להסיר אותו - Esc לביטול',
      'picker.removedToast': 'הוסר - יישאר מוסתר באתר הזה מעכשיו',

      'welcome.heroTitle': 'ברוכים הבאים ל-Purely',
      'welcome.heroSub': 'Purely מנקה כל עמוד אינטרנט מפרסומות, ניווט וקופצים - ומכין אותו להדפסה או ל-PDF נקי, עם הלוגו שלך.',
      'welcome.step1Title': 'נקה בלחיצה אחת',
      'welcome.step1Body': 'לחץ על סמל Purely בסרגל הכלים (אולי תצטרך להצמיד אותו עם סיכה 📌) והפעל את "נקה את העמוד".',
      'welcome.step2Title': 'בחר מצב',
      'welcome.step2Body': '"ניקוי בלבד" שומר על הפריסה המקורית. "קורא נקי" בונה עמוד קריאה נקי לגמרי - כמו Reader View.',
      'welcome.step3Title': 'ייצוא ל-PDF ממותג',
      'welcome.step3Body': 'לחץ "ייצוא ל-PDF נקי" - נפתח דיאלוג ההדפסה עם לוגו וכותרת משלך. בחר "Save as PDF" ואתה מוכן.',
      'welcome.tip': '💡 טיפ: אפשר גם ללחוץ קליק ימני על כל עמוד ולבחור Purely מהתפריט, או להשתמש בקיצורי המקלדת <kbd>Ctrl+Shift+K</kbd> לניקוי מהיר ו-<kbd>Ctrl+Shift+P</kbd> לניקוי + PDF.',
      'welcome.openSettings': 'פתח הגדרות מלאות',
      'welcome.openHelp': 'עזרה ושאלות נפוצות',
      'welcome.start': 'התחל לגלוש',
      'welcome.privacyLine': '🔒 Purely פועל כולו מקומית בדפדפן שלך - בלי שרתים חיצוניים, בלי איסוף מידע.',
      'welcome.versionLine': 'גרסה {version}',

      'options.pageTitle': 'הגדרות Purely',
      'options.pageSubtitle': 'שליטה מלאה על מה שמנוקה, איך זה נראה, ואיך ה-PDF שלך ממותג.',
      'options.navCategories': 'קטגוריות',
      'options.navMode': 'מצב',
      'options.navCustomCss': 'CSS מותאם',
      'options.navAutoClean': 'ניקוי אוטומטי',
      'options.navBranding': 'מיתוג PDF',
      'options.navHelp': 'עזרה',

      'options.section1.title': '1. קטגוריות לניקוי',
      'options.section1.hint': 'בחר אילו סוגי אלמנטים יוסרו מהעמוד בעת ניקוי.',
      'cat.ads': 'פרסומות',
      'cat.nav': 'סרגלי ניווט ותפריטים',
      'cat.sidebar': 'סרגלים צדדיים',
      'cat.popups': 'קופצים וחלונות מודל',
      'cat.cookie': 'באנרי עוגיות והסכמה',
      'cat.social': 'כפתורי שיתוף חברתי',
      'cat.comments': 'תגובות גולשים',
      'cat.related': 'כתבות קשורות / מומלצות',
      'cat.sticky': 'אלמנטים דביקים (Sticky)',
      'cat.footer': 'פוטר / כותרת תחתונה',
      'cat.media': 'וידאו ומדיה ברקע',

      'options.section2.title': '2. מצב ברירת מחדל',
      'options.section2.hint': '"ניקוי בלבד" שומר על הפריסה המקורית של העמוד. "קורא נקי" בונה מחדש עמוד קריאה נקי באמצעות מנוע ניקוד תוכן מקומי (כמו Reader View) - רץ כולו על המכשיר שלך, שום דבר לא נשלח לשום מקום.',
      'options.modeDeclutterLabel': 'ניקוי בלבד (שומר פריסה)',
      'options.modeReaderLabel': 'קורא נקי (פריסת קריאה)',
      'options.rememberModePerSite': 'זכור את המצב שבחרתי, לפי אתר',
      'options.rememberModePerSiteHint': 'כשמופעל, החלפת מצב מהפופאפ באתר מסוים נזכרת עבור אותו אתר - אתרים אחרים ימשיכו להשתמש בברירת המחדל למעלה.',

      'options.navAppearance': 'מראה',
      'options.section6.title': '6. מראה',
      'options.section6.hint': 'בחר איך העמודים של Purely עצמו - הפופאפ, ההגדרות, ברוכים הבאים ועזרה - נראים, ללא קשר לערכת הנושא של המערכת שלך.',
      'options.themeSystem': 'תואם למערכת',
      'options.themeLight': 'בהיר',
      'options.themeDark': 'כהה',

      'options.navPerSite': 'הסרות לפי אתר',
      'options.section7.title': '7. הסרות לפי אתר (מ-"בחר אלמנט להסרה")',
      'options.section7.hint': 'אלמנטים שבחרת ישירות בעמוד (פופאפ ← "בחר אלמנט להסרה") נזכרים לפי אתר ומוחלים אוטומטית בכל ניקוי של אותו אתר. אפשר להסיר כל אחד מהם כאן.',
      'options.perSiteEmpty': 'אין עדיין בחירות לפי אתר - השתמש ב"בחר אלמנט להסרה" בפופאפ בעמוד כלשהו קודם.',
      'options.perSiteRemoveTitle': 'הסר בורר שמור זה',

      'options.section3.title': '3. בוררי CSS מותאמים אישית',
      'options.section3.hint': 'למשתמשים מתקדמים: הוסף בורר אחד בכל שורה. "הסר תמיד" גובר על ברירת המחדל, "השאר תמיד" חוסם הסרה גם אם הקטגוריה מסומנת.',
      'options.customRemoveLabel': 'הסר תמיד (בורר CSS בכל שורה)',
      'options.customKeepLabel': 'השאר תמיד (בורר CSS בכל שורה)',
      'options.invalidSelectorOne': 'בורר לא תקין: {list}',
      'options.invalidSelectorMany': 'בוררים לא תקינים: {list}',

      'options.section4.title': '4. ניקוי אוטומטי בדומיינים',
      'options.section4.hint': 'עמודים ברשימה זו ינוקו אוטומטית עם הטעינה, בלי צורך ללחוץ על כלום. דורש הרשאה לגישה לאתרים (תתבקש בלחיצה על הכפתור).',
      'options.domainPlaceholder': 'example.com',
      'options.addButton': 'הוסף',
      'options.domainEmpty': 'אין דומיינים עדיין',
      'options.domainInvalid': 'הזן דומיין תקין, למשל example.com',
      'options.domainDuplicate': 'הדומיין הזה כבר ברשימה',
      'options.grantPermission': 'אשר הרשאת גישה לאתרים',
      'options.permissionGranted': '✓ הרשאה קיימת - ניקוי אוטומטי פעיל',
      'options.permissionMissing': 'טרם ניתנה הרשאה - הניקוי האוטומטי לא יפעל עד שתאשר',
      'options.permissionJustGranted': '✓ ההרשאה אושרה',

      'options.section5.title': '5. מיתוג ה-PDF',
      'options.section5.hint': 'הוסף לוגו וטקסט קבוע שיופיעו בכותרת/כותרת תחתונה של כל PDF שתייצא.',
      'options.noLogo': 'אין לוגו',
      'options.logoAlt': 'לוגו',
      'options.removeLogo': 'הסר לוגו',
      'options.removeDomainTitle': 'הסר',
      'options.logoInvalidType': 'יש להעלות קובץ תמונה בלבד (PNG, JPG, SVG, WebP)',
      'options.logoTooLarge': 'הקובץ גדול מדי - הגודל המקסימלי הוא 2MB',
      'options.logoReadError': 'קריאת הקובץ נכשלה, נסה קובץ אחר',
      'options.headerTextLabel': 'כותרת (ברירת מחדל: שם העמוד)',
      'options.headerTextPlaceholder': 'למשל: שם החברה שלי',
      'options.footerTextLabel': 'כותרת תחתונה',
      'options.footerTextPlaceholder': 'הופק באמצעות Purely',
      'options.showDate': 'הצג תאריך',
      'options.showUrl': 'הצג כתובת URL',
      'options.showPageTitle': 'הצג כותרת העמוד',

      'options.save': 'שמור הגדרות',
      'options.reset': 'איפוס לברירת מחדל',
      'options.resetConfirm': 'לאפס את כל ההגדרות לברירת המחדל?',
      'options.unsavedChanges': 'יש שינויים שלא נשמרו',
      'options.saveSuccess': '✓ נשמר בהצלחה',
      'options.resetSuccess': '✓ אופס לברירת מחדל',
      'options.saveBlockedSelectors': '✗ יש לתקן בוררי CSS לא תקינים לפני השמירה',

      'options.privacyTitle': '🔒 פרטיות',
      'options.privacyBody': 'Purely פועל כולו באופן מקומי בדפדפן שלך. הוא לא שולח נתונים לשום שרת חיצוני, לא אוסף אנליטיקס, והלוגו/ההגדרות נשמרים רק במחשב שלך (chrome.storage.local).',
      'options.footerVersion': 'Purely גרסה {version} · פועל מקומית בדפדפן שלך בלבד, ללא שרתים חיצוניים',

      'help.pageTitle': 'עזרה ושאלות נפוצות - Purely',
      'help.pageSubtitle': 'כל מה שצריך כדי להפיק את המקסימום מ-Purely.',
      'help.gettingStartedTitle': 'איך מתחילים',
      'help.gettingStarted1': 'לחץ על סמל Purely בסרגל הכלים והפעל את "נקה את העמוד" כדי להסתיר פרסומות, ניווט וקופצים.',
      'help.gettingStarted2': 'בחר "ניקוי בלבד" לשמירת הפריסה המקורית, או "קורא נקי" לתצוגת קריאה נקייה לגמרי.',
      'help.gettingStarted3': 'לחץ "ייצוא ל-PDF נקי" כדי לפתוח את דיאלוג ההדפסה כשהמיתוג שלך כבר מוחל - בחר "Save as PDF".',
      'help.shortcutsTitle': 'קיצורי מקלדת',
      'help.shortcutClean': 'ניקוי העמוד הנוכחי',
      'help.shortcutPrint': 'ניקוי העמוד ופתיחת הדפסה / ייצוא PDF',
      'help.shortcutsNote': 'ניתן לשנות את הקיצורים האלה בכל עת בכתובת chrome://extensions/shortcuts.',
      'help.faqTitle': 'שאלות נפוצות',
      'help.faq1Q': 'האם Purely שולח את המידע שלי לאיזשהו מקום?',
      'help.faq1A': 'לא. Purely פועל כולו בתוך הדפדפן שלך. הוא לעולם לא שולח תוכן עמודים, היסטוריית גלישה או הגדרות לשום שרת חיצוני. הלוגו וההגדרות שלך נשמרים רק על המחשב שלך.',
      'help.faq2Q': 'הניקוי לא הסיר משהו באתר מסוים - מה אפשר לעשות?',
      'help.faq2A': 'פתח הגדרות ← "בוררי CSS מותאמים אישית" והוסף בורר CSS לאותו אלמנט תחת "הסר תמיד". אם אינך בטוח מהו הבורר, לחץ קליק ימני על האלמנט, בחר Inspect, והעתק class או id מה-HTML המסומן.',
      'help.faq3Q': 'הניקוי הסיר משהו שדווקא רציתי לשמור - מה אפשר לעשות?',
      'help.faq3A': 'הוסף את בורר ה-CSS של האלמנט הזה תחת "השאר תמיד" בהגדרות ← "בוררי CSS מותאמים אישית". הוא לעולם לא יוסתר, גם אם הקטגוריה שלו מופעלת.',
      'help.faq4Q': 'איך מוסיפים לוגו ל-PDF שמיוצא?',
      'help.faq4A': 'פתח הגדרות ← "מיתוג ה-PDF", העלה קובץ לוגו (PNG/JPG/SVG/WebP, עד 2MB), ואפשר להגדיר גם טקסט כותרת/כותרת תחתונה. הוא יופיע רק בגרסת ההדפסה/PDF, לעולם לא בגלישה רגילה.',
      'help.faq5Q': 'איך גורמים לאתר להתנקות אוטומטית, בלי ללחוץ על כלום?',
      'help.faq5A': 'פתח הגדרות ← "ניקוי אוטומטי בדומיינים", הוסף את הדומיין, ולחץ פעם אחת על "אשר הרשאת גישה לאתרים". מרגע זה, האתר הזה ינוקה אוטומטית בכל טעינת עמוד.',
      'help.faq6Q': 'איך מעדכנים את Purely בלי לאבד את ההגדרות?',
      'help.faq6A': 'פשוט מחליפים את תיקיית התוסף בקבצי הגרסה החדשה, ואז לוחצים על סמל הרענון (⟳) בכרטיס של Purely בכתובת chrome://extensions. אין צורך להסיר ולהוסיף מחדש - ההגדרות, הלוגו ורשימת הדומיינים נשארים בדיוק כפי שהיו.',
      'help.faq7Q': 'למה Purely לא יכול לנקות עמודי chrome:// או את חנות התוספים?',
      'help.faq7A': 'Chrome חוסם תוספים מלפעול בעמודים הפנימיים שלו ובחנות התוספים, מסיבות אבטחה. זה לא משהו ש-Purely יכול לעקוף.',
      'help.faq8Q': 'האם "קורא נקי" משתמש בבינה מלאכותית, או שולח את העמוד שלי לשרת כדי לנתח אותו?',
      'help.faq8A': 'לא. "קורא נקי" משתמש במנוע ניקוד שרץ כולו בתוך הדפדפן שלך - הוא שוקל דברים כמו צפיפות פסקאות, יחס קישורים, ותבניות שם class/id נפוצות כדי לנחש איזה חלק בעמוד הוא הכתבה האמיתית, ברוח דומה ל-Reader View של Firefox. זה לא מודל AI/LLM מתארח בענן, והעמוד אף פעם לא נשלח לשום מקום כדי שזה יעבוד - כל הרעיון של Purely הוא שכלום לא יוצא מהדפדפן שלך.',
      'help.faq9Q': 'יש דרך קלה יותר מלכתוב בורר CSS ידנית?',
      'help.faq9A': 'כן - לחץ "בחר אלמנט להסרה" בפופאפ, ואז לחץ על האלמנט בעמוד. הוא מוסתר מיד ונזכר אוטומטית עבור האתר הזה, כך שהוא יישאר מוסתר בכל ביקור עתידי. אפשר לנהל או לבטל כל בחירה כזו בכל עת בהגדרות ← "הסרות לפי אתר".',
      'help.backToSettings': '→ חזרה להגדרות',
      'help.backToPopup': 'סגור',

      'menu.clean': 'Purely: נקה את העמוד',
      'menu.cleanPrint': 'Purely: נקה והדפס / ייצוא ל-PDF',
      'menu.restore': 'Purely: שחזר עמוד מקורי',
      'notify.title': 'Purely',
      'notify.errorTitle': 'Purely - שגיאה',
      'notify.cleanedElements': 'הוסתרו {count} אלמנטים מהעמוד',
      'notify.restrictedPage': 'לא ניתן לפעול בעמוד מוגן של Chrome (כגון chrome:// או חנות התוספים).',
      'notify.genericError': 'משהו השתבש בניקוי העמוד. נסה לרענן את הדף ולנסות שוב.',
      'notify.updated': 'עודכן לגרסה {version} - לחץ על הסמל כדי לראות מה חדש.'
    }
  };

  var DEFAULT_LANG = 'en';

  // Security note: every string in STRINGS above is authored by us, never derived from
  // page content, user input, or a network response - so interpolate()/t() never handle
  // untrusted data. The one exception that matters is data-i18n-html below: only keys
  // listed here may be rendered via innerHTML, and only ever with static markup (no
  // {vars}), so a future translation key can never accidentally become an XSS sink.
  var HTML_SAFE_KEYS = { 'welcome.tip': true };

  function interpolate(str, vars) {
    if (!vars) return str;
    return str.replace(/\{(\w+)\}/g, function (m, key) {
      return Object.prototype.hasOwnProperty.call(vars, key) ? vars[key] : m;
    });
  }

  function t(lang, key, vars) {
    var table = STRINGS[lang] || STRINGS[DEFAULT_LANG];
    var str = table[key] || STRINGS[DEFAULT_LANG][key] || key;
    return interpolate(str, vars);
  }

  // מחיל תרגום על כל אלמנט עם data-i18n בעמוד הנוכחי, וקובע כיוון/שפה על ה-<html>.
  function apply(lang) {
    var dir = lang === 'he' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', dir);

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      var wantsHtml = el.getAttribute('data-i18n-html') !== null;
      var text = t(lang, key);
      if (wantsHtml && HTML_SAFE_KEYS[key]) {
        el.innerHTML = text;
      } else {
        el.textContent = text;
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      el.setAttribute('placeholder', t(lang, el.getAttribute('data-i18n-placeholder')));
    });

    document.querySelectorAll('[data-i18n-title]').forEach(function (el) {
      el.setAttribute('title', t(lang, el.getAttribute('data-i18n-title')));
    });
  }

  root.PURELY_I18N = {
    DEFAULT_LANG: DEFAULT_LANG,
    SUPPORTED: ['en', 'he'],
    t: t,
    apply: apply
  };
})(typeof window !== 'undefined' ? window : this);
