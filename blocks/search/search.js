import {
  div,
  h3,
  h4,
  p,
  a,
} from '../../scripts/dom-helpers.js';
import {
  buildBlock,
  decorateBlock,
  loadBlock,
  createOptimizedPicture,
  loadCSS,
} from '../../scripts/aem.js';
import { formatDate, translate } from '../../scripts/utils.js';
import IngredientRenderer from './search-ingredients-renderer.js';
import ContentResourcesRenderer from './search-content-resources-renderer.js';
import DocumentRenderer from './search-documents-renderer.js';
import EventsRenderer from './search-events-renderer.js';
import { addIngredientToCart } from '../../scripts/add-to-cart.js';
import { viewAllDocsModal } from '../../scripts/product-utils.js';
import { API_HOST, API_PRODUCT } from '../../scripts/product-api.js';

function filterIndex(results, query) {
  if (!query) return [];

  const searchQuery = query.toLowerCase();
  return results.data.filter((item) => {
    const title = (item.heading || '').toLowerCase();
    const description = (item.productId || '').toLowerCase();
    const content = (item.content || '').toLowerCase();
    const keywords = (item.keywords || '').toLowerCase();

    return title.includes(searchQuery)
      || description.includes(searchQuery)
      || content.includes(searchQuery)
      || keywords.includes(searchQuery);
  });
}

// Helper function to create ingredient panel
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
    description.innerHTML = (article.description).replace(/&nbsp;/g, ' '); // replace &nbsp; for natural word wrapping

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
          a({ class: 'download-all', href: API_PRODUCT.DOWNLOAD_ALL_DOCUMENTS_FROM_SEARCH(article.productId) }, 'Download All Documents'),
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
      { class: 'filter-search-sort', style: 'justify-content: end;' },
      $sortDropdown,
    ),
    div(
      { class: 'filter-results-wrapper' },
      div(
        { class: 'filter' },
        $filtersList,
      ),
      div(
        { class: 'results' },
        $count,
        $articles,
        div(
          { class: 'controls' },
          $pagination,
          $perPageDropdown,
        ),
      ),
    ),
  );

  await new IngredientRenderer({
    ingredientResults,
    articlesPerPageOptions: ['6', '12', '18', '24', '30'],
    paginationMaxBtns: 5,
    articleDiv: $articles,
    articleCard: $articleCard,
    filterTagsList: $filtersList,
    sortDropdown: $sortDropdown,
    paginationDiv: $pagination,
    perPageDropdown: $perPageDropdown,
    countDiv: $count,
  }).render();
  return $articlePage;
}

// Helper function to create global panel
async function createContentResourcesPanel() {
  const $search = div();
  const $sortDropdown = div();
  const $count = h3({ class: 'count' });
  const $pagination = div({ class: 'pagination' });
  const $perPageDropdown = div();
  const $articles = div({ class: 'articles' });
  const $filtersList = div();

  const $articleCard = (article) => div(
    { class: 'card' },
    a(
      { class: 'thumb', href: article.path },
      createOptimizedPicture(article.image, article.title, true, [{ width: '235' }]),
    ),
    div(
      { class: 'info' },
      h4(article.title),
      p(article.description),
      p({ class: 'date' }, formatDate(article.publishDate)),
      a({ class: 'button', href: article.path }, 'Learn More'),
    ),
  );

  const $articlePage = div(
    { class: 'article-list' },
    div(
      { class: 'filter-search-sort', style: 'justify-content: end;' },
      $search,
      $sortDropdown,
    ),
    div(
      { class: 'filter-results-wrapper' },
      div(
        { class: 'filter' },
        $filtersList,
      ),
      div(
        { class: 'results' },
        $count,
        $articles,
        div(
          { class: 'controls' },
          $pagination,
          $perPageDropdown,
        ),
      ),
    ),
  );

  await new ContentResourcesRenderer({
    jsonPath: '/na/en-us/indexes/global-index.json',
    articlesPerPageOptions: ['6', '12', '18', '24', '30'],
    paginationMaxBtns: 5,
    articleDiv: $articles,
    articleCard: $articleCard,
    filterTagsList: $filtersList,
    sortDropdown: $sortDropdown,
    paginationDiv: $pagination,
    perPageDropdown: $perPageDropdown,
    countDiv: $count,
  }).render();
  return $articlePage;
}

// Helper function to create tech docs panel
async function createTechDocsPanel(techDocsResults) {
  const $sortDropdown = div();
  const $count = h3({ class: 'count' });
  const $pagination = div({ class: 'pagination' });
  const $perPageDropdown = div();
  const $articles = div({ class: 'articles' });
  const $filtersList = div();

  const $articleCard = (article) => {
    const description = div({ class: 'description' });
    description.innerHTML = `Document size: ${article.assetSize}`;

    const relatedIngredientBlock = div(
      { class: 'related-ingredient' },
      div(
        { class: 'content' },
        h4({ class: 'product-name' }, article.assetName),
        description,
      ),
      div(
        { class: 'buttons' },
        a({ class: 'button secondary', href: `${API_HOST}${article.assetUrl}`, title: 'Download' }, 'Download'),
      ),
    );
    return relatedIngredientBlock;
  };

  const $articlePage = div(
    { class: 'article-list' },
    div(
      { class: 'filter-search-sort', style: 'justify-content: end;' },
      $sortDropdown,
    ),
    div(
      { class: 'filter-results-wrapper' },
      div(
        { class: 'filter' },
        $filtersList,
      ),
      div(
        { class: 'results' },
        $count,
        $articles,
        div(
          { class: 'controls' },
          $pagination,
          $perPageDropdown,
        ),
      ),
    ),
  );

  await new DocumentRenderer({
    techDocsResults,
    articlesPerPageOptions: ['6', '12', '18', '24', '30'],
    paginationMaxBtns: 5,
    articleDiv: $articles,
    articleCard: $articleCard,
    filterTagsList: $filtersList,
    sortDropdown: $sortDropdown,
    paginationDiv: $pagination,
    perPageDropdown: $perPageDropdown,
    countDiv: $count,
  }).render();

  return $articlePage;
}

// Helper function to create global panel
async function createEventPanel() {
  const $search = div();
  const $sortDropdown = div();
  const $count = h3({ class: 'count' });
  const $pagination = div({ class: 'pagination' });
  const $perPageDropdown = div();
  const $articles = div({ class: 'articles' });
  const $filtersList = div();

  const $articleCard = (article) => div(
    { class: 'card' },
    a(
      { class: 'thumb', href: article.path },
      createOptimizedPicture(article.image, article.title, true, [{ width: '235' }]),
    ),
    div(
      { class: 'info' },
      h4(article.title),
      p(article.description),
    ),
  );

  const $articlePage = div(
    { class: 'article-list' },
    div(
      { class: 'filter-search-sort', style: 'justify-content: end;' },
      $search,
      $sortDropdown,
    ),
    div(
      { class: 'filter-results-wrapper' },
      div(
        { class: 'filter' },
        $filtersList,
      ),
      div(
        { class: 'results' },
        $count,
        $articles,
        div(
          { class: 'controls' },
          $pagination,
          $perPageDropdown,
        ),
      ),
    ),
  );

  await new EventsRenderer({
    jsonPath: '/na/en-us/indexes/global-index.json?sheet=news-events',
    articlesPerPageOptions: ['6', '12', '18', '24', '30'],
    paginationMaxBtns: 5,
    articleDiv: $articles,
    articleCard: $articleCard,
    // filterTagsList: $filtersList,
    // sortDropdown: $sortDropdown,
    paginationDiv: $pagination,
    perPageDropdown: $perPageDropdown,
    countDiv: $count,
  }).render();
  return $articlePage;
}

async function displaySearchResults(
  block,
  ingredientResults,
  techDocsResults,
  contentResourcesResults,
  eventsResults,
  totalResults,
) {
  const params = new URLSearchParams(window.location.search);
  const initialTab = parseInt(params.get('initialTab'), 10) || 0;
  const query = params.get('q');
  const resultsContainer = div({ class: 'search-results' });

  // Create tab block structure
  const tabWrapper = document.createElement('div');
  const tabBlock = buildBlock('tabs', '');
  tabBlock.innerHTML = '';

  // Create sections for each tab
  const sections = [
    {
      title: `Content & Resources (${contentResourcesResults?.length || 0})`,
      panel: await createContentResourcesPanel(),
      doShow: (contentResourcesResults?.length || 0) > 0,
      index: 0,
    },
    {
      title: `Ingredients (${ingredientResults.totalItemsCount})`,
      panel: await createIngredientPanel(ingredientResults),
      doShow: ingredientResults.totalItemsCount > 0,
      index: 1,
    },
    {
      title: `Technical & SDS Documents (${techDocsResults.totalItemsCount})`,
      panel: await createTechDocsPanel(techDocsResults),
      doShow: techDocsResults.totalItemsCount > 0,
      index: 2,
    },
    {
      title: `Events (${eventsResults?.length || 0})`,
      panel: await createEventPanel(),
      doShow: (eventsResults?.length || 0) > 0,
      index: 3,
    },
  ];

  loadCSS('/blocks/related-ingredient/related-ingredient.css');
  // Filter out sections with no results
  const visibleSections = sections.filter((section) => section.doShow);

  // Determine which tab should be active
  const activeTabIndex = Math.min(initialTab, visibleSections.length - 1);

  visibleSections.forEach((section, idx) => {
    const tabSection = document.createElement('div');

    const titleContainer = document.createElement('div');
    titleContainer.setAttribute('data-valign', 'middle');
    titleContainer.innerHTML = `<p>${section.title}</p>`;

    const contentContainer = document.createElement('div');
    contentContainer.setAttribute('data-valign', 'middle');
    contentContainer.classList.add('button-container');
    const panelContent = document.createElement('div');
    panelContent.classList.add('panel-content');
    panelContent.setAttribute('aria-hidden', idx !== activeTabIndex);

    panelContent.append(section.panel);
    contentContainer.append(panelContent);

    tabSection.append(titleContainer, contentContainer);
    tabSection.setAttribute('aria-selected', idx === activeTabIndex);
    tabBlock.append(tabSection);
  });

  tabWrapper.append(tabBlock);
  decorateBlock(tabBlock);
  await loadBlock(tabBlock);

  resultsContainer.append(tabWrapper);
  block.innerHTML = '';

  if (totalResults > 0) {
    block.append(div({ class: 'total-results' }, h3(`${totalResults} results for "${query}"`)));
    block.append(resultsContainer);
  } else {
    block.append(div({ class: 'total-results' }, h3(`No results for "${query}"`)));
    block.append(div({ class: 'no-results-message' }, 'We have found no results'));
  }
}

async function fetchSearchResults(searchParams) {
  const globalIndexUrl = '/na/en-us/indexes/global-index.json';

  try {
    const [ingredientResults,
      techDocsResults,
      contentResourcesResults,
      eventsResults] = await Promise.all([
      fetch(`${API_PRODUCT.SEARCH_INGREDIENTS()}?${searchParams.toString()}`)
        .then((res) => res.json()),
      fetch(`${API_PRODUCT.SEARCH_DOCUMENTS()}?${searchParams.toString()}`)
        .then((res) => res.json()),
      fetch(globalIndexUrl)
        .then((res) => res.json()),
      fetch(`${globalIndexUrl}?sheet=news-events`)
        .then((res) => res.json()),
    ]);

    return {
      ingredientResults,
      techDocsResults,
      contentResourcesResults,
      eventsResults,
    };
  } catch (error) {
    console.error('Error fetching search results:', error);
    throw error;
  }
}

export default async function decorate(block) {
  let totalResults = 0;
  block.classList.add('search', 'block');

  const params = new URLSearchParams(window.location.search);
  const query = params.get('q');
  const initialTab = params.get('initialTab');

  try {
    const searchParams = new URLSearchParams({
      initialTab: initialTab || '',
      q: query || '',
    });

    // Use the new consolidated API call
    const {
      ingredientResults,
      techDocsResults,
      contentResourcesResults,
      eventsResults,
    } = await fetchSearchResults(searchParams);

    const filteredContentResorcesResults = filterIndex(contentResourcesResults, query);
    const ingredientCount = ingredientResults.totalItemsCount;
    const techDocsCount = techDocsResults.totalItemsCount;
    const globalCount = filteredContentResorcesResults?.length || 0;
    const filteredEventsResults = filterIndex(eventsResults, query);
    const eventsCount = filteredEventsResults?.length || 0;
    totalResults = ingredientCount + techDocsCount + globalCount + eventsCount;

    await displaySearchResults(
      block,
      ingredientResults,
      techDocsResults,
      filteredContentResorcesResults,
      filteredEventsResults,
      totalResults,
    );
  } catch (error) {
    console.error('Error during search:', error);
    const errorMsg = 'An error occurred while searching. Please try again later.';
    block.innerHTML = `<div class="error-message">${errorMsg}</div>`;
  }
}
