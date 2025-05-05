import { getMetadata, loadScript } from './aem.js';

async function initLaunch(env) {
  const launchUrls = {
    dev: 'https://assets.adobedtm.com/988b70f7b756/aa64d2a496c3/launch-0e5b0f94b7f5.min.js',
    stage: 'https://assets.adobedtm.com/988b70f7b756/aa64d2a496c3/launch-0e5b0f94b7f5.min.js',
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
