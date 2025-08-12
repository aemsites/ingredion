import { loadScript } from './aem.js';
import { getRegionLocale, getRegionLocaleMap } from './utils.js';

function getEnvironment() {
  const { hostname } = window.location;
  if (hostname === 'localhost') {
    return 'dev';
  }
  if (hostname.endsWith('.aem.page') || hostname.endsWith('.aem.live') || hostname === 'preview.ingredion.com') {
    return 'stage';
  }
  if (hostname === 'www.ingredion.us' || hostname === 'www.ingredion.com') {
    return 'prod';
  }
  return 'unknown';
}

function isMartechDisabled() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('martech') === 'off';
}

async function initLaunch(env) {
  const launchUrls = {
    dev: 'https://assets.adobedtm.com/988b70f7b756/aa64d2a496c3/launch-159a0321787a-development.min.js',
    stage: 'https://assets.adobedtm.com/988b70f7b756/aa64d2a496c3/launch-509818e86df2-staging.min.js',
    prod: 'https://assets.adobedtm.com/988b70f7b756/aa64d2a496c3/launch-0e5b0f94b7f5.min.js',
  };
  if (!Object.keys(launchUrls).includes(env)) {
    return; // unknown env -> skip martech initialization
  }
  await loadScript(launchUrls[env], { async: '' });
}

function initDataLayer() {
  let pageHierarchy = JSON.parse(localStorage.getItem('pageHierarchy'));
  const [region, locale] = getRegionLocale();
  if (!pageHierarchy) {
    pageHierarchy = [getRegionLocaleMap(region), getRegionLocaleMap(locale), 'index'];
  }
  const pageLanguage = locale.split('-')[0];
  const productFacets = JSON.parse(localStorage.getItem('productFacets'));

  window.dataLayer = {
    page: {
      pageLevel1: pageHierarchy[0],
      pageLevel2: pageHierarchy[1],
      pageLevel3: pageHierarchy[2],
      pageName: pageHierarchy.join('|'),
      pageRegion: pageHierarchy[0],
      pageLanguage,
      previousPageName: localStorage.getItem('previousPageName'),
      pageURL: window.location.href,
      pageHierarchy: pageHierarchy.join('/'),
    },
    user: {
      country: pageHierarchy[1].split(' - ')[0],
    },
    event: {
      eventName: 'eventName',
      eventInfo1: '1',
      eventInfo2: '2',
      eventInfo3: '3',
      eventInfo4: '4',
    },
  };
  if (productFacets) {
    window.dataLayer.product = {
      application: productFacets.applications?.options?.map((opt) => opt.label).join(',') || '',
      subApplication: productFacets.subApplications?.options?.map((opt) => opt.label).join(',') || '',
      productType: productFacets.productType?.options?.map((opt) => opt.label).join(',') || '',
    };
  }

  localStorage.setItem('previousPageName', window.location.href);
}

/**
 * Initializes the full Martech stack.
 */
export async function initMartech() {
  if (isMartechDisabled()) {
    return;
  }
  initDataLayer();
  await initLaunch(getEnvironment());
  await loadScript('/scripts/gtm-init.js', { defer: true });
}

export async function addCookieBanner() {
  if (isMartechDisabled()) {
    return;
  }
  const cookieBanner = document.createElement('div');
  cookieBanner.classList.add('cookie-banner');
  cookieBanner.innerHTML = `<a class="footer__utility--link" href="javascript:void(0)" onclick="truste.eu.clickListener()"></a>
  <div class="cookie-consent">
  <div id="consent_blackbar"></div>
</div>`;
  document.querySelector('main').append(cookieBanner);
}

export async function initChatWidget() {
  const addWidget = document.createElement('div');
  addWidget.classList.add('embeddedServiceHelpButton');
  addWidget.innerHTML = `
    <div class="embeddedServiceHelpButton">
      <div class="helpButton">
        <button class="helpButtonEnabled uiButton" href="javascript:void(0)">
          <span class="embeddedServiceIcon" aria-hidden="true" data-icon="" style="display: inline-block;"></span>
          <span class="helpButtonLabel" id="helpButtonSpan" aria-live="polite" aria-atomic="true">
            <span class="assistiveText">Live chat:</span>
            <span class="message">Chat with an expert</span>
          </span>
        </button>
      </div>
    </div>`;
  document.querySelector('main').append(addWidget);
}
