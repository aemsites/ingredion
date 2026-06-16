const TERMS_PATH = '/drafts/shajahan/legal-terms';
const CONSENT_COOKIE = 'offerCommsConsent';
const COOKIE_MAX_AGE_DAYS = 365;
 
function setCookie(name, value, days) {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
}
 
export default function decorateLegalGate() {
  const currentPath = window.location.pathname.replace(/\/+$/, '');
  if (currentPath !== TERMS_PATH) return;
 
  document.querySelectorAll('a.button').forEach((link) => {
    const label = link.textContent.trim().toLowerCase();
 
    if (label === 'agree') {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        setCookie(CONSENT_COOKIE, 'agreed', COOKIE_MAX_AGE_DAYS);
        window.location.replace(link.href);
      });
    } else if (label === 'disagree') {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        setCookie(CONSENT_COOKIE, 'disagreed', COOKIE_MAX_AGE_DAYS);
        window.location.replace(link.href);
      });
    }
  });
}