# Privacy Policy — Purely

*Last updated: 2026-09-14*

## עברית

**Purely** הוא תוסף Chrome שמנקה עמודי אינטרנט (מסירים פרסומות, ניווט, פרסומות קופצות וכו')
לפני הדפסה או ייצוא PDF. התוסף **רץ כולו באופן מקומי בדפדפן שלך**. הוא אינו שולח שום תוכן
עמוד, הגדרות, או מידע מזהה לשום שרת חיצוני — אין שרתי backend, אין אנליטיקס, אין טלמטריה.

**אילו נתונים נאספים:** ההגדרות שלך בלבד (קטגוריות לניקוי, סלקטורים מותאמים אישית, רשימת
דומיינים לניקוי אוטומטי, לוגו/טקסט למיתוג ה-PDF, שפה, ערכת נושא) — כל אלה נשמרים **רק על
המחשב שלך** דרך `chrome.storage.local`, ולעולם לא עוזבים אותו.

**מטרת כל הרשאה:**
- `activeTab`/`scripting` — מאפשרות לתוסף לנקות את העמוד הפעיל כשאתה לוחץ על הכפתור. הכרחי
  למטרה היחידה של התוסף (ניקוי עמודים).
- `optional_host_permissions: <all_urls>` — **לא מוענקת אוטומטית**; מתבקשת רק אם אתה בוחר
  להפעיל "ניקוי אוטומטי" על דומיינים ספציפיים שאתה עצמך מוסיף לרשימה.
- `storage` — שמירת ההגדרות שלך מקומית.
- `contextMenus`, `notifications` — תפריט קליק-ימני והתראות סטטוס.

**Reader Mode** מבוסס על מנוע ניקוד תוכן מקומי (`readability.js`) שרץ כולו בדפדפן — **אינו**
שירות AI/ענן חיצוני, ואינו שולח תוכן לשום מקום.

לשאלות: פנה למפתח התוסף דרך עמוד ה-Chrome Web Store של Purely.

## English

**Purely** is a Chrome extension that cleans web pages (strips ads, navigation, pop-ups, etc.)
before printing or PDF export. The extension **runs entirely locally in your browser**. It
never sends page content, settings, or any identifying information to an external server —
there is no backend, no analytics, no telemetry.

**Data collected:** only your own settings (categories to clean, custom CSS selectors,
auto-clean domain list, PDF branding logo/text, language, theme) — all stored **only on your
machine** via `chrome.storage.local`, and never leave it.

**Purpose of each permission:**
- `activeTab` / `scripting` — let the extension clean the currently active page when you click
  the action button. Necessary for the extension's single stated purpose (cleaning pages).
- `optional_host_permissions: <all_urls>` — **not granted automatically**; requested only if
  you opt into the "auto-clean on domain" feature for specific sites you add yourself.
- `storage` — saves your settings locally.
- `contextMenus`, `notifications` — the right-click menu and status toasts.

**Reader Mode** is powered by a local content-scoring engine (`readability.js`) that runs
entirely in the browser — it is **not** a cloud/AI service, and no page content is sent
anywhere.

Questions: contact the developer via Purely's Chrome Web Store listing page.
