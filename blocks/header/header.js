/* eslint-disable function-paren-newline, object-curly-newline */
import { loadFragment } from '../fragment/fragment.js';
import { div, span, img, form, input, button } from '../../scripts/dom-helpers.js';
import { getPathSegments } from '../../scripts/utils.js';

async function buildSubNav($header) {
  const links = Array.from($header.querySelectorAll('a'));
  let openDropdown = null;

  // map to create an array of promises for each link
  const linkPromises = links.map(async (link) => {
    const href = link.getAttribute('href');
    if (href && href.includes('/fragments')) {
      const subNavFrag = await loadFragment(href);

      const $dropDown = div({ class: 'dropdown' },
        subNavFrag.querySelector('.default-content-wrapper'),
      );

      link.insertAdjacentElement('afterend', $dropDown);

      link.addEventListener('mouseenter', () => {
        if (openDropdown && openDropdown !== $dropDown) {
          openDropdown.parentElement.classList.remove('active');
        }
        // Show the current dropdown and set it as open
        $dropDown.parentElement.classList.add('active');
        openDropdown = $dropDown;
      });
    }
  });

  document.addEventListener('click', (event) => {
    if (openDropdown && !openDropdown.contains(event.target) && !event.target.matches('a')) {
      openDropdown.parentElement.classList.remove('active');
      openDropdown = null;
    }
  });
  // Await all link promises to ensure they are fully processed
  await Promise.all(linkPromises);
}

export default async function decorate(block) {
  block.remove();
  const [region, locale] = getPathSegments();
  const navPath = `/${region}/${locale}/header/header`;
  const navFrag = await loadFragment(navPath);

  const navSections = navFrag.querySelectorAll('.default-content-wrapper');
  const $header = document.querySelector('header');

  const $cart = div({ class: 'cart' },
    span({ class: 'icon-cart' }, '\u{e919}'),
    span({ class: 'count hide' }),
  );

  const $utilityNav = div({ class: 'utility' },
    ...Array.from(navSections[0].childNodes),
  );


  const $search = input({ id: 'search-key', 'aria-label': 'Search Input' })

  const $logoNav = div({ class: 'logo-search' },
    div({ class: 'logo' },
      img({ src: '/icons/ingredion.svg', width: 120, alt: 'Ingredion logo' }),
    ),
    form({ class: 'search' },
      div({ class: 'dropdown' }, 'All'),
      $search,
      button({ type: 'submit', class: 'icon-search', 'aria-label': 'Search Button' }),
    ),
    ...Array.from(navSections[1].childNodes),
  );

  const $categoryNav = div({ class: 'category' }, ...Array.from(navSections[2].childNodes));

  $header.append(
    $utilityNav,
    $cart,
    $logoNav,
    $categoryNav,
  );

  await buildSubNav($header);
}
