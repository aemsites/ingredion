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
} from '../../scripts/aem.js';
import IngredientRenderer from './search-ingredients-renderer.js';
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
              href: article.path || '#',
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
            { href: article.path || '#', title: 'Learn more', class: 'button' },
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
async function createGlobalPanel(filteredGlobalResults) {
  const panel = document.createElement('div');
  if (filteredGlobalResults.length > 0) {
    const globalList = div({ class: 'results-list' });
    await Promise.all(filteredGlobalResults.map(async (result) => {
      const calloutWrapper = document.createElement('div');
      const calloutBlock = buildBlock('callout', '');
      calloutBlock.classList.add('search-content');
      calloutBlock.innerHTML = '';
      calloutBlock.setAttribute('data-block-status', 'loading');

      // Create main container div
      const contentRow = document.createElement('div');

      // Create image section
      const imageSection = document.createElement('div');
      if (result.image) {
        const picture = document.createElement('picture');
        // Add sources for different formats and sizes
        const webpSource1 = document.createElement('source');
        webpSource1.type = 'image/webp';
        webpSource1.srcset = `${result.image}?width=2000&format=webply&optimize=medium`;
        webpSource1.media = '(min-width: 600px)';
        const webpSource2 = document.createElement('source');
        webpSource2.type = 'image/webp';
        webpSource2.srcset = `${result.image}?width=750&format=webply&optimize=medium`;
        const jpegSource = document.createElement('source');
        jpegSource.type = 'image/jpeg';
        jpegSource.srcset = `${result.image}?width=2000&format=jpeg&optimize=medium`;
        jpegSource.media = '(min-width: 600px)';
        const img = document.createElement('img');
        img.loading = 'lazy';
        img.alt = result.imageAlt || '';
        img.src = `${result.image}?width=750&format=jpeg&optimize=medium`;
        img.width = 720;
        img.height = 560;
        picture.append(webpSource1, webpSource2, jpegSource, img);
        imageSection.appendChild(picture);
      }

      // Create content section
      const content = document.createElement('div');
      // Title
      const heading = document.createElement('h3');
      heading.id = result.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || '';
      heading.innerHTML = result.title || '';
      // Description
      const description = document.createElement('p');
      description.innerHTML = result.description || '';
      // Button container
      const buttonContainer = document.createElement('p');
      buttonContainer.className = 'button-container';
      const learnMoreLink = document.createElement('a');
      learnMoreLink.href = result.path || '#';
      learnMoreLink.title = 'Learn more';
      learnMoreLink.className = 'button';
      learnMoreLink.textContent = 'Learn more';
      buttonContainer.appendChild(learnMoreLink);

      // Assemble the content
      content.append(heading, description, buttonContainer);
      // Assemble the block
      contentRow.append(imageSection, content);
      calloutBlock.appendChild(contentRow);
      calloutWrapper.appendChild(calloutBlock);
      // Decorate and load the block
      decorateBlock(calloutBlock);
      await loadBlock(calloutBlock);
      globalList.append(calloutWrapper);
    }));
    panel.append(globalList);
  } else {
    panel.append(div({ class: 'no-results-message' }, 'No global results found.'));
  }
  return panel;
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
            { href: article.assetUrl || '#', title: 'Download', class: 'button' },
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
  /* const panel = document.createElement('div');
  if (techDocsResults.results.length > 0) {
    // Create blocks for each ingredient
    await Promise.all(techDocsResults.results.map(async (asset) => {
      // const relatedIngredientContainer = document.createElement('div');
      const relatedIngredientWrapper = document.createElement('div');
      const relatedIngredientBlock = buildBlock('related-ingredient', '');
      relatedIngredientBlock.classList.add('search-docs');
      relatedIngredientBlock.innerHTML = '';
      relatedIngredientBlock.setAttribute('data-block-status', 'loading');

      // Content section
      const contentRow = document.createElement('div');
      const contentCol = document.createElement('div');
      contentCol.setAttribute('data-valign', 'middle');

      // Title
      const title = document.createElement('h4');
      title.id = asset.assetName; // ?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || '';
      title.innerHTML = `<strong>${asset.assetName}</strong>`;
      contentCol.appendChild(title);

      // Description
      if (asset.assetSize) {
        const description = document.createElement('p');
        description.innerHTML = `Document Size: ${asset.assetSize}`;
        contentCol.appendChild(description);
      }

      contentRow.appendChild(contentCol);

      // Action buttons section
      const actionRow = document.createElement('div');
      const actionCol = document.createElement('div');
      actionCol.setAttribute('data-valign', 'middle');

      // Document buttons
      const downloadContainer = document.createElement('p');
      downloadContainer.className = 'button-container';
      const viewDocsLink = document.createElement('a');
      viewDocsLink.href = asset.assetUrl || '#';
      viewDocsLink.title = 'Download';
      viewDocsLink.className = 'button';
      viewDocsLink.textContent = 'Download';
      downloadContainer.appendChild(viewDocsLink);
      actionCol.appendChild(downloadContainer);

      actionRow.appendChild(actionCol);

      // Add both sections to the block
      relatedIngredientBlock.appendChild(contentRow);
      relatedIngredientBlock.appendChild(actionRow);

      relatedIngredientWrapper.appendChild(relatedIngredientBlock);
      // relatedIngredientContainer.appendChild(relatedIngredientWrapper);
      decorateBlock(relatedIngredientBlock);
      await loadBlock(relatedIngredientBlock);
      panel.appendChild(relatedIngredientWrapper);
    }));
  } else {
    panel.append(div({ class: 'no-results-message' }, 'No tech docs results found.'));
  }
  return panel; */
}

async function displaySearchResults(
  block,
  ingredientResults,
  techDocsResults,
  filteredGlobalResults,
  totalResults,
) {
  const params = new URLSearchParams(window.location.search);
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
      panel: await createGlobalPanel(filteredGlobalResults),
      doShow: (filteredGlobalResults?.length || 0) > 0,
    },
    {
      title: `Ingredients (${ingredientResults.totalItemsCount})`,
      panel: await createIngredientPanel(ingredientResults),
      doShow: ingredientResults.totalItemsCount > 0,
    },
    {
      title: `Technical & SDS Documents (${techDocsResults.totalItemsCount})`,
      panel: await createTechDocsPanel(techDocsResults),
      doShow: techDocsResults.totalItemsCount > 0,
    },
  ];

  // i want to show result for each specific tab, hide tab if there is 0 result for that section
  sections.forEach((section) => {
    const tabSection = document.createElement('div');

    const titleContainer = document.createElement('div');
    titleContainer.setAttribute('data-valign', 'middle');
    titleContainer.innerHTML = `<p>${section.title}</p>`;

    const contentContainer = document.createElement('div');
    contentContainer.setAttribute('data-valign', 'middle');
    contentContainer.classList.add('button-container');
    // create a div with class panel-content with class panel-content
    const panelContent = document.createElement('div');
    panelContent.classList.add('panel-content');

    panelContent.append(section.panel);
    contentContainer.append(panelContent);

    tabSection.append(titleContainer, contentContainer);
    // do not add a tab if there is 0 result for that section
    if (section.doShow) {
      tabBlock.append(tabSection);
    }
  });

  tabWrapper.append(tabBlock);
  decorateBlock(tabBlock);
  await loadBlock(tabBlock);

  resultsContainer.append(tabWrapper);
  block.innerHTML = '';

  if (totalResults > 0) {
    block.append(div({ class: 'total-results' }, `${totalResults} Results for "${query}"`));
    block.append(resultsContainer);
  } else {
    block.append(div({ class: 'total-results' }, `No results for "${query}"`));
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
    const { ingredientResults, techDocsResults, globalResults } = await fetchSearchResults(searchParams);

    const filteredGlobalResults = filterGlobalIndex(globalResults, query);
    const ingredientCount = ingredientResults.totalItemsCount;
    const techDocsCount = techDocsResults.totalItemsCount;
    const globalCount = filteredGlobalResults?.length || 0;
    totalResults = ingredientCount + techDocsCount + globalCount;

    // Hide loader and show results
    loadingEl.style.display = 'none';
    block.style.display = 'block';

    await displaySearchResults(block, ingredientResults, techDocsResults, filteredGlobalResults, totalResults);
  } catch (error) {
    console.error('Error during search:', error);
    loadingEl.style.display = 'none';
    block.style.display = 'block';
    const errorMsg = 'An error occurred while searching. Please try again later.';
    block.innerHTML = `<div class="error-message">${errorMsg}</div>`;
  }
}
