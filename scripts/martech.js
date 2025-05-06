import { getMetadata, loadScript } from './aem.js';

async function initLaunch(env) {
  const launchUrls = {
    dev: 'https://assets.adobedtm.com/988b70f7b756/aa64d2a496c3/launch-159a0321787a-development.min.js',
    stage: 'https://assets.adobedtm.com/988b70f7b756/aa64d2a496c3/launch-509818e86df2-staging.min.js',
    prod: 'https://assets.adobedtm.com/988b70f7b756/aa64d2a496c3/launch-0e5b0f94b7f5.min.js'
  };
  if (!Object.keys(launchUrls).includes(env)) {
    return; // unknown env -> skip martech initialization
  }
  await loadScript(launchUrls[env], { async: '' });
}

/**
 * Initializes the full Martech stack.
 */
export async function initMartech(env) {
  await initLaunch(env);
  loadScript('/scripts/gtm-init.js', { defer: true });
}

export async function addCookieBanner() {
  const cookieBanner = document.createElement('div');
  cookieBanner.classList.add('cookie-banner');
  cookieBanner.innerHTML = `<a class="footer__utility--link" href="javascript:void(0)" onclick="truste.eu.clickListener()"></a>
  <div class="cookie-consent">
  <div id="consent_blackbar"></div>
</div>`;
  document.querySelector('main').append(cookieBanner);
}