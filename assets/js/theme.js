(function () {
  var STORAGE_KEY = 'theme';

  function getTheme() {
    return document.documentElement.getAttribute('data-theme') || 'dark';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);

    // Swap highlight.js stylesheets
    var dark  = document.getElementById('hljs-theme-dark');
    var light = document.getElementById('hljs-theme-light');
    if (dark && light) {
      dark.disabled  = (theme === 'light');
      light.disabled = (theme === 'dark');
    }
  }

  // Wire up the toggle button
  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;

    btn.addEventListener('click', function () {
      var current = getTheme();
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });
  });
})();
