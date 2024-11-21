/* eslint-disable function-paren-newline, object-curly-newline */
import { loadFragment } from '../fragment/fragment.js';
import { div, nav, span, img, form, input, button } from '../../scripts/dom-helpers.js';
import { getRegionLocale, throttle} from '../../scripts/utils.js';

async function buildDropDowns($header) {
  const links = [...$header.querySelectorAll('a[href*="/dropdowns"]')];
  let openDropdown = null;

  // Array of promises for loading fragments in parallel
  const linkPromises = links.map(async (link) => {
    const subNavPath = link.getAttribute('href');
    if (!subNavPath) return;

    const subNavFrag = await loadFragment(subNavPath);
    const $dropDown = div({ class: 'dropdown' });
    while (subNavFrag.firstElementChild) $dropDown.append(subNavFrag.firstElementChild);
    link.insertAdjacentElement('afterend', $dropDown);

    const eventType = link.closest('.utility') ? 'click' : 'mouseenter';
    const handleEvent = throttle((event) => {
      event.preventDefault();
      if (openDropdown && openDropdown !== $dropDown) {
        openDropdown.parentElement.classList.remove('active');
      }
      $dropDown.parentElement.classList.add('active');
      openDropdown = $dropDown;
    }, eventType === 'mouseenter' ? 100 : 0);

    link.addEventListener(eventType, handleEvent);
  });

  // close dropdown if clicked outside
  document.addEventListener('click', (event) => {
    if (openDropdown && !openDropdown.contains(event.target) && !event.target.closest('a[href*="/dropdowns"]')) {
      openDropdown.parentElement.classList.remove('active');
      openDropdown = null;
    }
  }, true);

  document.addEventListener('click', (event) => {
    if (openDropdown && !openDropdown.contains(event.target) && !event.target.matches('a')) {
      openDropdown.parentElement.classList.remove('active');
      openDropdown = null;
    }
  });

  await Promise.all(linkPromises);
}

export default async function decorate(block) {
  block.remove();
  let [region, locale] = getRegionLocale();
  // if region or locale is not found, default to 'na' and 'en-us'
  if (region.length !== 2) region = 'na';
  if (locale.length !== 5) locale = 'en-us';
  const navPath = `/${region}/${locale}/header/header`;
  const navFrag = await loadFragment(navPath, false);

  const navSections = navFrag.querySelectorAll('main > div');
  const $header = document.querySelector('header');

  const $cart = div({ class: 'cart' },
    span({ class: 'icon-cart' }, '\u{e919}'),
    span({ class: 'count hide' }),
  );

  const $utilityNav = nav({ class: 'utility' },
    ...Array.from(navSections[0].querySelectorAll(':scope > *')),
  );

  const $logoNav = nav({ class: 'logo-search' },
    div({ class: 'logo' },
      img({ src: '/icons/ingredion.svg', width: 120, alt: 'Ingredion logo' }),
    ),
    form({ class: 'search' },
      div({ class: 'category-dropdown' }, 'All'),
      input({ id: 'search-key', 'aria-label': 'Search Input' }),
      button({ type: 'submit', class: 'icon-search', 'aria-label': 'Search Button' }),
    ),
    ...Array.from(navSections[1].querySelectorAll(':scope > *')),
  );

  const $categoryNav = nav({ class: 'category' }, ...Array.from(navSections[2].querySelectorAll(':scope > *')));

  $header.append(
    $utilityNav,
    $cart,
    $logoNav,
    $categoryNav,
  );

  await buildDropDowns($header);
}
