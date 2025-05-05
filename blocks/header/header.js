/* eslint-disable function-paren-newline, object-curly-newline */
import { loadFragment } from '../fragment/fragment.js';
import {
  div,
  nav,
  span,
  img,
  form,
  input,
  button,
  a,
} from '../../scripts/dom-helpers.js';
import { getCookie, getRegionLocale, throttle } from '../../scripts/utils.js';

const isMobile = window.matchMedia('(width < 1080px)');
const [region, locale] = getRegionLocale();
const $originalLogo = a(
  { class: 'logo', href: `/${region}/${locale}/`, 'aria-label': 'Home' },
  img({ src: '/icons/ingredion.svg', width: 120, alt: 'Ingredion logo' }),
);

function resetDropdownsMobile($header) {
  $header.querySelectorAll('.category .dropdown').forEach((dropdown) => {
    dropdown.style.display = 'none';

    const container = dropdown.parentElement;
    container.style.display = 'block';
    container.classList.remove('active');

    dropdown.querySelectorAll('.dropdown-content.open').forEach((el) => {
      el.classList.remove('open');
    });

    container.querySelectorAll('.view-all').forEach((el) => {
      el.classList.remove('active');
    });

    document.querySelectorAll('.icon-add').forEach((el) => {
      el.classList.add('open');
    });

    document.querySelectorAll('.icon-subtract').forEach((el) => {
      el.classList.remove('open');
    });
  });
}

function setDropdownHeights($header) {
  $header.querySelectorAll('.dropdown').forEach((dropdown) => {
    dropdown.style.display = 'block';
    dropdown.style.visibility = 'hidden';
    dropdown.style.position = 'absolute';

    const heights = Array.from(dropdown.querySelectorAll('[data-height]')).map(
      (el) => {
        const height = el.clientHeight;
        el.removeAttribute('data-height');
        return height;
      },
    );

    let maxHeight = Math.max(0, ...heights);
    const $row = dropdown.querySelector('.section.row');
    if ($row) maxHeight += $row.clientHeight;

    dropdown.style.height = `${maxHeight}px`;

    dropdown.style.display = '';
    dropdown.style.visibility = '';
    dropdown.style.position = '';
  });
}

async function buildDropdownsDesktop($header) {
  const links = [...$header.querySelectorAll('a[href*="/dropdowns"]')];
  let activeDropdown = null;

  async function attachDropdown(link) {
    const subNavPath = link.getAttribute('href');
    link.removeAttribute('href');
    link.setAttribute('data-dropdown', 'true');

    const subNavFrag = await loadFragment(subNavPath);
    if (!subNavFrag) {
      link.remove();
      return;
    }
    const $dropDown = div({ class: 'dropdown' });
    while (subNavFrag.firstElementChild) $dropDown.append(subNavFrag.firstElementChild);
    link.parentElement.append($dropDown);

    const openDropdown = throttle(
      () => {
        if (activeDropdown && activeDropdown !== $dropDown) {
          activeDropdown.parentElement.classList.remove('active');
        }
        $dropDown.parentElement.classList.add('active');
        activeDropdown = $dropDown;
      },
      100,
      140,
    );

    link.addEventListener('pointerenter', openDropdown);
  }

  const dropdownPromise = links.map(attachDropdown);

  document.addEventListener(
    'click',
    (event) => {
      if (activeDropdown && !activeDropdown.contains(event.target) && !event.target.closest('a[data-dropdown]')) {
        activeDropdown.parentElement.classList.remove('active');
        activeDropdown = null;
      }
    },
    true,
  );

  document.addEventListener(
    'pointerleave',
    (event) => {
      if (activeDropdown && !activeDropdown.contains(event.target) && !event.target.closest('a[data-dropdown]')) {
        activeDropdown.parentElement.classList.remove('active');
        activeDropdown = null;
      }
    },
    true,
  );

  await Promise.all(dropdownPromise).then(() => {
    requestAnimationFrame(() => {
      setDropdownHeights($header);
      $header.classList.add('loaded');
    });
  });
}

async function buildDropdownsMobile($header) {
  const links = [...$header.querySelectorAll('a[href*="/dropdowns"]')];
  const utility = document.querySelector('.utility');
  const btnTechDocSamples = document.querySelector('.btn-tech-doc-samples');

  const backButton = a(
    { class: 'back-button' },
    span({ class: 'icon-green-arrow-up' }),
    span({ class: 'back-text' }, 'BACK'),
  );

  backButton.addEventListener('click', () => {
    utility.style.display = 'block';
    btnTechDocSamples.style.display = 'block';

    resetDropdownsMobile($header);

    const btnContainer = document.querySelector('.btn-container');
    btnContainer.replaceChildren($originalLogo);
  });

  async function attachDropdown(link) {
    const subNavPath = link.getAttribute('href');
    link.removeAttribute('href');
    link.setAttribute('data-dropdown', 'true');

    const spanWrapper = span({});
    while (link.firstChild) {
      spanWrapper.appendChild(link.firstChild);
    }
    link.appendChild(spanWrapper);

    const viewAllButton = span({ class: 'view-all' }, 'VIEW ALL', span({ class: 'icon-green-arrow-up' }));
    link.appendChild(viewAllButton);

    const subNavFrag = await loadFragment(subNavPath);
    if (!subNavFrag) {
      link.remove();
      return;
    }

    const $dropDown = div({ class: 'dropdown' });
    while (subNavFrag.firstElementChild) {
      $dropDown.append(subNavFrag.firstElementChild);
    }

    link.parentElement.append($dropDown);

    const openDropdown = throttle(
      () => {
        $header.querySelectorAll('.dropdown').forEach((dropdown) => {
          if (dropdown !== $dropDown) {
            dropdown.parentElement.classList.remove('active');
            dropdown.parentElement.style.display = 'none';
          }
        });

        $dropDown.style.display = 'block';
        $dropDown.parentElement.classList.add('active');
        viewAllButton.classList.add('active');

        const btnContainer = document.querySelector('.btn-container');
        btnContainer.replaceChildren(backButton);

        if (utility.style.display === 'none') {
          utility.style.display = 'block';
        } else {
          utility.style.display = 'none';
        }
        btnTechDocSamples.style.display = 'none';
      },
      100,
      140,
    );

    link.addEventListener('click', openDropdown);
  }

  const dropdownPromise = links.map(attachDropdown);
  await Promise.all(dropdownPromise).then(() => {
    requestAnimationFrame(() => {
      $header.classList.add('loaded');
    });
  });
}

export default async function decorate(block) {
  block.remove();
  const navPath = `/${region}/${locale}/header/header`;
  const navFrag = await loadFragment(navPath, false);
  const navSections = navFrag.querySelectorAll('main > div');
  const $utilityLinks = Array.from(
    navSections[0].querySelectorAll(':scope > *'),
  );
  const $btnTechDocSamples = div(
    { class: 'btn-tech-doc-samples' },
    navSections[1].querySelector(':scope > p > a'),
  );
  const $categoryNav = Array.from(
    navSections[2].querySelectorAll(':scope > *'),
  );

  const $header = document.querySelector('header');

  const $btnCart = a(
    {
      class: 'icon-cart',
      href: `/${region}/${locale}/sample-cart`,
      'aria-label': 'Cart',
    },
    '\u{e919}',
    span(
      { class: 'count' },
      (() => {
        const cartCookies = getCookie('cartCookies');
        if (!cartCookies || cartCookies.split('cookie ').length === 0) {
          return '0';
        }
        return (cartCookies.split('cookie ').length - 1).toString();
      })(),
    ),
  );

  if ($btnCart.querySelector('.count').textContent === '0') {
    $btnCart.querySelector('.count').classList.add('hide');
  }

  const $btnBurger = button({ class: 'icon-burger', 'aria-label': 'Menu' });
  $btnBurger.addEventListener('click', () => {
    document.body.classList.toggle('menu-open');

    resetDropdownsMobile($header);

    const btnContainer = document.querySelector('.btn-container');
    const hasBackButton = btnContainer.querySelector('.back-button');
    if (hasBackButton) {
      btnContainer.replaceChildren($originalLogo);
    }
  });

  const $searchBar = div(
    { class: 'search-bar' },
    form(
      { class: 'search', id: 'searchForm' },
      div(
        { class: 'search-box' },
        div(
          { class: 'category select-dropdown' },
          div({ class: 'selected' }, 'All'),
        ),
        input({ id: 'search', 'aria-label': 'Search Input' }),
        button({
          type: 'submit',
          class: 'icon-search',
          'aria-label': 'Search Button',
        }),
      ),
      button(
        {
          type: 'submit',
          form: 'searchForm',
          class: 'button-search',
          'aria-label': 'Search Button',
        },
        'Search',
      ),
    ),
  );

  const $navCategory = nav({ class: 'category' }, ...$categoryNav);

  async function handleView() {
    $header.innerHTML = '';
    if (isMobile.matches) {
      $header.append(
        div(
          { class: 'logo-cart-burger-wrap' },
          div({ class: 'btn-container' }, $originalLogo.cloneNode(true)),
          $btnCart.cloneNode(true),
          $btnBurger,
        ),
        $searchBar.cloneNode(true),
        div(
          { class: 'mobile-menu' },
          $navCategory.cloneNode(true),
          $btnTechDocSamples.cloneNode(true),
          nav(
            { class: 'utility' },
            ...$utilityLinks.map((link) => link.cloneNode(true)),
          ),
        ),
      );
      await buildDropdownsMobile($header);
    } else {
      $header.append(
        nav(
          { class: 'utility' },
          ...$utilityLinks.map((link) => link.cloneNode(true)),
          $btnCart.cloneNode(true),
        ),
        div(
          { class: 'logo-search-btn-wrap' },
          div({ class: 'btn-container' }, $originalLogo.cloneNode(true)),
          $searchBar.cloneNode(true),
          $btnTechDocSamples.cloneNode(true),
        ),
        $navCategory.cloneNode(true),
      );
      await buildDropdownsDesktop($header);
    }
  }

  handleView();
  isMobile.addEventListener('change', handleView);
}
