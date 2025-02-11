// add delayed functionality here
import { initBackToTop } from './back-to-top.js';
import { loadCSS } from './aem.js';

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBackToTop);
} else {
  initBackToTop();
}

/* loadCSS(`${window.hlx.codeBasePath}/styles/intlTelInput.min.css`);
await import('./intlTelInput.min.js');
const input = document.querySelector('.phone > select');
window.intlTelInput(input, {
  loadUtils: () => import('./intl-tel-input-utils.js'),
}); */
