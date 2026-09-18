/*
 * Purely - only registered dynamically for domains on the "auto-clean" list.
 * Runs cleaning automatically as soon as the page loads, no click needed.
 */
(function () {
  function run() {
    if (window.__PURELY_RUN__) {
      window.__PURELY_RUN__('clean');
    }
  }
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(run, 300);
  } else {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(run, 300);
    });
  }
})();
