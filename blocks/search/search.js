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
} from '../../scripts/aem.js';
import { getRegionLocale, formatDate } from '../../scripts/utils.js';
import IngredientRenderer from './search-ingredients-renderer.js';
import ContentResourcesRenderer from './search-content-resources-renderer.js';
import DocumentRenderer from './search-documents-renderer.js';

function filterGlobalIndex(results, query) {
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
  // get region locale using functions
  const [region, locale] = getRegionLocale();
  const $sortDropdown = div();
  const $count = h3({ class: 'count' });
  const $pagination = div({ class: 'pagination' });
  const $perPageDropdown = div();
  const $articles = div({ class: 'articles' });
  const $filtersList = div();

  const $articleCard = (article) => {
    const contentSection = div(
      div(
        { 'data-valign': 'middle' },
        h4(
          { id: article.heading?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || '' },
          `${article.heading || article.title}`,
        ),
        article.description && (() => {
          const description = p({ class: 'description' });
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = article.description;
          const textContent = tempDiv.textContent || tempDiv.innerText;

          if (textContent.length > 300) {
            const truncatedText = textContent.substring(0, 300);
            const truncatedTextWithEllipsis = `${truncatedText}...`;
            description.innerHTML = truncatedTextWithEllipsis;
          } else {
            description.innerHTML = article.description;
          }
          return description;
        })(),
        p(
          { class: 'button-container' },
          a(
            {
              href: article.path || '#',
              title: 'View All Documents',
              class: 'button',
            },
            'View All Documents',
          ),
        ),
        p(
          { class: 'button-container' },
          a(
            {
              href: `https://www.ingredion.com/content/ingredion-com/${region}/${locale}/search/jcr:content/searchResults.download.zip?productId=${article.productId}&documentType=all`,
              title: 'Download All Documents',
              class: 'button',
            },
            'Download All Documents',
          ),
        ),
      ),
    );

    const actionSection = div(
      div(
        { 'data-valign': 'middle' },
        p(
          { class: 'button-container' },
          a(
            { href: article.path || '#', title: 'Add sample', class: 'button' },
            'Add sample',
          ),
        ),
        p(
          { class: 'button-container' },
          a(
            { href: `https://main--ingredion--aemsites.aem.live/${region}/${locale}/ingredient?pid=${article.productId}&name=${article.productName}`, title: 'Learn more', class: 'button' },
            'Learn more',
          ),
        ),
      ),
    );

    const relatedIngredientBlock = buildBlock('related-ingredient', '');
    relatedIngredientBlock.innerHTML = '';
    relatedIngredientBlock.append(contentSection, actionSection);

    return div(
      { class: 'related-ingredient-wrapper' },
      relatedIngredientBlock,
    );
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
    const contentSection = div(
      div(
        { 'data-valign': 'middle' },
        h4(
          { id: article.assetName },
          `${article.assetName || article.title}`,
        ),
        article.assetSize && (() => {
          const description = p({ class: 'description' });
          description.innerHTML = `Document size: ${article.assetSize}`;
          return description;
        })(),
      ),
    );

    const actionSection = div(
      div(
        { 'data-valign': 'middle' },
        p(
          { class: 'button-container' },
          a(
            { href: `https://www.ingredion.com${article.assetUrl}`, title: 'Download', class: 'button' },
            'Download',
          ),
        ),
      ),
    );

    const relatedIngredientBlock = buildBlock('related-ingredient', '');
    relatedIngredientBlock.classList.add('search-docs');
    relatedIngredientBlock.innerHTML = '';
    relatedIngredientBlock.append(contentSection, actionSection);

    return div(
      { class: 'related-ingredient-wrapper' },
      relatedIngredientBlock,
    );
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

async function displaySearchResults(
  block,
  ingredientResults,
  techDocsResults,
  filteredGlobalResults,
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
      title: `Content & Resources (${filteredGlobalResults?.length || 0})`,
      panel: await createContentResourcesPanel(),
      doShow: (filteredGlobalResults?.length || 0) > 0,
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
  ];

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

// Add this new function near the top of the file, after imports
async function fetchSearchResults(searchParams) {
  const basePath = '/content/ingredion-com/na/en-us/search/jcr:content/searchResults';
  const baseUrl = `https://www.ingredion.com${basePath}`;
  const globalIndexUrl = 'https://main--ingredion--aemsites.aem.live'
    + '/na/en-us/indexes/global-index.json';

  try {
    const [ingredientResults, techDocsResults, globalResults] = await Promise.all([
      fetch(`${baseUrl}.ingredients.json?${searchParams.toString()}`)
        .then((res) => res.json()),
      fetch(`${baseUrl}.techDocs.json?${searchParams.toString()}`)
        .then((res) => res.json()),
      fetch(globalIndexUrl)
        .then((res) => res.json()),
    ]);

    return {
      ingredientResults,
      techDocsResults,
      globalResults,
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

  // Create loader and add it before the block
  const loadingEl = div(
    { class: 'search-loading' },
    div({ class: 'loading-spinner' }),
    div({ class: 'loading-text' }, 'Searching...'),
  );
  block.parentNode.insertBefore(loadingEl, block);

  try {
    const searchParams = new URLSearchParams({
      initialTab: initialTab || '',
      q: query || '',
    });

    // Show loader
    loadingEl.style.display = 'flex';
    block.style.display = 'none';

    // Use the new consolidated API call
    const {
      ingredientResults,
      techDocsResults,
      globalResults,
    } = await fetchSearchResults(searchParams);

    const filteredGlobalResults = filterGlobalIndex(globalResults, query);
    const ingredientCount = ingredientResults.totalItemsCount;
    const techDocsCount = techDocsResults.totalItemsCount;
    const globalCount = filteredGlobalResults?.length || 0;
    totalResults = ingredientCount + techDocsCount + globalCount;

    // Hide loader and show results
    loadingEl.style.display = 'none';
    block.style.display = 'block';

    await displaySearchResults(
      block,
      ingredientResults,
      techDocsResults,
      filteredGlobalResults,
      totalResults,
    );
  } catch (error) {
    console.error('Error during search:', error);
    loadingEl.style.display = 'none';
    block.style.display = 'block';
    const errorMsg = 'An error occurred while searching. Please try again later.';
    block.innerHTML = `<div class="error-message">${errorMsg}</div>`;
  }
}
