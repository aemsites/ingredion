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
  // await loadScript('/scripts/gtm-init.js', { defer: true });
    // Your existing Martech initialization logic here
    alert('Initializing Martech...');
    console.log('Initializing Martech...');

    // Salesforce Live Agent Chat Initialization
    const initESW = function (gslbBaseURL) {
      embedded_svc.settings.displayHelpButton = true;
      embedded_svc.settings.language = '';
      embedded_svc.settings.directToButtonRouting = function (prechatFormData) {
        prechatFormData[8].value = 'Website - Live Chat';
        prechatFormData[9].value = 'True';
        prechatFormData[10].value = 'Website - Live Chat';
      };
      embedded_svc.settings.defaultMinimizedText = 'Chat with an expert';
      embedded_svc.settings.offlineSupportMinimizedText = 'Chat offline';

      let i = 0;

      embedded_svc.addEventHandler("onHelpButtonClick", function () {
        setTimeout(() => {
          document.getElementsByClassName("embeddedServiceIcon")[0]?.removeAttribute("style");
        }, 3000);
      });

      embedded_svc.addEventHandler("afterMaximize", function () {
        setTimeout(() => {
          const hideIds = [
            'Lead_Source_Most_Recent__c',
            'handrise_list__c',
            'LeadSource',
            'is_Follow_up_Required__c'
          ];
          hideIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.visibility = 'hidden';
          });

          const labels = document.getElementsByClassName("uiLabel-left form-element__label uiLabel");
          if (labels[7]) labels[7].innerHTML = 'Yes, I would like to opt-in to receive updates and other communications via email from Ingredion.';
          [8, 9, 10, 11].forEach(i => {
            if (labels[i]) labels[i].style.display = 'none';
          });

          if (i === 0) {
            const newcontentAbc = document.createElement('div');
            newcontentAbc.innerHTML = '</br>Information we are required to provide to you prior to processing your data as described in the General Data Protection Directive (GDPR) is available to you in our https://www.ingredion.com/na/en-us/legal/privacy-policy.html</br>';
            newcontentAbc.style.fontSize = '8px';
            document.getElementsByClassName("buttonWrapper embeddedServiceSidebarForm")[0]?.appendChild(newcontentAbc);
            i++;
          }

          const newcontentbreak = document.createElement('a');
          newcontentbreak.innerHTML = '</br></br>';
          document.getElementsByClassName("uiInput uiInputSelect uiInput--default uiInput--select")[1]?.appendChild(newcontentbreak);
        }, 3000);
      });

      embedded_svc.addEventHandler("afterMinimize", () => console.log('afterminimize'));
      embedded_svc.addEventHandler("onClickSubmitButton", () => { i = 0; });
      embedded_svc.addEventHandler("afterDestroy", () => { i = 0; });

      embedded_svc.settings.enabledFeatures = ['LiveAgent'];
      embedded_svc.settings.entryFeature = 'LiveAgent';

      embedded_svc.init(
        'https://ingredion.my.salesforce.com',
        'https://www.myingredion.com/',
        gslbBaseURL,
        '00D30000000mNMR',
        'NA_inside_Lead_Sales',
        {
          baseLiveAgentContentURL: 'https://c.la13-core1.sfdc-lywfpd.salesforceliveagent.com/content',
          deploymentId: '5723x000000k9bm',
          buttonId: '5733x000000TPdJ',
          baseLiveAgentURL: 'https://d.la13-core1.sfdc-lywfpd.salesforceliveagent.com/chat',
          eswLiveAgentDevName: 'EmbeddedServiceLiveAgent_Parent04I3x000000CaRCEA0_184f206b30a',
          isOfflineSupportEnabled: true
        }
      );
    };

    if (!window.embedded_svc) {
      const s = document.createElement('script');
      s.src = 'https://ingredion.my.salesforce.com/embeddedservice/5.0/esw.min.js';
      s.onload = () => initESW(null);
      document.body.appendChild(s);
    } else {
      initESW('https://service.force.com');
    }
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
