/*
 * Purely - local "Smart Reader" content-extraction engine.
 *
 * This is a heuristic scoring algorithm in the spirit of Mozilla's
 * Readability.js, reimplemented compactly for Purely. It runs entirely
 * inside the page's own JavaScript context - there is no network call, no
 * external AI/LLM service, and no data ever leaves the browser. "Smart" here
 * means a denser, more accurate scoring model than a plain paragraph count,
 * not a hosted AI model.
 */
(function (root) {
  var POSITIVE_RE = /article|body|content|entry|hentry|main|page|post|text|blog|story/i;
  var NEGATIVE_RE = /hidden|banner|combx|comment|com-|contact|foot|footnote|masthead|media|outbrain|promo|related|scroll|share|shoutbox|sidebar|skyscraper|sponsor|shopping|tags|tool|widget|nav-|ad-break|agegate|pagination|pager|popup|yom-remote/i;
  var UNLIKELY_RE = /-ad-|ai2html|banner|breadcrumbs|combx|comment|community|cover-wrap|disqus|extra|footer|gdpr|masthead|menu|related|remark|replies|rss|shoutbox|sidebar|skyscraper|social|sponsor|supplemental|ad-break|agegate|pagination|pager|popup|yom-remote|tweet|twitter/i;
  var MAYBE_CANDIDATE_RE = /and|article|body|column|main|shadow/i;

  // Base points by tag name for whichever element ends up "holding" a
  // paragraph - a plain <div> wrapper is a good sign, a <li> or <form> isn't.
  var TAG_SCORES = {
    DIV: 5, PRE: 3, BLOCKQUOTE: 3, TD: 3,
    ADDRESS: -3, OL: -3, UL: -3, DL: -3, DD: -3, DT: -3, LI: -3, FORM: -3,
    H1: -5, H2: -5, H3: -5, H4: -5, H5: -5, H6: -5, TH: -5
  };

  function textLen(el) {
    return ((el && el.textContent) || '').trim().length;
  }

  function getLinkDensity(el) {
    var total = textLen(el);
    if (total === 0) return 0;
    var linkLen = 0;
    el.querySelectorAll('a').forEach(function (a) { linkLen += textLen(a); });
    return Math.min(linkLen / total, 1);
  }

  function classAndId(el) {
    return (typeof el.className === 'string' ? el.className : '') + ' ' + (el.id || '');
  }

  function isUnlikely(el) {
    var ci = classAndId(el);
    if (!UNLIKELY_RE.test(ci)) return false;
    return !MAYBE_CANDIDATE_RE.test(ci);
  }

  // Skip paragraphs that live inside something already marked as clutter, or
  // inside a container whose own class/id name reads as nav/sidebar/comments/ads.
  function hasUnlikelyAncestor(el, root) {
    var node = el.parentElement;
    var depth = 0;
    while (node && node !== root && depth < 6) {
      if (node.hasAttribute && node.hasAttribute('data-purely-hidden')) return true;
      if (isUnlikely(node)) return true;
      node = node.parentElement;
      depth++;
    }
    return false;
  }

  // Scores every element that ends up "holding" real paragraph text, by
  // propagating points from each <p>/<pre>/<blockquote>/<td> up to its
  // parent (full points) and grandparent (half points) - the same core idea
  // Readability.js uses: real articles are usually one container with many
  // scored children, so that container's score snowballs above any single
  // sidebar widget or nav block.
  function scoreDocument(root) {
    var scores = new Map();

    function ensure(el) {
      if (!scores.has(el)) scores.set(el, TAG_SCORES[el.tagName] || 0);
    }

    root.querySelectorAll('p, pre, blockquote, td').forEach(function (node) {
      var text = (node.textContent || '').trim();
      if (text.length < 25) return;
      if (hasUnlikelyAncestor(node, root)) return;

      var parent = node.parentElement;
      if (!parent) return;
      var grandparent = parent.parentElement;

      var points = 1;
      points += (text.match(/,/g) || []).length;
      points += Math.min(Math.floor(text.length / 100), 3);

      ensure(parent);
      scores.set(parent, scores.get(parent) + points);
      if (grandparent) {
        ensure(grandparent);
        scores.set(grandparent, scores.get(grandparent) + points / 2);
      }
    });

    var best = null;
    var bestScore = 0;
    scores.forEach(function (score, el) {
      var ci = classAndId(el);
      var bonus = 0;
      if (POSITIVE_RE.test(ci)) bonus += 25;
      if (NEGATIVE_RE.test(ci)) bonus -= 25;
      var baseScore = score + bonus;
      // Perf: getLinkDensity() walks el's entire subtree with querySelectorAll('a'), which
      // gets expensive on complex pages (hundreds of scored candidates, some with large
      // overlapping subtrees). It's also pointless work here: link density is always in
      // [0,1], so finalScore = baseScore * (1 - density) can only be positive when
      // baseScore itself is positive - and bestScore never drops below its initial 0 - so
      // any candidate with baseScore <= 0 can mathematically never win and is skipped
      // before paying for the querySelectorAll at all. No change in which element wins.
      if (baseScore <= 0) return;
      var finalScore = baseScore * (1 - getLinkDensity(el));
      if (finalScore > bestScore) {
        bestScore = finalScore;
        best = el;
      }
    });

    return { element: best, score: bestScore };
  }

  // Original simpler heuristic, kept as a safety-net fallback for pages
  // where the scoring model above comes up empty (e.g. very short pages).
  function legacyFallback(root) {
    var best = null;
    var bestScore = 0;
    Array.prototype.forEach.call(root.querySelectorAll('div, section'), function (el) {
      if (el.querySelectorAll('p').length < 2) return;
      var text = 0;
      el.querySelectorAll('p').forEach(function (p) { text += textLen(p); });
      var density = getLinkDensity(el);
      var score = text * (1 - Math.min(density, 0.9));
      if (score > bestScore) {
        bestScore = score;
        best = el;
      }
    });
    return best;
  }

  function findMainElement(doc) {
    doc = doc || document;
    var explicit = doc.querySelector('article') ||
      doc.querySelector('[role="main"]') ||
      doc.querySelector('main');
    if (explicit && textLen(explicit) > 200) return explicit;

    var scored = scoreDocument(doc.body);
    if (scored.element && textLen(scored.element) > 140) return scored.element;

    return legacyFallback(doc.body) || doc.body;
  }

  function extractTitle(doc) {
    doc = doc || document;
    var og = doc.querySelector('meta[property="og:title"]');
    if (og && og.content && og.content.trim()) return og.content.trim();
    var h1 = doc.querySelector('h1');
    if (h1 && (h1.innerText || h1.textContent || '').trim()) return (h1.innerText || h1.textContent).trim();
    return doc.title || '';
  }

  function extractByline(doc) {
    doc = doc || document;
    var el = doc.querySelector('[rel="author"], .byline, .author, [itemprop="author"]');
    if (el && el.textContent.trim()) return el.textContent.trim().slice(0, 120);
    var meta = doc.querySelector('meta[name="author"]');
    if (meta && meta.content) return meta.content.trim().slice(0, 120);
    return '';
  }

  function extractPublishedDate(doc) {
    doc = doc || document;
    var timeEl = doc.querySelector('time[datetime]');
    if (timeEl) {
      var d = new Date(timeEl.getAttribute('datetime'));
      if (!isNaN(d.getTime())) return d;
    }
    var meta = doc.querySelector('meta[property="article:published_time"]');
    if (meta && meta.content) {
      var d2 = new Date(meta.content);
      if (!isNaN(d2.getTime())) return d2;
    }
    return null;
  }

  root.PURELY_READABILITY = {
    findMainElement: findMainElement,
    extractTitle: extractTitle,
    extractByline: extractByline,
    extractPublishedDate: extractPublishedDate
  };
})(typeof window !== 'undefined' ? window : this);
