/* Odnoton nails: fixed top (strip + header) with an in-flow gap, and the narrow-screen menu. */
(() => {
  const top = document.getElementById('fixedtop');
  const setGap = () => document.documentElement.style.setProperty('--fixed-h', `${top.getBoundingClientRect().height}px`);
  setGap();
  if ('ResizeObserver' in window) new ResizeObserver(setGap).observe(top);

  const toggle = document.querySelector('.toggle');
  const drawer = document.getElementById('drawer');
  if (!toggle || !drawer) return;
  const show = (open) => {
    drawer.hidden = !open;
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  };
  toggle.addEventListener('click', () => show(drawer.hidden));
  drawer.addEventListener('click', (e) => { if (e.target instanceof Element && e.target.closest('a')) show(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || drawer.hidden) return;
    show(false); toggle.focus();
  });
  const wide = window.matchMedia('(min-width: 980px)');
  wide.addEventListener('change', () => { if (wide.matches) show(false); });
})();
