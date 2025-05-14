import {
  div,
  input,
  h2,
  h3,
  h4,
  p,
  a,
  button,
  span,
} from '../../scripts/dom-helpers.js';
import { getRegionLocale, translate } from '../../scripts/utils.js';
import { addIngredientToCart } from '../../scripts/add-to-cart.js';
import { viewAllDocsModal } from '../../scripts/product-utils.js';
import { API_PRODUCT } from '../../scripts/product-api.js';
import ProductApiRenderer from '../search/product-api-renderer.js';
import { loadCSS } from '../../scripts/aem.js';

const [region, locale] = getRegionLocale();

async function createIngredientPanel(ingredientResults) {
  const $sortDropdown = div();
  const $count = h3({ class: 'count' });
  const $pagination = div({ class: 'pagination' });
  const $perPageDropdown = div();
  const $articles = div({ class: 'articles' });
  const $filtersList = div();

  const $articleCard = (article) => {
    const addSampleBtn = a({ title: 'Add Sample', class: 'button add-sample-button' }, translate('add-sample'));
    addSampleBtn.addEventListener('click', () => addIngredientToCart(article.productName, window.location.href));

    const description = div({ class: 'description' });
    description.innerHTML = (article.description).replace(/&nbsp;/g, ' ');

    const viewAllDocsLink = a({ class: 'view-all' }, 'View All Documents');
    viewAllDocsLink.addEventListener('click', () => viewAllDocsModal(article));
    const relatedIngredientBlock = div(
      { class: 'related-ingredient' },
      div(
        { class: 'content' },
        h4({ class: 'product-name' }, article.heading),
        description,
        div(
          { class: 'cta-links' },
          viewAllDocsLink,
          a({ class: 'download-all', href: API_PRODUCT.DOWNLOAD_ALL_DOCUMENTS_FROM_SEARCH(region, locale, article.productId) }, 'Download All Documents'),
        ),
      ),
      div(
        { class: 'buttons' },
        addSampleBtn,
        a({ class: 'button secondary', href: `/na/en-us/ingredient?name=${article.productName}`, title: 'Learn More' }, 'Learn More'),
      ),
    );
    return relatedIngredientBlock;
  };

  const $articlePage = div(
    { class: 'article-list' },
    div(
      { class: 'filter-results-wrapper' },
      div(
        { class: 'filter' },
        $filtersList,
      ),
      div(
        { class: 'results' },
        div(
          { class: 'count-sort-wrapper' },
          $count,
          $sortDropdown,
        ),
        $articles,
        div(
          { class: 'controls' },
          $pagination,
          $perPageDropdown,
        ),
      ),
    ),
  );

  // Ingredient Renderer
  await new ProductApiRenderer({
    apiEndpoint: API_PRODUCT.SEARCH_INGREDIENT_BY_CATEGORY_SUBCATEGORY(region, locale),
    results: ingredientResults,
    articlesPerPageOptions: ['6', '12', '18', '24', '30'],
    paginationMaxBtns: 5,
    articleDiv: $articles,
    articleCard: $articleCard,
    filterTagsList: $filtersList,
    sortDropdown: $sortDropdown,
    paginationDiv: $pagination,
    perPageDropdown: $perPageDropdown,
    countDiv: $count,
    prefetchedData: true,
  }).render();
  return $articlePage;
}

function createDropdownOption(item) {
  const processedKey = (item.key && typeof item.key === 'string')
    ? encodeURIComponent(item.key.replace(/\s+/g, '+'))
    : item.key || '';
  const processedLabel = encodeURIComponent(item.label.replace(/\s+/g, '+'));
  return div({
    class: 'dropdown-option',
    'data-key': processedKey,
    'data-encoded-label': processedLabel,
  }, item.label);
}

function attachIngredientResults(block, ingredientResults, totalItemsCount, searchValue) {
  const $section = block.closest('.section');
  if ($section) {
    if ($section.querySelector('.ingredient-finder-results')) {
      $section.querySelector('.ingredient-finder-results').remove();
    }
    let $results = $section.querySelector('.results');
    if ($results) {
      $results.remove();
    }
    $results = div({ class: 'results' }, h2(`${totalItemsCount} results for: `), span({ class: 'search-value' }, searchValue));
    const $clearLink = a({ class: 'clear-link', href: '#' }, 'Clear');
    $clearLink.addEventListener('click', () => {
      // const [region, locale] = getRegionLocale();
      window.history.pushState({}, '', `/${region}/${locale}/ingredients/ingredient-finder`);
      window.location.reload();
    });
    $results.append($clearLink);
    $section.append($results);
    $section.append(ingredientResults);
  }
}

export default async function decorate(block) {
  let queryParams = 'activePage=1&perPage=6';
  let typeaheadData = null;
  let $dropdownOptions;

  // Helper function for ingredient search
  async function searchIngredients(searchValue) {
    if (!searchValue) return;
    const url = API_PRODUCT.SEARCH_INGREDIENTS_BY_NAME(region, locale);
    const searchParams = new URLSearchParams({
      activePage: '1',
      perPage: '6',
      q: searchValue,
    });
    // update the url with the new query params
    // const [region, locale] = getRegionLocale();
    window.history.pushState({}, '', `/${region}/${locale}/ingredients/ingredient-finder?${searchParams}`);
    let data;
    try {
      const response = await fetch(`${url}?${searchParams.toString()}`);
      if (!response.ok) throw new Error('Network response was not ok');
      data = await response.json();
    } catch (error) {
      console.error('Error searching ingredients:', error);
    }

    loadCSS('/blocks/related-ingredient/related-ingredient.css');
    const ingredientResults = await createIngredientPanel(data);
    ingredientResults.classList.add('search', 'ingredient-finder-results');
    attachIngredientResults(block, ingredientResults, data.totalItemsCount, searchValue);
  }

  function filterAndDisplayResults(query) {
    if (!typeaheadData || !query) {
      $dropdownOptions.innerHTML = '';
      return;
    }
    const filteredResults = typeaheadData.filter(
      (item) => item.name.toLowerCase().includes(query.toLowerCase()),
    );
    $dropdownOptions.innerHTML = filteredResults
      .map((item) => `<div class="typeahead-dropdown-option">${item.name}</div>`)
      .join('');
    const parentDropdown = $dropdownOptions.closest('.form-dropdown');
    if (filteredResults.length > 0) {
      parentDropdown.classList.remove('hidden');
    } else {
      parentDropdown.classList.add('hidden');
    }
  }

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

  function updateSearchButtonState(selected, selected1, $searchButton) {
    const hasApplication = selected.textContent !== 'Application';
    const hasSubApplication = selected1.textContent !== 'Sub Application';
    const $searchLink = $searchButton.querySelector('a');
    if (hasApplication || hasSubApplication) {
      $searchLink.classList.remove('disabled');
      $searchLink.setAttribute('aria-disabled', 'false');
    } else {
      $searchLink.classList.add('disabled');
      $searchLink.setAttribute('aria-disabled', 'true');
    }
  }

  function updateQuickSearchButtonState($searchInput, $iconSearchButton, $mainSearchButton) {
    const hasSearchValue = $searchInput.value.trim().length > 0;
    $iconSearchButton.classList.toggle('disabled', !hasSearchValue);
    $mainSearchButton.classList.toggle('disabled', !hasSearchValue);
    $iconSearchButton.disabled = !hasSearchValue;
    $mainSearchButton.setAttribute('aria-disabled', !hasSearchValue);
  }

  if (block.classList.contains('category')) {
    const $parent = div({ class: 'ingredient-finder-form-categories' });
    const heading = h4('Ingredient search by category');

    // Initialize main application dropdown
    const initialTab = input({
      type: 'hidden',
      name: 'initialTab',
      id: 'initialTab',
      placeholder: 'Application',
    });
    const selected = div({ class: 'selected' }, 'Application');

    // Fetch and process application data
    const apiResponse = await fetch(
      API_PRODUCT.POPULATE_INGREDIENT_CATEGORY_SUBCATEGORY(region, locale),
    );
    const data = await apiResponse.json();
    const options = div(
      { class: 'dropdown-options hidden' },
      ...data.applications.map(createDropdownOption),
    );
    const $application = div(
      { class: 'application select-dropdown' },
      initialTab,
      selected,
      options,
    );

    // Initialize sub-application dropdown
    const initialTab1 = input({
      type: 'hidden',
      name: 'initialTab',
      id: 'initialTab1',
      placeholder: 'Sub Application',
    });
    const selected1 = div({ class: 'selected disabled' }, 'Sub Application');
    const dropdownOptions1 = div({ class: 'dropdown-options hidden' });
    const $subApplication = div(
      { class: 'sub-application select-dropdown disabled' },
      initialTab1,
      selected1,
      dropdownOptions1,
    );

    const $searchButton = p(
      { class: 'button-container' },
      a(
        {
          class: 'button primary-cta primary-cta--small primary-cta--full-width disabled',
          href: '#',
          'aria-label': 'Search ingredients',
          role: 'button',
          'aria-disabled': 'true',
        },
        'Search ingredients',
      ),
    );

    selected.addEventListener('click', (e) => {
      e.stopPropagation();
      options.classList.toggle('hidden');
    });

    options.addEventListener('click', (e) => {
      const option = e.target.closest('.dropdown-option');
      if (option) {
        e.stopPropagation();
        selected.textContent = option.textContent;
        selected.classList.add('has-value');
        options.classList.add('hidden');
        queryParams = queryParams.replace(/&applicationID=[^&]*&applications=[^&]*/, '');
        const appKey = option.getAttribute('data-key');
        const appLabel = option.getAttribute('data-encoded-label');
        queryParams += `&applicationID=${appKey}&applications=${appLabel}`;
        // const [region, locale] = getRegionLocale();
        window.history.pushState({}, '', `/${region}/${locale}/ingredients/ingredient-finder?${queryParams}`);

        // Update sub-application options and enable the dropdown
        const selectedApp = data.applications.find((app) => app.label === option.textContent);
        if (selectedApp && selectedApp.children) {
          dropdownOptions1.innerHTML = '';
          selectedApp.children.forEach((subItem) => {
            const subOption = createDropdownOption(subItem);
            dropdownOptions1.appendChild(subOption);
          });
          selected1.textContent = 'Sub Application';
          selected1.classList.remove('disabled');
          $subApplication.classList.remove('disabled');
        }
        queryParams = queryParams.replace(/&subApplicationID=[^&]*&subApplications=[^&]*/, '');
        window.history.pushState({}, '', `/${region}/${locale}/ingredients/ingredient-finder?${queryParams}`);
        updateSearchButtonState(selected, selected1, $searchButton);
      }
    });

    selected1.addEventListener('click', (e) => {
      if ($subApplication.classList.contains('disabled')) {
        e.stopPropagation();
        return;
      }
      e.stopPropagation();
      dropdownOptions1.classList.toggle('hidden');
    });

    dropdownOptions1.addEventListener('click', (e) => {
      const option = e.target.closest('.dropdown-option');
      if (option) {
        e.stopPropagation();
        selected1.textContent = option.textContent;
        selected1.classList.add('has-value');
        dropdownOptions1.classList.add('hidden');
        queryParams = queryParams.replace(/&subApplicationID=[^&]*&subApplications=[^&]*/, '');
        const subKey = option.getAttribute('data-key');
        const subLabel = option.getAttribute('data-encoded-label');
        queryParams += `&subApplicationID=${subKey}&subApplications=${subLabel}`;
        // const [region, locale] = getRegionLocale();
        window.history.pushState({}, '', `/${region}/${locale}/ingredients/ingredient-finder?${queryParams}`);
        updateSearchButtonState(selected, selected1, $searchButton);
      }
    });

    $searchButton.addEventListener('click', async (e) => {
      const $searchLink = e.target.closest('a');
      if ($searchLink.classList.contains('disabled')) {
        e.preventDefault();
        return;
      }
      const url = API_PRODUCT.SEARCH_INGREDIENT_BY_CATEGORY_SUBCATEGORY(region, locale);
      const apiResponse1 = await fetch(`${url}?${queryParams}`);
      const data1 = await apiResponse1.json();

      loadCSS('/blocks/related-ingredient/related-ingredient.css');
      const ingredientResults = await createIngredientPanel(data1);
      ingredientResults.classList.add('search', 'ingredient-finder-results');
      const application = queryParams.split('&applications=')[1] ? queryParams.split('&applications=')[1].split('&')[0] : '';
      const subApplication = queryParams.split('&subApplications=')[1] ? queryParams.split('&subApplications=')[1].split('&')[0] : '';
      const processedApplication = decodeURIComponent(application).replace(/[+\s]/g, ' ');
      const processedSubApplication = decodeURIComponent(subApplication).replace(/[+\s]/g, ' ');
      const searchValue = subApplication ? `${processedApplication} - ${processedSubApplication}` : processedApplication;
      attachIngredientResults(block, ingredientResults, data1.totalItemsCount, searchValue);
    });

    document.addEventListener('click', (e) => {
      if (!$application.contains(e.target) && !$subApplication.contains(e.target)) {
        options.classList.add('hidden');
        dropdownOptions1.classList.add('hidden');
      }
    });

    $parent.append(heading, $application, $subApplication, $searchButton);
    block.append($parent);
  } else if (block.classList.contains('quick')) {
    const $parent = div({ class: 'ingredient-quick-search' });
    const heading = h4('Ingredient quick search');
    const $searchBar = div(
      { class: 'ingredient-quick-search-bar' },
      div(
        { class: 'form-typeahead form-typeahead-ingredient-search' },
        input({
          id: 'search',
          placeholder: 'Search for ingredients by keyword',
          name: 'q',
          'aria-label': 'Search Input',
          value: '',
          autocomplete: 'off',
        }),
        div(
          { class: 'form-dropdown form-input--type-ahead hidden' },
          div({ class: 'typeahead-dropdown-options' }),
        ),
        button(
          {
            type: 'submit',
            class: 'icon-search',
            'aria-label': 'Search Button',
          },
        ),
      ),
      p(
        { class: 'button-container' },
        a(
          {
            class: 'button-search button primary-cta primary-cta--small primary-cta--full-width',
            href: '#',
            'aria-label': 'Search ingredients',
            role: 'button',
          },
          'Search ingredients',
        ),
      ),
    );

    // Add typeahead functionality
    const $searchInput = $searchBar.querySelector('#search');
    $dropdownOptions = $searchBar.querySelector('.typeahead-dropdown-options');
    const $iconSearchButton = $searchBar.querySelector('button.icon-search');
    const $mainSearchButton = $searchBar.querySelector('.button-search');

    // Add event listeners for both search buttons
    const handleSearch = async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const searchValue = $searchInput.value.trim();
      if (!searchValue) return;
      await searchIngredients(searchValue);
    };

    $iconSearchButton.addEventListener('click', handleSearch);
    $mainSearchButton.addEventListener('click', handleSearch);

    const debouncedFilter = debounce(filterAndDisplayResults, 300);

    $searchInput.addEventListener('input', (e) => {
      debouncedFilter(e.target.value.trim());
      updateQuickSearchButtonState($searchInput, $iconSearchButton, $mainSearchButton);
    });

    // Initial button state
    updateQuickSearchButtonState($searchInput, $iconSearchButton, $mainSearchButton);

    $searchInput.addEventListener('focus', async () => {
      // Show search button
      $mainSearchButton.classList.remove('hidden');
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

    // Handle clicking outside to close dropdown and hide search button
    document.addEventListener('click', (e) => {
      if (!$searchInput.contains(e.target) && !$mainSearchButton.contains(e.target)) {
        const dropdown = $dropdownOptions.closest('.form-dropdown');
        dropdown.classList.add('hidden');
        $mainSearchButton.classList.add('hidden');
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

    $parent.append(heading, $searchBar);
    block.append($parent);
  }
}
