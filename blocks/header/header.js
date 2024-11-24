/* eslint-disable function-paren-newline, object-curly-newline */
import { loadFragment } from '../fragment/fragment.js';
import { div, nav, span, img, form, input, button, a } from '../../scripts/dom-helpers.js';
import { getRegionLocale, throttle } from '../../scripts/utils.js';

async function buildDropDowns($header) {
  const links = [...$header.querySelectorAll('a[href*="/dropdowns"]')];
  let activeDropdown = null;

  // Array of promises for loading fragments in parallel
  const linkPromises = links.map(async (link) => {
    const subNavPath = link.getAttribute('href');
    // remove href to prevent navigation or show link in status bar
    link.removeAttribute('href');
    link.setAttribute('data-dropdown', 'true');
    const subNavFrag = await loadFragment(subNavPath);
    const $dropDown = div({ class: 'dropdown' });
    while (subNavFrag.firstElementChild) $dropDown.append(subNavFrag.firstElementChild);
    link.parentElement.append($dropDown);

    const eventType = link.closest('.utility') ? 'click' : 'pointerenter';

    const openDropdown = throttle(() => {
      if (activeDropdown && activeDropdown !== $dropDown) {
        activeDropdown.parentElement.classList.remove('active');
      }
      $dropDown.parentElement.classList.add('active');
      activeDropdown = $dropDown;
    }, 100);

    link.addEventListener(eventType, openDropdown);
  });

  // close dropdown if clicked outside of it
  // This is getting fired when on mobile and clicking on a dropdown link, need to prevent it
  document.addEventListener('click', (event) => {
    if (activeDropdown && !activeDropdown.contains(event.target) && !event.target.closest('a[data-dropdown]')) {
      activeDropdown.parentElement.classList.remove('active');
      activeDropdown = null;
    }
  }, true);

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
  const $header = document.querySelector('header');
  const navSections = navFrag.querySelectorAll('main > div');

  const $btnCart = button({ class: 'icon-cart', href: `/${region}/${locale}/sample-cart.html`, 'aria-label': 'Cart' },
    '\u{e919}',
    span({ class: 'count hide' }, '0'),
  );

  const $btnBurger = button({ class: 'icon-burger', 'aria-label': 'Menu' });

  $btnBurger.addEventListener('click', () => {
    $header.classList.toggle('mobile-view');
  });

  const $navUtility = nav({ class: 'utility' },
    ...Array.from(navSections[0].querySelectorAll(':scope > *')),
  );

  const $navLogoSearch = nav({ class: 'logo-search' },
    a({ class: 'logo', href: `/${region}/${locale}.html`, 'aria-label': 'Home' },
      img({ src: '/icons/ingredion.svg', width: 120, alt: 'Ingredion logo' }),
    ),
    div({ class: 'search-wrapper' },
      form({ class: 'search', id: 'searchForm' },
        div({ class: 'category-dropdown' }, 'All'),
        input({ id: 'search', 'aria-label': 'Search Input' }),
        button({ type: 'submit', class: 'icon-search', 'aria-label': 'Search Button' }),
      ),
      button({ type: 'submit', form: 'searchForm', class: 'button-search', 'aria-label': 'Search Button' }, 'Search'),
    ),
    ...Array.from(navSections[1].querySelectorAll(':scope > *')),
  );

  const $navCategory = nav({ class: 'category' }, ...Array.from(navSections[2].querySelectorAll(':scope > *')));

  $header.append(
    $navUtility,
    $navLogoSearch,
    $navCategory,
    $btnCart,
    $btnBurger,
  );

  await buildDropDowns($header);
}
