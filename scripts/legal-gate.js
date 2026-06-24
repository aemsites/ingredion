const GATED_PATH = '/na/en-us/legal/offer-communications';
const TERMS_PATH = '/na/en-us/legal/disclaimer-content';

export default function decorateLegalGate() {
  const currentPath = window.location.pathname.replace(/\/+$/, '');
  if (currentPath !== TERMS_PATH) return;

  document.addEventListener(
    'click',
    (event) => {
      const link = event.target.closest('a.button, button.button');
      if (!link) return;
      const label = link.textContent.trim().toLowerCase();

      if (label === 'i accept') {
        event.preventDefault();
        event.stopImmediatePropagation();
        const url = new URL(link.href, window.location.origin);
        url.searchParams.set('consent', 'agreed');
        window.location.replace(url.toString());
      } else if (label === 'i decline') {
        event.preventDefault();
        event.stopImmediatePropagation();
        window.location.replace(link.href || '/');
      }
    },
    true,
  );
}
