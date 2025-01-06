/* eslint-disable function-call-argument-newline, max-len, function-paren-newline, object-curly-newline */
import { div, button, ul, li, a, small, h3, h4, h5, span } from './dom-helpers.js';

function getUrlParams() {
  return new URLSearchParams(window.location.search);
}

/**
 * Get the current page number from the URL query parameters.
 * @returns {number} The current page number or 0 if not set.
 */
function getPageN() {
  const urlParams = getUrlParams();
  const page = urlParams.get('page');
  return page ? parseInt(page, 10) - 1 : 0; // set to 0 if page is not set
}

/**
 * Create an ArticleList instance.
 * @param {Object} options - The configuration options.
 * @param {string} options.jsonPath - The path to the JSON data.
 * @param {HTMLElement} [options.articleContainer] - The container for articles.
 * @param {Function} [options.articleCard] - The function to create an article card.
 * @param {number} [options.articlesPerPage=10] - The number of articles per page.
 * @param {HTMLElement} [options.paginationContainer] - The container for pagination controls.
 * @param {number} [options.paginationMaxBtns=7] - The maximum number of pagination buttons.
 * @param {HTMLElement} [options.tagContainer] - The container for tag filters.
 * @param {string} [options.tagPath] - The root path for tag filtering.
 */
export default class ArticleList {
  constructor({
    jsonPath,
    articleContainer,
    articleCard,
    articlesPerPage = 10,
    paginationContainer,
    paginationMaxBtns = 7,
    filterContainer,
    countContainer,
    perPageContainer,
  }) {
    this.jsonPath = jsonPath;
    this.articleContainer = articleContainer;
    this.articleCard = articleCard;
    this.articlesPerPageOptions = articlesPerPage.split(',').map(Number);
    [this.articlesPerPage] = this.articlesPerPageOptions;
    this.paginationContainer = paginationContainer;
    this.paginationMaxBtns = paginationMaxBtns;
    this.filterContainer = filterContainer;
    this.countContainer = countContainer;
    this.perPageContainer = perPageContainer; // Initialize it
    this.currentPage = getPageN();
    this.totalArticles = 0;
    this.tag = null;
    this.allArticles = [];
  }

  /**
   * Render articles and add them to articleContainer.
   * @param {Array} articles - The list of articles.
   */
  renderArticles(articles) {
    this.articleContainer.innerHTML = '';
    const article = document.createDocumentFragment();
    articles.forEach((card) => article.appendChild(this.articleCard(card)));
    this.articleContainer.appendChild(article);
  }

  updateArticles() {
    const page = this.currentPage;
    let articles = this.allArticles;

    // Filter articles by selected tags
    if (this.tags.length > 0) {
      articles = articles.filter((article) => this.tags.every((tag) => article.tags
        .toLowerCase()
        .replace(/\s+/g, '-')
        .includes(tag)),
      );
    }

    // Sort articles by publish date in descending order
    articles = articles.sort((A, B) => new Date(B.publishDate) - new Date(A.publishDate));

    // Update total articles count and render the current page's articles
    this.totalArticles = articles.length;
    this.renderArticles(articles.slice(page * this.articlesPerPage, (page + 1) * this.articlesPerPage));
    this.updatePagination();
    this.updateCount();
  }

  /**
   * Create a pagination button.
   * @param {number} n - The page number.
   * @returns {HTMLElement} The pagination button element.
   */
  createPageBtn(n) {
    const $pageBtn = button({ class: n === this.currentPage ? 'active' : '' }, (n + 1).toString());
    $pageBtn.addEventListener('click', () => {
      if (this.currentPage !== n) {
        this.currentPage = n;
        this.updateArticles();
        this.scrollTop();
      }
    });
    return $pageBtn;
  }

  updatePagination() {
    if (!this.paginationContainer) return;
    this.paginationContainer.innerHTML = '';

    // Exit if paginationContainer isn't present or article count is less than max page count
    if (!this.paginationContainer || this.totalArticles < this.articlesPerPage) return;

    const p = document.createDocumentFragment();

    const $prev = button({ class: 'prev' }, 'Prev');
    $prev.addEventListener('click', () => {
      if (this.currentPage > 0) {
        this.currentPage -= 1;
        this.updateArticles();
        this.scrollTop();
      }
    });
    $prev.disabled = this.currentPage === 0;
    p.appendChild($prev);

    const totalPages = Math.ceil(this.totalArticles / this.articlesPerPage);

    if (totalPages <= this.paginationMaxBtns + 2) {
      Array.from({ length: totalPages }, (_, i) => p.appendChild(this.createPageBtn(i)));
    } else {
      const half = Math.floor((this.paginationMaxBtns - 3) / 2); // Buttons on either side of active
      const extra = (this.paginationMaxBtns - 1) % 2; // Remainder (if maxBtns is an even number)
      let startPage;
      let endPage;
      const $spaceBtn = button({ class: 'space' }, ' - ');
      $spaceBtn.disabled = true;

      // Determine start/end values
      if (this.currentPage < totalPages - half * 2 + 1 + extra) {
        startPage = Math.max(1, this.currentPage - half);
        endPage = Math.max(this.paginationMaxBtns - 2, this.currentPage + half + extra);
      } else {
        startPage = totalPages - half * 2 - 2 - extra;
        endPage = totalPages - 1;
      }

      // First button + space
      p.appendChild(this.createPageBtn(0));
      if (startPage > 1) p.appendChild($spaceBtn.cloneNode(true));

      // Middle buttons
      for (let i = startPage; i <= endPage; i += 1) {
        p.appendChild(this.createPageBtn(i));
      }

      // Space + last button
      if (endPage < totalPages - 2) {
        p.appendChild($spaceBtn.cloneNode(true));
        p.appendChild(this.createPageBtn(totalPages - 1));
      } else if (endPage === totalPages - 2) {
        p.appendChild(this.createPageBtn(totalPages - 1));
      }
    }

    const $next = button({ class: 'next' });
    $next.addEventListener('click', () => {
      if (this.currentPage < totalPages - 1) {
        this.currentPage += 1;
        this.updateArticles();
        this.scrollTop();
      }
    });
    $next.disabled = this.currentPage === totalPages - 1;
    p.appendChild($next);

    this.paginationContainer.appendChild(p);
    this.updateUrl();
  }

  updateCount() {
    if (!this.countContainer) return;

    const start = this.currentPage * this.articlesPerPage + 1;
    const end = Math.min((this.currentPage + 1) * this.articlesPerPage, this.totalArticles);
    const countText = `Items ${start}–${end} of ${this.totalArticles}`;
    this.countContainer.textContent = countText;
  }

  createPerPageDropdown() {
    if (!this.perPageContainer) return;

    const currentCount = this.articlesPerPage;
    const $currentSelection = div({ class: 'selected' }, `${currentCount} per page`);
    const $dropdown = ul({ class: 'options' });

    this.articlesPerPageOptions.forEach((option) => {
      const $li = li({ class: option === this.articlesPerPage ? 'active' : '' }, `${option.toString()} per page`);
      $li.addEventListener('click', () => {
        if (this.articlesPerPage !== option) {
          this.articlesPerPage = option;
          this.currentPage = 0;
          this.updateArticles();
          this.updatePagination();

          // Update per-page in URL
          const url = new URL(window.location);
          url.searchParams.set('per-page', option); // Add perPage query param
          window.history.pushState(null, '', url);
        }

        // update active class
        Array.from($dropdown.children).forEach((child) => {
          child.classList.remove('active');
        });
        $li.classList.add('active');

        // close the dropdown and update the displayed value
        $currentSelection.textContent = `${option} per page`;
        $dropdown.classList.remove('open');
      });
      $dropdown.appendChild($li);
    });

    // toggle dropdown visibility
    $currentSelection.addEventListener('click', (event) => {
      event.stopPropagation();
      $dropdown.classList.toggle('open');
    });

    // close dropdown if clicked outside
    document.addEventListener('click', () => {
      $dropdown.classList.remove('open');
    });

    this.perPageContainer.append($currentSelection, $dropdown);
  }

  updateFilterList() {
    this.filterContainer.innerHTML = '';
    const tags = {};
    const filteredArticles = this.allArticles.filter((article) => this.tags.every((tag) => article.tags.toLowerCase().replace(/\s+/g, '-').includes(tag)));

    // Rebuild tag counts based on the current filtered articles
    filteredArticles.forEach((article) => {
      article.tags.split(', ').forEach((tag) => {
        const cleanedTag = tag.replace(/["[\]]+/g, '').trim();
        tags[cleanedTag] = (tags[cleanedTag] || 0) + 1;
      });
    });

    const groupedTags = {};
    Object.keys(tags).forEach((rawTag) => {
      const [heading, tag] = rawTag.split(' : ')[1].split(' / ');
      if (!groupedTags[heading]) groupedTags[heading] = [];
      groupedTags[heading].push({ tag: tag.toLowerCase().replace(/\s+/g, '-'), name: tag, count: tags[rawTag] });
    });

    const $filter = document.createDocumentFragment();
    const $filterHeading = h3('Filters Options');
    $filter.append($filterHeading);

    // if filters are selected
    if (this.tags.length > 0) {
      const $appliedFilterHeadding = h4('Filters Applied');
      const $appliedFilters = ul({ class: 'applied-filters' });

      this.tags.forEach((tag) => {
        const $li = li(tag, span({ class: 'icon-close' }, '\ue91c'));
        $li.addEventListener('click', () => {
          this.tags = this.tags.filter((t) => t !== tag); // Remove tag
          this.currentPage = 0;
          this.updateArticles();
          this.updateUrl();
          this.updateFilterList();
        });
        $appliedFilters.appendChild($li);
      });

      // clear all button
      const $clearAll = li({ class: 'clear-all' }, 'Clear All');
      $clearAll.addEventListener('click', () => {
        this.tags = []; // Clear all tags
        this.currentPage = 0;
        this.updateArticles();
        this.updateUrl();
        this.updateFilterList();
      });
      $appliedFilters.append($clearAll);

      this.filterContainer.append($appliedFilterHeadding, $appliedFilters);
    }

    // build filter groups
    Object.keys(groupedTags).sort().forEach((heading) => {
      const $groupHeading = h5(heading);

      const $filters = ul({ class: 'filters' });

      groupedTags[heading].forEach(({ tag, name, count }) => {
        const isActive = this.tags.includes(tag);
        const $li = li(
          { class: isActive ? 'active' : '' },
          a({ href: `?tags=${tag}` }, `${name} `, small(`(${count})`)),
        );

        $li.addEventListener('click', (event) => {
          event.preventDefault(); // Prevent default navigation
          if (isActive) {
            this.tags = this.tags.filter((t) => t !== tag); // remove tag if active
          } else {
            this.tags.push(tag); // add tag to the list
          }

          this.currentPage = 0;
          this.updateArticles();
          this.updateUrl();
          this.updateFilterList();
        });

        $filters.appendChild($li);
      });

      $filter.append($groupHeading, $filters);
    });

    this.filterContainer.appendChild($filter);
  }

  scrollTop() {
    const { top } = this.articleContainer.getBoundingClientRect();
    const scrollToY = top + window.scrollY - 120; // account for header
    window.scrollTo({ top: scrollToY, behavior: 'smooth' });
  }

  getTags() {
    const urlParams = getUrlParams();
    this.tags = urlParams.get('tags')?.split(',').map((tag) => tag.trim()) || [];
  }

  updateUrl() {
    const url = new URL(window.location);

    // Update the ?page parameter if it is not 0
    if (this.currentPage !== 0) url.searchParams.set('page', this.currentPage + 1);
    else url.searchParams.delete('page');

    // Update the ?tags parameter with multiple tags
    if (this.tags.length > 0) url.searchParams.set('tags', this.tags.join(','));
    else url.searchParams.delete('tags');

    window.history.pushState(null, '', url);
  }

  onPopState() {
    this.getTags();
    this.updateFilterList();
    this.updateArticles();
  }

  /**
   * Render the article list and initialize event listeners.
   */
  async render() {
    try {
      const response = await fetch(this.jsonPath);
      const json = await response.json();
      this.allArticles = json.data;

      this.getTags();

      // Read perPage from URL if available, otherwise fallback to default
      const urlParams = getUrlParams();
      const perPageParam = urlParams.get('per-page');
      if (perPageParam) {
        const perPageValue = parseInt(perPageParam, 10);
        if (this.articlesPerPageOptions.includes(perPageValue)) {
          this.articlesPerPage = perPageValue;
        }
      }

      // Render tag filters if applicable
      if (this.filterContainer) this.updateFilterList();

      // Render articles and pagination
      if (this.articleCard && this.articleContainer) {
        await this.updateArticles(); // Filter articles if tags are present
        window.addEventListener('popstate', (event) => this.onPopState(event));
      }

      // Render per-page dropdown
      if (this.perPageContainer) this.createPerPageDropdown();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching articles:', error);
    }
  }
}
