/* eslint-disable function-paren-newline, object-curly-newline */
import { loadFragment } from '../fragment/fragment.js';
import {
  div,
  nav,
  span,
  form,
  input,
  button,
  a,
  p,
} from '../../scripts/dom-helpers.js';
import { getCookie, getRegionLocale, loadTranslations, translate, throttle } from '../../scripts/utils.js';
import { API_PRODUCT } from '../../scripts/product-api.js';
import { createOptimizedPicture } from '../../scripts/aem.js';

const isMobile = window.matchMedia('(width < 1080px)');
const [region, locale] = getRegionLocale();
const $originalLogo = a(
  { class: 'logo', href: `/${region}/${locale}/`, 'aria-label': 'Home' },
  createOptimizedPicture(
    '/img/ingredion.webp',
    'Ingredion logo',
    true,
    [
      { media: '(min-width: 1080px)', width: '120', height: '40' },
      { media: '(min-width: 600px)', width: '100', height: '33' },
      { width: '80', height: '27' },
    ],
  ),
);
const ingredientQuickSearchFragmentPath = '/na/en-us/fragments/ingredient-finder-quick';
const ingredientCategorySearchFragmentPath = '/na/en-us/fragments/ingredient-finder-category';

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

    document.querySelectorAll('.utility').forEach((el) => {
      el.style.display = 'block';
    });

    document.querySelectorAll('.btn-tech-doc-samples').forEach((el) => {
      el.style.display = 'block';
    });
  });
}

function setDropdownHeights($header) {
  const activeDropdowns = $header.querySelectorAll('li.active > .dropdown');
  activeDropdowns.forEach((dropdown) => {
    dropdown.style.height = '';
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

async function buildIngredientFinderQuickDropdown(dropdown) {
  const ingredientFinder = await loadFragment(ingredientQuickSearchFragmentPath);
  if (!ingredientFinder) return;

  if (dropdown) {
    const ingredientQuickFinderBlock = ingredientFinder.querySelector('.ingredient-finder.quick');
    dropdown.prepend(ingredientQuickFinderBlock);
    ingredientQuickFinderBlock.prepend(div(p('Ingredient quick select')));

    const searchContainer = ingredientQuickFinderBlock.querySelector('.ingredient-quick-search');
    const viewDetailsBtn = a({ class: 'button view-details disabled' }, 'View details');
    const addSampleBtn = a(
      { class: 'button secondary add-sample disabled' },
      'Add sample',
    );
    const downloadAllBtn = a(
      { class: 'button download-all disabled' },
      'Download All Documents',
    );

    searchContainer.append(viewDetailsBtn);
    searchContainer.append(addSampleBtn);
    searchContainer.append(downloadAllBtn);

    const quickSearchInput = searchContainer.querySelector('#search');
    quickSearchInput.addEventListener('input', () => {
      const hasSearchInput = quickSearchInput.value.trim().length > 0;
      viewDetailsBtn.classList.toggle('disabled', !hasSearchInput);
      addSampleBtn.classList.toggle('disabled', !hasSearchInput);
      downloadAllBtn.classList.toggle('disabled', !hasSearchInput);
    });

    const wrapper = div();
    searchContainer.parentNode.insertBefore(wrapper, searchContainer);
    wrapper.appendChild(searchContainer);
    const outerWrapper = div();
    while (ingredientQuickFinderBlock.firstChild) {
      outerWrapper.appendChild(ingredientQuickFinderBlock.firstChild);
    }
    ingredientQuickFinderBlock.appendChild(outerWrapper);

    if (isMobile.matches) {
      const container = ingredientQuickFinderBlock.parentNode
        .querySelector('.header-dropdown-container')?.querySelector('.header-dropdown > div');

      const ingredientQuickFinderBlockDiv = ingredientQuickFinderBlock.querySelector('div');
      container.prepend(ingredientQuickFinderBlockDiv);
      ingredientQuickFinderBlock.remove();

      const dropdownTitle = ingredientQuickFinderBlockDiv.querySelector('p');
      dropdownTitle.classList.add('dropdown-title');
      searchContainer.classList.add('dropdown-content');

      if (!dropdownTitle.querySelector('.icon-add') && !dropdownTitle.querySelector('.icon-subtract')) {
        dropdownTitle.appendChild(span({ class: 'icon-add open' }));
        dropdownTitle.appendChild(span({ class: 'icon-subtract' }));
      }

      let isOpen = false;
      dropdownTitle.addEventListener('click', () => {
        isOpen = !isOpen;
        searchContainer.classList.toggle('open', isOpen);
        dropdownTitle.querySelector('.icon-add').classList.toggle('open', !isOpen);
        dropdownTitle.querySelector('.icon-subtract').classList.toggle('open', isOpen);
      });

      const titleWrapper = dropdownTitle.parentNode;
      titleWrapper.parentNode.insertBefore(dropdownTitle, titleWrapper);
      titleWrapper.remove();

      const searchContainerWrapper = searchContainer.parentNode;
      searchContainerWrapper.parentNode.insertBefore(searchContainer, searchContainerWrapper);
      searchContainerWrapper.remove();
    }
  }
}

async function buildIngredientFinderCategoryDropdown(dropdown) {
  const ingredientCategory = await loadFragment(ingredientCategorySearchFragmentPath);
  if (!ingredientCategory) return;

  const ingredientCategoryDiv = dropdown
    ?.querySelector('.header-dropdown')
    ?.querySelectorAll('div')[1];

  if (ingredientCategoryDiv) {
    const wrapper = ingredientCategory.querySelector('.ingredient-finder-wrapper');
    ingredientCategoryDiv.append(wrapper);
    dropdown.querySelector('.header-dropdown').classList.add('ingredient');

    const categoryDropdowns = wrapper.querySelectorAll('.application.select-dropdown, .sub-application.select-dropdown');
    categoryDropdowns.forEach((categoryDropdown) => {
      const selectedDiv = categoryDropdown.querySelector('.selected');
      if (selectedDiv && selectedDiv.textContent) {
        selectedDiv.textContent = `Select ${selectedDiv.textContent.trim()}`;
      }
    });

    const buttonContainer = wrapper.querySelector('.button-container');
    const anchor = buttonContainer?.querySelector('a');
    if (anchor) {
      anchor.textContent = 'Search';
    }

    if (isMobile.matches) {
      wrapper.classList.add('dropdown-content');
      const dropdownTitle = ingredientCategoryDiv.querySelector('.dropdown-title');

      let isOpen = false;
      dropdownTitle.addEventListener('click', () => {
        isOpen = !isOpen;
        wrapper.classList.toggle('open', isOpen);
        dropdownTitle.querySelector('.icon-add').classList.toggle('open', !isOpen);
        dropdownTitle.querySelector('.icon-subtract').classList.toggle('open', isOpen);
      });
    }
  }
}

async function buildDropdownsDesktop($header) {
  const links = [...$header.querySelectorAll('a[href*="/dropdowns"]')];
  let activeDropdown = null;

  async function attachDropdown(link) {
    const subNavPath = link.getAttribute('href');
    const attributes = {};
    // Copy all attributes from the link
    Array.from(link.attributes).forEach((attr) => {
      attributes[attr.name] = attr.value;
    });
    // Remove href since we're converting to div
    delete attributes.href;
    // Create new div with all original attributes
    const newDiv = div(attributes);
    // Move all children to the new div
    while (link.firstChild) {
      newDiv.appendChild(link.firstChild);
    }
    // Replace the link with the div
    link.parentElement.replaceChild(newDiv, link);
    newDiv.setAttribute('data-dropdown', 'true');

    const subNavFrag = await loadFragment(subNavPath);
    if (!subNavFrag) {
      newDiv.remove();
      return;
    }
    const $dropDown = div({ class: 'dropdown' });
    while (subNavFrag.firstElementChild) $dropDown.append(subNavFrag.firstElementChild);
    newDiv.parentElement.append($dropDown);

    if (subNavPath === '/na/en-us/header/dropdowns/our-ingredients') {
      await buildIngredientFinderCategoryDropdown($dropDown);
      await buildIngredientFinderQuickDropdown($dropDown);
    }

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

    newDiv.addEventListener('pointerenter', openDropdown);
  }

  const dropdownPromise = links.map(attachDropdown);

  document.addEventListener(
    'click',
    (event) => {
      if (activeDropdown && !activeDropdown.contains(event.target) && !event.target.closest('[data-dropdown]')) {
        activeDropdown.parentElement.classList.remove('active');
        activeDropdown = null;
      }
    },
    true,
  );

  document.addEventListener(
    'pointerleave',
    (event) => {
      if (activeDropdown && !activeDropdown.contains(event.target) && !event.target.closest('[data-dropdown]')) {
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
    const attributes = {};
    // Copy all attributes from the link
    Array.from(link.attributes).forEach((attr) => {
      attributes[attr.name] = attr.value;
    });
    // Remove href since we're converting to div
    delete attributes.href;
    // Create new div with all original attributes
    const newDiv = div(attributes);
    // Move all children to the new div
    while (link.firstChild) {
      newDiv.appendChild(link.firstChild);
    }
    // Replace the link with the div
    link.parentElement.replaceChild(newDiv, link);
    newDiv.setAttribute('data-dropdown', 'true');

    const spanWrapper = span({});
    while (newDiv.firstChild) {
      spanWrapper.appendChild(newDiv.firstChild);
    }
    newDiv.appendChild(spanWrapper);

    const viewAllButton = span({ class: 'view-all' }, 'VIEW ALL', span({ class: 'icon-green-arrow-up' }));
    newDiv.appendChild(viewAllButton);

    const subNavFrag = await loadFragment(subNavPath);
    if (!subNavFrag) {
      newDiv.remove();
      return;
    }

    const $dropDown = div({ class: 'dropdown' });
    while (subNavFrag.firstElementChild) {
      $dropDown.append(subNavFrag.firstElementChild);
    }

    newDiv.parentElement.append($dropDown);

    if (subNavPath === '/na/en-us/header/dropdowns/our-ingredients') {
      await buildIngredientFinderCategoryDropdown($dropDown);
      await buildIngredientFinderQuickDropdown($dropDown);
    }

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

    newDiv.addEventListener('click', openDropdown);
  }

  const dropdownPromise = links.map(attachDropdown);
  await Promise.all(dropdownPromise).then(() => {
    requestAnimationFrame(() => {
      $header.classList.add('loaded');
    });
  });
}

export default async function decorate(block) {
  await loadTranslations(locale);
  const searchText = translate('search').toLowerCase();
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

  const $searchBar = div({ class: 'search-bar' },
    form({ class: 'search', id: 'searchForm', action: `/${region}/${locale}/${searchText}` },
      div({ class: 'search-box' },
        (() => {
          const initialTab = input({ type: 'hidden', name: 'initialTab', id: 'initialTab', placeholder: 'All' });
          const selected = div({ class: 'selected' }, 'All');
          const optionsList = ['All', 'Content & Resource', 'Ingredients', 'Technical Documents & SDS', 'Event'];
          const options = div({ class: 'dropdown-options hidden' },
            ...optionsList.map((text) => div({ class: 'dropdown-option' }, text)),
          );
          const dropdown = div({ class: 'category select-dropdown' }, initialTab, selected, options);

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

              let tabValue = '';
              if (option.textContent === 'All') {
                tabValue = '';
              } else if (option.textContent === 'Content & Resource') {
                tabValue = '0';
              } else if (option.textContent === 'Ingredients') {
                tabValue = '1';
              } else if (option.textContent === 'Technical Documents & SDS') {
                tabValue = '2';
              } else if (option.textContent === 'Event') {
                tabValue = '3';
              }
              initialTab.value = tabValue;
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
          input({
            id: 'search',
            placeholder: 'Search',
            name: 'q',
            'aria-label': 'Search Input',
            value: '',
            autocomplete: 'off',
          }),
          div({ class: 'form-dropdown form-input--type-ahead hidden' },
            div({ class: 'typeahead-dropdown-options' }),
          ),
          button({ type: 'submit', class: 'icon-search', 'aria-label': 'Search Button' }),
        ),
      ),
      button({ type: 'submit', form: 'searchForm', class: 'button-search', 'aria-label': 'Search Button' }, 'Search'),
    ),
  );

  // Add typeahead functionality
  const $searchInput = $searchBar.querySelector('#search');
  const $dropdownOptions = $searchBar.querySelector('.typeahead-dropdown-options');
  let typeaheadData = null;

  function filterAndDisplayResults(query) {
    if (!typeaheadData || !query) {
      $dropdownOptions.innerHTML = '';
      return;
    }

    const filteredResults = typeaheadData.filter(
      (item) => item.name.toLowerCase().includes(query.toLowerCase()));

    $dropdownOptions.innerHTML = filteredResults
      .map((item) => `<div class="typeahead-dropdown-option">${item.name}</div>`)
      .join('');

    // Show/hide dropdown based on results
    const parentDropdown = $dropdownOptions.closest('.form-dropdown');
    if (filteredResults.length > 0) {
      parentDropdown.classList.remove('hidden');
    } else {
      parentDropdown.classList.add('hidden');
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
    // Show search button
    const searchButton = $searchBar.querySelector('button.button-search');
    searchButton.classList.remove('hidden');
    if (!typeaheadData) {
      try {
        const response = await fetch(API_PRODUCT.INGREDIENT_SEARCH_TYPEAHEAD(region, locale));
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

  // Prevent hiding search button when clicking it
  const searchButton = $searchBar.querySelector('button.button-search');
  searchButton.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  // Handle clicking outside to close dropdown and hide search button
  document.addEventListener('click', (e) => {
    if (!$searchInput.contains(e.target) && !searchButton.contains(e.target)) {
      const dropdown = $dropdownOptions.closest('.form-dropdown');
      dropdown.classList.add('hidden');
      searchButton.classList.add('hidden');
    }
  });

  // Handle option selection
  $dropdownOptions.addEventListener('click', (e) => {
    const option = e.target.closest('.typeahead-dropdown-option');
    if (option) {
      $searchInput.value = option.textContent;
      $searchInput.dataset.selectedProduct = option.textContent;
      const dropdown = $dropdownOptions.closest('.form-dropdown');
      dropdown.classList.add('hidden');
    }
  });

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
      document.body.classList.remove('menu-open');
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
