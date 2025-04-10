/* eslint-disable function-paren-newline, object-curly-newline */
import { loadFragment } from '../fragment/fragment.js';
import { div, nav, span, img, form, input, button, a } from '../../scripts/dom-helpers.js';
import { getCookie, getRegionLocale, throttle } from '../../scripts/utils.js';

const isMobile = window.matchMedia('(width < 1080px)');

async function buildDropDowns($header) {
  const links = [...$header.querySelectorAll('a[href*="/dropdowns"]')];
  let activeDropdown = null;

  function getEventType(link) {
    return link.closest('.utility') || isMobile.matches ? 'click' : 'pointerenter';
  }

  async function attachDropdown(link) {
    const subNavPath = link.getAttribute('href');
    // remove to prevent click action and from being shown in the browser
    link.removeAttribute('href');
    link.setAttribute('data-dropdown', 'true');

    // Load fragment and append dropdown content
    const subNavFrag = await loadFragment(subNavPath);
    if (!subNavFrag) { link.remove(); return; }
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
    }, 100, 140); // small delay to prevent unintentional events

    link.addEventListener(eventType, openDropdown);

    // update event on viewport change
    isMobile.addEventListener('change', () => {
      link.removeEventListener(eventType, openDropdown);
      eventType = getEventType(link);
      link.addEventListener(eventType, openDropdown);
    });
  }

  // load dropdowns attach event listeners in parallel
  const dropdownPromise = links.map(attachDropdown);

  // close dropdown if clicked outside
  document.addEventListener('click', (event) => {
    if (activeDropdown && !activeDropdown.contains(event.target) && !event.target.closest('a[data-dropdown]')) {
      activeDropdown.parentElement.classList.remove('active');
      activeDropdown = null;
    }
  }, true);

  await Promise.all(dropdownPromise)
    .then(() => {
      // get height of child elements with data-height attr and set max height on dropdown
      $header.querySelectorAll('.dropdown').forEach((dropdown) => {
        // get all data-height items and calculate max height
        const heights = Array.from(dropdown.querySelectorAll('[data-height]'))
          .map((el) => {
            const height = el.clientHeight;
            el.removeAttribute('data-height');
            return height;
          });
        // set max height
        let maxHeight = Math.max(0, ...heights);
        // if row exists add height to max height
        const $row = dropdown.querySelector('.section.row');
        if ($row) maxHeight += $row.clientHeight;
        // set max height on dropdown
        dropdown.style.height = `${maxHeight}px`;
      });
      $header.classList.add('loaded');
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error('Error:', error);
    });
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

  const $btnCart = a({ class: 'icon-cart', href: `/${region}/${locale}/sample-cart`, 'aria-label': 'Cart' },
    '\u{e919}',
    span({ class: 'count' }, (() => {
      const cartCookies = getCookie('cartCookies');
      if (!cartCookies || cartCookies.split('cookie ').length === 0) {
        return '0';
      }
      return (cartCookies.split('cookie ').length - 1).toString();
    })()),
  );

  if ($btnCart.querySelector('.count').textContent === '0') {
    $btnCart.querySelector('.count').classList.add('hide');
  }

  const $btnBurger = button({ class: 'icon-burger', 'aria-label': 'Menu' });
  $btnBurger.addEventListener('click', () => {
    document.body.classList.toggle('menu-open');
  });

  const $logo = a({ class: 'logo', href: `/${region}/${locale}/`, 'aria-label': 'Home' },
    img({ src: '/icons/ingredion.svg', width: 120, alt: 'Ingredion logo' }),
  );

  const $searchBar = div({ class: 'search-bar' },
    form({ class: 'search', id: 'searchForm', action: `/${region}/${locale}/search` },
      div({ class: 'search-box' },
        (() => {
          const selected = div({ class: 'selected' }, 'All');
          const optionsList = ['All', 'Content & Resource', 'Ingredients', 'Technical Documents & SDS', 'Event'];
          const options = div({ class: 'dropdown-options hidden' },
            ...optionsList.map((text) => div({ class: 'dropdown-option' }, text)),
          );
          const dropdown = div({ class: 'category select-dropdown' }, selected, options);
          selected.addEventListener('click', (e) => {
            e.stopPropagation();
            options.classList.toggle('hidden');
          });
          options.addEventListener('click', (e) => {
            const option = e.target.closest('.dropdown-option');
            if (option) {
              e.stopPropagation();
              selected.textContent = option.textContent;
              options.classList.add('hidden');
            }
          });
          document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target)) {
              options.classList.add('hidden');
            }
          });
          return dropdown;
        })(),
        div({ class: 'form-typeahead form-typeahead--nav-search' },
          input({ id: 'search', placeholder: 'Search', name: 'q', 'aria-label': 'Search Input', value: '', autocomplete: 'off' }),
          div({ class: 'form-dropdown form-input--type-ahead' },
            div({ class: 'dropdown-options' }),
          ),
        ),
        // input({ id: 'search', 'aria-label': 'Search Input' }),
        button({ type: 'submit', class: 'icon-search', 'aria-label': 'Search Button' }),
      ),
      button({ type: 'submit', form: 'searchForm', class: 'button-search', 'aria-label': 'Search Button' }, 'Search'),
    ),
  );

  /*
  // Add typeahead functionality
  const $searchInput = $searchBar.querySelector('#search');
  const $dropdownOptions = $searchBar.querySelector('.form-dropdown__options');
  let typeaheadData = null;

  $searchInput.addEventListener('focus', async () => {
    if (!typeaheadData) {
      try {
        const response = await fetch('https://www.ingredion.com/content/ingredion-com/na/en-us.ingredient-search-typeahead.json');
        if (!response.ok) throw new Error('Network response was not ok');
        typeaheadData = await response.json();
        $searchInput.dataset.typeahead = JSON.stringify(typeaheadData);
      } catch (error) {
        console.error('Error fetching typeahead data:', error);
      }
    }
  }); */

  // Add typeahead functionality
  const $searchInput = $searchBar.querySelector('#search');
  const $dropdownOptions = $searchBar.querySelector('.dropdown-options');
  let typeaheadData = null;

  function filterAndDisplayResults(query) {
    if (!typeaheadData || !query) {
      $dropdownOptions.innerHTML = '';
      return;
    }

    const filteredResults = typeaheadData.filter(
      (item) => item.name.toLowerCase().includes(query.toLowerCase()));

    $dropdownOptions.innerHTML = filteredResults
      .map((item) => `<div class="dropdown-option">${item.name}</div>`)
      .join('');

    // Show/hide dropdown based on results
    const parentDropdown = $dropdownOptions.closest('.form-dropdown');
    if (filteredResults.length > 0) {
      parentDropdown.classList.add('show');
    } else {
      parentDropdown.classList.remove('show');
    }
  }

  // Debounce function to limit API calls
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  const debouncedFilter = debounce(filterAndDisplayResults, 300);

  $searchInput.addEventListener('input', (e) => {
    debouncedFilter(e.target.value.trim());
  });

  $searchInput.addEventListener('focus', async () => {
    if (!typeaheadData) {
      try {
        const response = await fetch('https://www.ingredion.com/content/ingredion-com/na/en-us.ingredient-search-typeahead.json');
        if (!response.ok) throw new Error('Network response was not ok');
        typeaheadData = await response.json();
        $searchInput.dataset.typeahead = JSON.stringify(typeaheadData);
        // Initial filter if there's already a value
        if ($searchInput.value) {
          filterAndDisplayResults($searchInput.value.trim());
        }
      } catch (error) {
        console.error('Error fetching typeahead data:', error);
      }
    }
  });

  // Handle clicking outside to close dropdown
  document.addEventListener('click', (e) => {
    if (!$searchInput.contains(e.target)) {
      const dropdown = $dropdownOptions.closest('.form-dropdown');
      dropdown.classList.remove('show');
    }
  });

  // Handle option selection
  $dropdownOptions.addEventListener('click', (e) => {
    const option = e.target.closest('.dropdown-option');
    if (option) {
      $searchInput.value = option.textContent;
      const dropdown = $dropdownOptions.closest('.form-dropdown');
      dropdown.classList.remove('show');
    }
  });

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
