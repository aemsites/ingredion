// add delayed functionality here
import { initBackToTop } from './back-to-top.js';
import { sampleRUM } from './aem.js';
import { initMartech, addCookieBanner } from './martech.js';

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBackToTop);
} else {
  initBackToTop();
}

// Core Web Vitals RUM collection
sampleRUM('cwv');

// Full Martech stack

initMartech();
addCookieBanner();
