/* eslint-disable function-paren-newline, object-curly-newline */
import { loadFragment } from '../fragment/fragment.js';
import { div, nav, span, img, form, input, button, a } from '../../scripts/dom-helpers.js';
import { getRegionLocale, throttle } from '../../scripts/utils.js';

const isMobile = window.matchMedia('(width < 1080px)');

async function buildDropDowns($header) {
  const links = [...$header.querySelectorAll('a[href*="/dropdowns"]')];
  let activeDropdown = null;

  function getEventType(link) {
    return link.closest('.utility') || isMobile.matches ? 'click' : 'pointerenter';
  }

  async function attachDropdown(link) {
    const subNavPath = link.getAttribute('href');
    link.removeAttribute('href');
    link.setAttribute('data-dropdown', 'true');

    // Load fragment and append dropdown content
    const subNavFrag = await loadFragment(subNavPath);
    const $dropDown = div({ class: 'dropdown' });
    while (subNavFrag.firstElementChild) $dropDown.append(subNavFrag.firstElementChild);
    link.parentElement.append($dropDown);
    let eventType = getEventType(link);

    const openDropdown = throttle(() => {
      if (activeDropdown && activeDropdown !== $dropDown) {
        activeDropdown.parentElement.classList.remove('active');
      }
      $dropDown.parentElement.classList.add('active');
      activeDropdown = $dropDown;
    }, 100);

    link.addEventListener(eventType, openDropdown);

    // update event on viewport change
    isMobile.addEventListener('change', () => {
      link.removeEventListener(eventType, openDropdown);
      eventType = getEventType(link);
      link.addEventListener(eventType, openDropdown);
    });
  }

  // load dropdowns attach event listeners in parallel
  const linkPromises = links.map(attachDropdown);

  // close dropdown if clicked outside
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
  const [region, locale] = getRegionLocale();
  const navPath = `/${region}/${locale}/header/header`;
  const navFrag = await loadFragment(navPath, false);
  const navSections = navFrag.querySelectorAll('main > div');
  const $utilityLinks = Array.from(navSections[0].querySelectorAll(':scope > *'));
  const $btnTechDocSamples = div({ class: 'btn-tech-doc-samples' }, navSections[1].querySelector(':scope > p > a'));
  const $categoryNav = Array.from(navSections[2].querySelectorAll(':scope > *'));

  const $header = document.querySelector('header');

  const $btnCart = button({ class: 'icon-cart', href: `/${region}/${locale}/sample-cart.html`, 'aria-label': 'Cart' },
    '\u{e919}',
    span({ class: 'count hide' }, '0'),
  );

  const $btnBurger = button({ class: 'icon-burger', 'aria-label': 'Menu' });
  $btnBurger.addEventListener('click', () => {
    document.body.classList.toggle('menu-open');
  });

  const $logo = a({ class: 'logo', href: `/${region}/${locale}.html`, 'aria-label': 'Home' },
    img({ src: '/icons/ingredion.svg', width: 120, alt: 'Ingredion logo' }),
  );

  const $searchBar = div({ class: 'search-bar' },
    form({ class: 'search', id: 'searchForm' },
      div({ class: 'search-box' },
        div({ class: 'category-dropdown' }, 'All'),
        input({ id: 'search', 'aria-label': 'Search Input' }),
        button({ type: 'submit', class: 'icon-search', 'aria-label': 'Search Button' }),
      ),
      button({ type: 'submit', form: 'searchForm', class: 'button-search', 'aria-label': 'Search Button' }, 'Search'),
    ),
  );

  const $navCategory = nav({ class: 'category' }, ...$categoryNav);

  // change view for dektop or mobile
  function handleView() {
    $header.innerHTML = '';

    if (isMobile.matches) {
      $header.append(
        div({ class: 'logo-cart-burger-wrap' },
          $logo,
          $btnCart,
          $btnBurger,
        ),
        $searchBar,
        div({ class: 'mobile-menu' },
          $navCategory,
          $btnTechDocSamples,
          nav({ class: 'utility' },
            ...$utilityLinks,
          ),
        ),
      );
    } else {
      // desktop view
      $header.append(
        nav({ class: 'utility' },
          ...$utilityLinks,
          $btnCart,
        ),
        div({ class: 'logo-search-btn-wrap' },
          $logo,
          $searchBar,
          $btnTechDocSamples,
        ),
        $navCategory,
      );
    }
  }

  isMobile.addEventListener('change', handleView);
  handleView();
  await buildDropDowns($header);
}
