import {
  /* buildBlock, */
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
  getMetadata,
} from './aem.js';

/**
 * Recursively removes nested <div> elements from a given element.
 */
export function unwrapNestedDivs(element) {
  const children = Array.from(element.children);
  children.forEach((child) => {
    if (child.tagName === 'DIV') {
      unwrapNestedDivs(child);
      while (child.firstChild) {
        element.insertBefore(child.firstChild, child);
      }
      element.removeChild(child);
    }
  });
}

/** allow for link attributes to be added by authors
 * example usage = Text [class:button,target:_blank,title:Title goes here]
 * @param main
 */
export function decorateLinks(main) {
  main.querySelectorAll('a').forEach((link) => {
    const iconSpan = link.querySelector('span.icon');
    if (iconSpan) {
      const iconImg = link.querySelector('img');
      if (iconImg) {
        const iconName = iconImg.getAttribute('data-icon-name');
        if (iconName) {
          link.setAttribute('aria-label', iconName);
        }
      }
    }

    const match = link.textContent.match(/(.*)\[([^\]]*)]/);
    if (match) {
      const [, linkText, attrs] = match;
      link.textContent = linkText.trim();
      attrs.split(',').forEach((attr) => {
        let [key, ...value] = attr.trim().split(':');
        key = key.trim().toLowerCase();
        value = value.join(':').trim();
        if (key) link.setAttribute(key, value);
      });
    }
  });
}

/**
 * Extracts a class name from a string like "Some text [class:some-class]"
 * and returns it with the cleaned text.
 * Useful to style links as highlighted text instead of default button style.
 *
 * @param {string} inputString
 * @returns {{ className: string|null, cleanedString: string }}
 */
export function parseClassFromString(inputString) {
  const classRegex = /\[class:\s*([^\]]+)\]/;
  const classMatch = inputString.match(classRegex);

  let className = null;
  let cleanedString = inputString;

  if (classMatch) {
    className = classMatch[1].trim();
    cleanedString = inputString.replace(classRegex, '').trim();
  }

  return { className, cleanedString };
}

/**
 * Builds hero block and prepends to main in a new section.
 * @param {Element} main The container element
 */
/*
function buildHeroBlock(main) {
  const h1 = main.querySelector('h1');
  const picture = main.querySelector('picture');
  // eslint-disable-next-line no-bitwise
  if (h1 && picture && (h1.compareDocumentPosition(picture) & Node.DOCUMENT_POSITION_PRECEDING)) {
    const section = document.createElement('div');
    section.append(buildBlock('hero', { elems: [picture, h1] }));
    main.prepend(section);
  }
}
*/

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
/*
function buildAutoBlocks(main) {
  try {
    buildHeroBlock(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}
*/

// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  // buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
  decorateLinks(main);
}

/**
 * Decorates the template.
 */
export async function loadTemplate(doc, templateName) {
  try {
    const cssLoaded = new Promise((resolve) => {
      loadCSS(
        `${window.hlx.codeBasePath}/templates/${templateName}/${templateName}.css`,
      )
        .then(resolve)
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.error(
            `failed to load css module for ${templateName}`,
            err.target.href,
          );
          resolve();
        });
    });
    const decorationComplete = new Promise((resolve) => {
      (async () => {
        try {
          const mod = await import(
            `../templates/${templateName}/${templateName}.js`
          );
          if (mod.default) {
            await mod.default(doc);
          }
        } catch (error) {
          // eslint-disable-next-line no-console
          console.log(`failed to load module for ${templateName}`, error);
        }
        resolve();
      })();
    });

    document.body.classList.add(`${templateName}-template`);

    await Promise.all([cssLoaded, decorationComplete]);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(`failed to load block ${templateName}`, error);
  }
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const templateName = getMetadata('template');
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    if (templateName) {
      await loadTemplate(doc, templateName);
    }
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * function to attach observation listener to hero block if anchor block is present
 * add observer to anchor links to highlight active section
 */
function addHeroObserver(doc) {
  const anchorBlock = doc.querySelector('.anchor-wrapper');
  const heroBlock = doc.querySelector('.hero-wrapper');
  const breadcrumb = doc.querySelector('.breadcrumbs-wrapper');
  // Function to update active section
  function updateActiveSection() {
    if (!anchorBlock) return;
    const anchorLinks = anchorBlock.querySelectorAll('a');
    // Get all sections
    const sections = [];
    anchorLinks.forEach((link) => {
      const target = doc.querySelector(decodeURIComponent(link.getAttribute('href')));
      if (target) sections.push(target);
    });

    // Find the first section that's above the middle of the viewport
    const viewportMiddle = window.innerHeight / 2;
    let activeSection = null;

    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= viewportMiddle
        && (!activeSection
        || section.getBoundingClientRect().top > activeSection.getBoundingClientRect().top)) {
        activeSection = section;
      }
    });

    // Update active state
    if (activeSection && activeSection !== updateActiveSection.currentActive) {
      updateActiveSection.currentActive = activeSection;
      anchorLinks.forEach((link) => {
        if (link.getAttribute('href') === `#${encodeURIComponent(activeSection.id)}`) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }
  }
  // Handle the fixed navigation
  if (anchorBlock) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          anchorBlock.classList.remove('is-fixed');
        } else {
          anchorBlock.classList.add('is-fixed');
        }
      });
    });
    if (heroBlock) {
      observer.observe(heroBlock);
    } else {
      observer.observe(breadcrumb);
    }
  }

  // Handle the active section highlighting
  if (anchorBlock) {
    const anchorLinks = anchorBlock.querySelectorAll('a');
    // Update active section on scroll
    window.addEventListener('scroll', updateActiveSection, { passive: true });

    // Update active section on click (after small delay for scroll animation)
    anchorLinks.forEach((link) => {
      link.addEventListener('click', () => {
        setTimeout(updateActiveSection, 100);
      });
    });

    // Initial update
    updateActiveSection();
  }
}

function initializePhoneValidation(document) {
  const form = document.querySelector('.modal dialog form') || document.querySelector('#form-block');
  if (!form) return;
  const input = document.querySelector('.Phone > input');
  const countryDropdown = document.querySelector('.Country .form-dropdown > input');
  const countryTrigger = document.querySelector('.Country .form-dropdown__selected-label');

  const iti = window.intlTelInput(input, {
    loadUtils: () => import('./intl-tel-input-utils.js'),
    countrySearch: false,
    countryOrder: ['us', 'ca'],
    fixDropdownWidth: false,
    initialCountry: 'us',
    formatAsYouType: false,
    formatOnDisplay: false,
  });

  const initialCountryData = iti.getSelectedCountryData();
  countryDropdown.value = initialCountryData.iso2.toUpperCase();
  countryTrigger.textContent = initialCountryData.name;
  countryTrigger.style.color = 'black';

  input.addEventListener('countrychange', () => {
    const countryData = iti.getSelectedCountryData();
    countryDropdown.value = countryData.iso2.toUpperCase();
    countryTrigger.textContent = countryData.name;
    countryTrigger.style.color = 'black';
    countryDropdown.dispatchEvent(new Event('change'));
  });

  countryDropdown.addEventListener('change', (e) => {
    const countryCode = e.target.value;
    if (countryCode) {
      iti.setCountry(countryCode.toLowerCase());
    }
  });

  input.addEventListener('input', async (e) => {
    const isValid = iti.isValidNumber();
    let errorMessage;
    if (!isValid && input.value === '') {
      errorMessage = 'Please check your form entries';
    } else if (!isValid) {
      errorMessage = e.target.getAttribute('validation-error-message');
    } else {
      input.setAttribute('full-phone-number', iti.getNumber());
    }
    const { toggleError } = await import('../blocks/form/form.js');
    toggleError(input.parentElement, !isValid, errorMessage);
  });
}

function autolinkModals(element) {
  element.addEventListener('click', async (e) => {
    const origin = e.target.closest('a');

    if (origin && origin.href && origin.href.includes('/modals/')) {
      e.preventDefault();
      const { openModal } = await import(`${window.hlx.codeBasePath}/blocks/modal/modal.js`);
      await openModal(origin.href);
      initializePhoneValidation(document);
    }
  });
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  autolinkModals(doc);
  const main = doc.querySelector('main');
  await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
  addHeroObserver(doc);

  loadCSS(`${window.hlx.codeBasePath}/styles/intlTelInput.min.css`);
  await import('./intlTelInput.min.js');
  initializePhoneValidation(doc);
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3500);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
