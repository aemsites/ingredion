// search.js
import { div, a } from '../../scripts/dom-helpers.js';
import ArticleRenderer from '../article-list/article-renderer.js';

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

function transformIngredientResults(results) {
  if (!results || !results.results) return [];

  return results.results.map((result) => ({
    title: result.heading || '',
    description: result.productId || '',
    path: result.path || '#',
    publishDate: new Date().getTime() / 1000,
    type: JSON.stringify(['Ingredient']),
    tags: result.tags || '',
    image: result.image || '/default-ingredient-image.jpg',
  }));
}

function displaySearchResults(block, ingredientResults, techDocsResults, globalIndexResults) {
  const params = new URLSearchParams(window.location.search);
  const query = params.get('q');

  // Create results container
  const resultsContainer = div({ class: 'search-results' });

  // Create ingredient section with ArticleRenderer
  const ingredientSection = div({ class: 'search-section ingredients-section' });
  const ingredientTitle = div({ class: 'section-title' }, 'Ingredient Results');
  ingredientSection.append(ingredientTitle);

  const transformedIngredients = transformIngredientResults(ingredientResults);

  if (transformedIngredients.length > 0) {
    const $articles = div({ class: 'articles' });
    const $pagination = div({ class: 'pagination' });
    const $perPageDropdown = div();

    new ArticleRenderer({
      jsonPath: ingredientResults.results,
      articleDiv: $articles,
      articleCard: (article) => div(
        { class: 'card ingredient-card' },
        div(
          { class: 'info' },
          div({ class: 'result-heading' }, article.title),
          article.description && div({ class: 'result-product-id' }, article.description),
          article.path && div(
            { class: 'result-link' },
            a({ href: article.path }, 'View Details'),
          ),
        ),
      ),
      paginationDiv: $pagination,
      perPageDropdown: $perPageDropdown,
      articlesPerPageOptions: '5,10,25',
    }).render();

    ingredientSection.append($articles, div({ class: 'controls' }, $pagination, $perPageDropdown));
  } else {
    ingredientSection.append(
      div({ class: 'no-results-message' }, 'No ingredient results found.'),
    );
  }

  // Display global index results
  const filteredGlobalResults = filterGlobalIndex(globalIndexResults, query);
  const globalSection = div({ class: 'search-section global-section' });
  const globalTitle = div({ class: 'section-title' }, 'Global Results');
  globalSection.append(globalTitle);

  if (filteredGlobalResults.length > 0) {
    const globalList = div({ class: 'results-list' });
    filteredGlobalResults.forEach((result) => {
      const resultItem = div(
        { class: 'result-item global-item' },
        div({ class: 'result-title' }, result.title || ''),
        result.description && div({ class: 'result-description' }, result.description),
        result.keywords && div({ class: 'result-keywords' }, `Keywords: ${result.keywords}`),
      );
      globalList.append(resultItem);
    });
    globalSection.append(globalList);
  } else {
    globalSection.append(
      div({ class: 'no-results-message' }, 'No global results found.'),
    );
  }

  // display tech docs results
  const techDocsSection = div({ class: 'search-section tech-docs-section' });
  const techDocsTitle = div({ class: 'section-title' }, 'Tech Docs Results');
  techDocsSection.append(techDocsTitle);

  if (techDocsResults.results.length > 0) {
    const techDocsList = div({ class: 'results-list' });
    techDocsResults.results.forEach((result) => {
      const resultItem = div({ class: 'result-item tech-docs-item' }, result.heading || '');
      // assetFormat: "PDF"
      // assetLabel: "Download"
      // assetName: "THICK FLO DN (PACK)_MSDS_EN.pdf"
      // assetSize: "14 MB"
      // assetUrl: "/content/dam/ingredion/sds-documents/USAUS/THICK FLO DN (PACK)_MSDS_EN.pdf"

      // render assetUrl as a link
      const fullUrl = `https://www.ingredion.com${result.assetUrl}`;
      resultItem.append(a({ href: fullUrl }, fullUrl));
      // render assetSize
      resultItem.append(div({ class: 'asset-size' }, result.assetSize));
      // render assetFormat
      resultItem.append(div({ class: 'asset-format' }, result.assetFormat));
      // render assetName
      resultItem.append(div({ class: 'asset-name' }, result.assetName));
      techDocsList.append(resultItem);
    });
    techDocsSection.append(techDocsList);
  } else {
    techDocsSection.append(
      div({ class: 'no-results-message' }, 'No tech docs results found.'),
    );
  }

  // Add sections to container
  resultsContainer.append(ingredientSection, globalSection, techDocsSection);

  // Clear existing content and append new results
  block.innerHTML = '';
  block.append(resultsContainer);
}

export default async function decorate(block) {
  // Add a class to the block for styling
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

    // Make API calls
    const [ingredientResponse, techDocsResponse, globalResponse] = await Promise.all([
      fetch(`https://www.ingredion.com/content/ingredion-com/na/en-us/search/jcr:content/searchResults.ingredients.json?${searchParams.toString()}`),
      fetch(`https://www.ingredion.com/content/ingredion-com/na/en-us/search/jcr:content/searchResults.techDocs.json?${searchParams.toString()}`),
      fetch('https://main--ingredion--aemsites.aem.live/na/en-us/indexes/global-index.json'),
    ]);

    const ingredientResults = await ingredientResponse.json();
    const techDocsResults = await techDocsResponse.json();
    const globalResults = await globalResponse.json();

    // Hide loader and show results
    loadingEl.style.display = 'none';
    block.style.display = 'block';

    // Display results
    displaySearchResults(block, ingredientResults, techDocsResults, globalResults);
  } catch (error) {
    console.error('Error during search:', error);
    loadingEl.style.display = 'none';
    block.style.display = 'block';
    block.innerHTML = '<div class="error-message">An error occurred while searching. Please try again later.</div>';
  }
}
