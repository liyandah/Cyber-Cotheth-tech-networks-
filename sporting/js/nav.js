/**
 * Shared theme toggle for Sporting pages (matches main site dark/light mode).
 */
(function initSportingTheme() {
  const html = document.documentElement;
  const saved = localStorage.getItem('cctn-theme');
  if (saved === 'light' || saved === 'dark') {
    html.setAttribute('data-theme', saved);
  }

  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('sporting-theme-btn');
    if (!btn) return;

    const icon = btn.querySelector('i');
    const updateIcon = () => {
      const dark = html.getAttribute('data-theme') === 'dark';
      if (icon) icon.className = dark ? 'fas fa-sun' : 'fas fa-moon';
    };
    updateIcon();

    btn.addEventListener('click', () => {
      const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('cctn-theme', next);
      updateIcon();
    });
  });
})();

/** Mobile nav toggle for Sporting sub-pages. */
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('sporting-nav-toggle');
  const menu = document.getElementById('sporting-nav-menu');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    menu.classList.toggle('active');
    toggle.classList.toggle('active');
  });

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menu.classList.remove('active');
      toggle.classList.remove('active');
    });
  });
});
