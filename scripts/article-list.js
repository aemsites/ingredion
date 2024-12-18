/* eslint-disable function-call-argument-newline, max-len, function-paren-newline, object-curly-newline */
import { div, button, ul, li, a, small, span } from './dom-helpers.js';

/**
 * Get the current page number from the URL query parameters.
 * @returns {number} The current page number or 0 if not set.
 */
function getPageN() {
  const urlParams = new URLSearchParams(window.location.search);
  const page = urlParams.get('page');
  return page ? parseInt(page, 10) : 0; // set to 0 if page is not set
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
 * @param {HTMLElement} [options.categoryContainer] - The container for category filters.
 * @param {string} [options.categoryPath] - The root path for category filtering.
 */
export default class ArticleList {
  constructor({
    jsonPath,
    articleContainer,
    articleCard,
    articlesPerPage = 10,
    paginationContainer,
    paginationMaxBtns = 7,
    categoryContainer,
    categoryPath,
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
    this.categoryContainer = categoryContainer;
    this.categoryPath = categoryPath;
    this.countContainer = countContainer;
    this.perPageContainer = perPageContainer; // Initialize it
    this.currentPage = getPageN();
    this.totalArticles = 0;
    this.category = null;
    this.allArticles = [];
  }

  /**
   * Render articles and add them to articleContainer.
   * @param {Array} articles - The list of articles.
   */
  renderArticles(articles) {
    this.articleContainer.innerHTML = '';
    const article = document.createDocumentFragment();
    articles.forEach((card) => {
      article.appendChild(this.articleCard(card));
    });
    this.articleContainer.appendChild(article);
  }

  async updateArticles() {
    const page = this.currentPage;
    let articles = this.allArticles;
    // filter articles by category if present
    if (this.category) {
      articles = articles.filter((article) => {
        const articleCategories = article.categories.toLowerCase().replace(/\s+/g, '-');
        return articleCategories.includes(this.category);
      });
    }

    // sort articles by publish date in descending order
    articles = articles.sort((A, B) => parseInt(B.publisheddate, 10) - parseInt(A.publisheddate, 10));

    // update total articles count and render the current page's articles
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
  pageBtn(n) {
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
      Array.from({ length: totalPages }, (_, i) => p.appendChild(this.pageBtn(i)));
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
      p.appendChild(this.pageBtn(0));
      if (startPage > 1) p.appendChild($spaceBtn.cloneNode(true));

      // Middle buttons
      for (let i = startPage; i <= endPage; i += 1) {
        p.appendChild(this.pageBtn(i));
      }

      // Space + last button
      if (endPage < totalPages - 2) {
        p.appendChild($spaceBtn.cloneNode(true));
        p.appendChild(this.pageBtn(totalPages - 1));
      } else if (endPage === totalPages - 2) {
        p.appendChild(this.pageBtn(totalPages - 1));
      }
    }

    const $next = button({ class: 'next' }, );
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
        }

        // udpate active class
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
    const categories = {};

    this.allArticles.forEach((article) => {
      article.categories.split(', ').forEach((category) => {
        if (!categories[category]) {
          categories[category] = 0;
        }
        categories[category] += 1;
      });
    });

    const $categories = ul({ class: 'filter' });

    Object.keys(categories).sort().forEach((category) => {
      const cat = category.toLowerCase().replace(/\s+/g, '-');
      const $li = li({ class: this.category === cat ? 'active' : '' },
        a({
          href: this.categoryPath + cat,
        }, `${category} `,
        small(`(${categories[category]})`)));
      $li.addEventListener('click', (event) => {
        if (this.articleCard && this.articleContainer) event.preventDefault();
        this.category = cat;
        this.currentPage = 0;
        this.updateArticles();
        this.updateUrl();
        this.updateFilterList();
      });
      $categories.appendChild($li);
    });

    this.categoryContainer.innerHTML = '';
    this.categoryContainer.appendChild($categories);
  }

  scrollTop() {
    const { top } = this.articleContainer.getBoundingClientRect();
    const scrollToY = top + window.scrollY - 120; // account for header
    window.scrollTo({ top: scrollToY, behavior: 'smooth' });
  }

  getCategory() {
    [this.category] = window.location.pathname.replace(this.categoryPath, '').split('/');
  }

  updateUrl() {
    const url = new URL(window.location);
    url.pathname = this.categoryPath + this.category;
    // Only update ?page if it is not 0
    if (this.currentPage !== 0) url.searchParams.set('page', this.currentPage);
    else url.searchParams.delete('page');
    // Only update if category exists
    if (this.category) window.history.pushState(null, '', url);
  }

  onPopState() {
    this.getCategory();
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

      this.getCategory();

      // Render category filters if applicable
      if (this.categoryContainer) this.updateFilterList();

      // Render articles and pagination
      if (this.articleCard && this.articleContainer) {
        await this.updateArticles();
        window.addEventListener('popstate', (event) => this.onPopState(event));
      }

      // Render per-page dropdown
      if (this.perPageContainer) this.createPerPageDropdown();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching articles:', error);
    }
  }

  async renderArticlesByCategory(category) {
    try {
      const response = await fetch(this.jsonPath);
      const json = await response.json();
      this.allArticles = json.data;
      this.category = category;
      // If articleCard & articleContainer are defined, render them
      if (this.articleCard && this.articleContainer) {
        await this.updateArticles();
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching articles:', error);
    }
  }
}
