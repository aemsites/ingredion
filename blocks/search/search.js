/* eslint-disable function-call-argument-newline, max-len, function-paren-newline, object-curly-newline, no-shadow */
import { div, h3, h4, p, a, strong, span } from '../../scripts/dom-helpers.js';
import { buildBlock, decorateBlock, loadBlock, createOptimizedPicture, loadCSS } from '../../scripts/aem.js';
import { formatDate, translate } from '../../scripts/utils.js';
import { addIngredientToCart } from '../../scripts/add-to-cart.js';
import { viewAllDocsModal } from '../../scripts/product-utils.js';
import { API_HOST, API_PRODUCT } from '../../scripts/product-api.js';
import ContentResourcesRenderer from './content-renderer.js';
import ProductApiRenderer from './product-api-renderer.js';

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

/*
  Content & Resources Renderer
*/
async function createContentResourcesPanel(contentResourcesResults) {
  // const $search = div();
  const $sortDropdown = div();
  const $count = h3({ class: 'count' });
  const $pagination = div({ class: 'pagination' });
  const $perPageDropdown = div();
  const $articles = div({ class: 'articles' });
  const $filtersList = div();

  const $articleCard = (article) => div({ class: 'card' },
    a({ class: 'thumb', href: article.path },
      createOptimizedPicture(article.image, article.title, true, [{ width: '235' }]),
    ),
    div({ class: 'info' },
      h4(article.title),
      (() => {
        const descDiv = div({ class: 'description' });
        descDiv.innerHTML = article.description;
        return descDiv;
      })(),
      p({ class: 'date' }, formatDate(article.publishDate)),
      a({ class: 'button', href: article.path }, 'Learn More'),
    ),
  );

  const $articlePage = div({ class: 'article-list' },
    div({ class: 'filter-results-wrapper' },
      div({ class: 'filter' },
        $filtersList,
      ),
      div({ class: 'results' },
        div({ class: 'count-sort-wrapper' },
          $count,
          $sortDropdown,
        ),
        $articles,
        div({ class: 'controls' },
          $pagination,
          $perPageDropdown,
        ),
      ),
    ),
  );

  // Content & Resources Renderer
  await new ContentResourcesRenderer({
    prefetchedData: contentResourcesResults,
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

/*
  Ingredient Renderer
*/
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
    const relatedIngredientBlock = div({ class: 'related-ingredient' },
      div({ class: 'content' },
        h4({ class: 'product-name' }, article.heading),
        description,
        div({ class: 'cta-links' },
          viewAllDocsLink,
          a({ class: 'download-all', href: API_PRODUCT.DOWNLOAD_ALL_DOCUMENTS_FROM_SEARCH(article.productId) }, 'Download All Documents'),
        ),
      ),
      div({ class: 'buttons' },
        addSampleBtn,
        a({ class: 'button secondary', href: `/na/en-us/ingredient?name=${article.productName}`, title: 'Learn More' }, 'Learn More'),
      ),
    );
    return relatedIngredientBlock;
  };

  const $articlePage = div({ class: 'article-list' },
    div({ class: 'filter-results-wrapper' },
      div({ class: 'filter' },
        $filtersList,
      ),
      div({ class: 'results' },
        div({ class: 'count-sort-wrapper' },
          $count,
          $sortDropdown,
        ),
        $articles,
        div({ class: 'controls' },
          $pagination,
          $perPageDropdown,
        ),
      ),
    ),
  );

  // Ingredient Renderer
  await new ProductApiRenderer({
    apiEndpoint: API_PRODUCT.SEARCH_INGREDIENTS(),
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

/*
  Technical & SDS Documents Renderer
*/
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

    const relatedIngredientBlock = div({ class: 'related-ingredient' },
      div({ class: 'content' },
        h4({ class: 'product-name' }, article.assetName),
        description,
      ),
      div({ class: 'buttons' },
        a({ class: 'button secondary', href: `${API_HOST}${article.assetUrl}`, title: 'Download' }, 'Download'),
      ),
    );
    return relatedIngredientBlock;
  };

  const $articlePage = div({ class: 'article-list' },
    div({ class: 'filter-results-wrapper' },
      div({ class: 'filter' },
        $filtersList,
      ),
      div({ class: 'results' },
        div({ class: 'count-sort-wrapper' },
          $count,
          $sortDropdown,
        ),
        $articles,
        div({ class: 'controls' },
          $pagination,
          $perPageDropdown,
        ),
      ),
    ),
  );

  // Technical & SDS Documents Renderer
  await new ProductApiRenderer({
    apiEndpoint: API_PRODUCT.SEARCH_DOCUMENTS(),
    results: techDocsResults,
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

/*
  Events Renderer
*/
async function createEventPanel(eventsData) {
  const $count = h3({ class: 'count' });
  const $pagination = div({ class: 'pagination' });
  const $perPageDropdown = div();
  const $articles = div({ class: 'articles' });

  // TODO: Fix date - meeting with Jessica on May 5th
  const $articleCard = (article) => div({ class: 'card' },
    div({ class: 'image-wrapper' },
      div({ class: 'thumb' },
        p({ class: 'type' }, JSON.parse(article.eventType)),
        createOptimizedPicture(article.image, article.title, true, [{ width: '235' }]),
      ),
    ),
    div({ class: 'info' },
      p({ class: 'date' }, JSON.parse(article.eventDate)),
      h4(article.title),
      article.eventType && JSON.parse(article.eventType).length ? p({ class: 'details' }, strong('Event Type: '), JSON.parse(article.eventType)) : null,
      article.location && JSON.parse(article.location).length ? p({ class: 'details' }, strong('Location: '), JSON.parse(article.location)) : null,
      article.boothNumber && JSON.parse(article.boothNumber).length ? p({ class: 'details' }, strong('Booth Number: '), JSON.parse(article.boothNumber)) : null,
      div({ class: 'description' }, JSON.parse(article.content)),
    ),
    div({ class: 'buttons' },
      (() => {
        if (article.watchNow && JSON.parse(article.watchNow).length) {
          return a({ class: 'button', href: JSON.parse(article.watchNow) }, 'Watch Now');
        } if (article.registrationEventSite && JSON.parse(article.registrationEventSite).length) {
          return a({ class: 'button', href: JSON.parse(article.registrationEventSite) }, 'Register');
        }
        return null;
      })(),
      a({ class: 'button secondary', href: article.path }, 'Go To Event Site'),
    ),
  );

  const $articlePage = div({ class: 'article-list events' },
    div({ class: 'filter-results-wrapper' },
      div({ class: 'results' },
        div({ class: 'count-sort-wrapper' },
          $count,
        ),
        $articles,
        div({ class: 'controls' },
          $pagination,
          $perPageDropdown,
        ),
      ),
    ),
  );

  // events renderer
  await new ContentResourcesRenderer({
    prefetchedData: eventsData,
    articlesPerPageOptions: ['6', '12', '18', '24', '30'],
    paginationMaxBtns: 5,
    articleDiv: $articles,
    articleCard: $articleCard,
    paginationDiv: $pagination,
    perPageDropdown: $perPageDropdown,
    countDiv: $count,
    skipSearchFilter: true,
  }).render();
  return $articlePage;
}

async function displaySearchResults(
  block,
  ingredientResults,
  techDocsResults,
  contentResourcesResults,
  eventsResults,
  eventsIndex,
  totalResults,
) {
  const params = new URLSearchParams(window.location.search);
  const initialTab = parseInt(params.get('initialTab'), 10) || 0;
  const query = params.get('q');
  const resultsContainer = div({ class: 'search-results' });

  // Create tab block structure
  const tabWrapper = div();
  const tabBlock = buildBlock('tabs', '');
  tabBlock.innerHTML = '';

  // Create sections for each tab
  const sections = [
    {
      title: 'Content & Resources',
      count: contentResourcesResults?.length || 0,
      panel: () => createContentResourcesPanel(contentResourcesResults),
      index: 0,
    },
    {
      title: 'Ingredients',
      count: ingredientResults.totalItemsCount,
      panel: () => createIngredientPanel(ingredientResults),
      index: 1,
    },
    {
      title: 'Technical & SDS Documents',
      count: techDocsResults.totalItemsCount,
      panel: () => createTechDocsPanel(techDocsResults),
      index: 2,
    },
    {
      title: 'Events',
      count: eventsResults?.length || 0,
      panel: () => {
        // Sort events by date (newest first)
        const sortedEvents = [...eventsResults].sort((a, b) => {
          const dateA = new Date(JSON.parse(a.eventDate));
          const dateB = new Date(JSON.parse(b.eventDate));
          return dateB - dateA;
        });
        return createEventPanel(sortedEvents);
      },
      index: 3,
    },
  ];

  loadCSS('/blocks/related-ingredient/related-ingredient.css');

  // Filter out sections with no results
  const sectionsWithResults = sections.filter((section) => section.count > 0);

  // Filter out sections with no results and create panels
  const visibleSections = await Promise.all(
    sectionsWithResults
      .map(async (section) => ({
        ...section,
        title: {
          text: section.title,
          count: section.count,
        },
        panel: await section.panel(),
      })),
  );

  // Determine which tab should be active
  const activeTabIndex = Math.min(initialTab, visibleSections.length - 1);

  // Create tab sections
  tabBlock.append(...visibleSections.map((section, idx) => div({ 'aria-selected': idx === activeTabIndex },
    div({ 'data-valign': 'middle' }, p(
      section.title.text,
      span({ class: 'count' }, ` (${section.title.count})`),
    )),
    div({ 'data-valign': 'middle', class: 'button-container' },
      div({ class: 'panel-content', 'aria-hidden': idx !== activeTabIndex }, section.panel),
    ),
  ),
  ));

  tabWrapper.append(tabBlock);
  decorateBlock(tabBlock);
  await loadBlock(tabBlock);

  resultsContainer.append(tabWrapper);
  block.innerHTML = '';

  // Use the passed-in totalResults parameter
  if (totalResults > 0) {
    block.append(
      div({ class: 'total-results' },
        h3(
          `${totalResults} results for `,
          span({ class: 'query' }, `"${query}"`),
        ),
      ),
      resultsContainer,
    );
  } else {
    block.append(
      div({ class: 'total-results' },
        h3(
          'No results for ',
          span({ class: 'query' }, `"${query}"`),
        ),
      ),
      div({ class: 'no-results-message' }, 'We have found no results'),
    );
  }
}

async function fetchSearchResults(searchParams) {
  const globalIndexUrl = '/na/en-us/indexes/global-index.json';
  const newsEventsIndexUrl = '/na/en-us/indexes/news-events-index.json';

  // Create a cache object to store promises
  const cache = new Map();

  const fetchWithCache = async (url) => {
    if (!cache.has(url)) {
      cache.set(url, fetch(url).then((res) => res.json()));
    }
    return cache.get(url);
  };

  try {
    // Construct the ingredient and tech docs URLs with all search params
    const ingredientUrl = `${API_PRODUCT.SEARCH_INGREDIENTS()}?${searchParams.toString()}`;
    const techDocsUrl = `${API_PRODUCT.SEARCH_DOCUMENTS()}?${searchParams.toString()}`;

    // Make all requests in parallel and cache the index requests
    const [
      ingredientResults,
      techDocsResults,
      globalIndex,
      eventsIndex,
    ] = await Promise.all([
      fetchWithCache(ingredientUrl),
      fetchWithCache(techDocsUrl),
      fetchWithCache(globalIndexUrl),
      fetchWithCache(newsEventsIndexUrl),
    ]);

    // Filter the content resources and events based on the search query
    const query = searchParams.get('q');
    const contentResourcesResults = query ? filterIndex(globalIndex, query) : [];
    const eventsResults = query ? filterIndex(eventsIndex, query) : [];

    return {
      ingredientResults,
      techDocsResults,
      contentResourcesResults,
      eventsResults,
      eventsIndex,
    };
  } catch (error) {
    console.error('Error fetching search results:', error);
    throw error;
  }
}

export default function decorate(block) {
  block.classList.add('search', 'block');

  // show loader
  const loading = div({ class: 'loading' }, div({ class: 'loader' }));
  block.append(loading);

  // Initialize search asynchronously
  setTimeout(async () => {
    let totalResults = 0;
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');
    const initialTab = params.get('initialTab');

    try {
      const searchParams = new URLSearchParams({
        initialTab: initialTab || '',
        q: query || '',
      });

      // Use the consolidated API call
      const {
        ingredientResults,
        techDocsResults,
        contentResourcesResults,
        eventsResults,
        eventsIndex,
      } = await fetchSearchResults(searchParams);

      // Calculate total results
      const ingredientCount = ingredientResults.totalItemsCount;
      const techDocsCount = techDocsResults.totalItemsCount;
      const globalCount = contentResourcesResults?.length || 0;
      const eventsCount = eventsResults?.length || 0;
      totalResults = ingredientCount + techDocsCount + globalCount + eventsCount;

      // Remove loading state
      loading.remove();

      // Display results
      await displaySearchResults(
        block,
        ingredientResults,
        techDocsResults,
        contentResourcesResults,
        eventsResults,
        eventsIndex,
        totalResults,
      );
    } catch (error) {
      // Remove loading state and show error
      loading.remove();
      console.error('Error during search:', error);
      const errorMsg = 'An error occurred while searching. Please try again later.';
      block.innerHTML = `<div class="error-message">${errorMsg}</div>`;
    }
  }, 0);

  return block;
}
