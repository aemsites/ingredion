const TERMS_PATH = '/drafts/shajahan/disclaimer-content';
 
export default function decorateLegalGate() {
  const currentPath = window.location.pathname.replace(/\/+$/, '');
  console.log('[legal-gate] path:', currentPath, 'expected:', TERMS_PATH);
  if (currentPath !== TERMS_PATH) return;
  const buttons = document.querySelectorAll('a.button');
  console.log('[legal-gate] buttons found:', buttons.length);
  buttons.forEach((link) => {
    const label = link.textContent.trim().toLowerCase();
    console.log('[legal-gate] button label:', JSON.stringify(label));
    if (label === 'i accept') {
      link.addEventListener('click', (event) => {
        console.log('[legal-gate] I Accept clicked');
        event.preventDefault();
        const url = new URL(link.href, window.location.origin);
        url.searchParams.set('consent', 'agreed');
        console.log('[legal-gate] navigating to:', url.toString());
        window.location.replace(url.toString());
      });
    } else if (label === 'i decline') {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        window.location.replace(link.href);
      });
    }
  });
}
 

//old approach

/* const TERMS_PATH = '/drafts/shajahan/legal-terms';
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
} */