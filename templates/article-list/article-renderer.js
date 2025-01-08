/* eslint-disable function-call-argument-newline, max-len, function-paren-newline, object-curly-newline */
import { div, h3, h4, h5, ul, li, a, small, span, form, input, button } from '../../scripts/dom-helpers.js';
import { getRegionLocale, loadTranslations, translate } from '../../scripts/utils.js';

// TEMP CHANGE

function getUrlParams(key) {
  const params = new URLSearchParams(window.location.search);
  return key ? params.get(key) : params; // If key is provided, return the value; otherwise, return all parameters
}

function updateUrlParam(key, value) {
  const url = new URL(window.location);
  url.searchParams.set(key, value); // Update the query parameter
  // window.history.pushState(null, '', url);
}

function removeUrlParam(key) {
  const url = new URL(window.location);
  url.searchParams.delete(key);
  // window.history.pushState(null, '', url);
}

/**
 * Create an ArticleRenderer.
 * @param {string} options.jsonPath - The path to the JSON file containing the articles.
 * @param {Element} options.articleDiv - The container element for the articles.
 * @param {Function} options.articleCard - The function to create an article card element.
 * @param {string|number} [options.articlesPerPageOptions=10] - The options for the number of articles per page.
 * @param {Element} options.paginationDiv - The container element for the pagination.
 * @param {number} [options.paginationMaxBtns=7] - The maximum number of pagination buttons.
 * @param {Element} options.filterDiv - The container element for the filters.
 * @param {Element} options.searchDiv - The container element for the search form.
 * @param {Element} options.sortDiv - The container element for the sort dropdown.
 * @param {Element} options.countDiv - The container element for the article count.
 * @param {Element} options.perPageDiv - The container element for the per-page dropdown.
 */
export default class ArticleRenderer {
  constructor({
    jsonPath,
    articleDiv,
    articleCard,
    articlesPerPageOptions = 10,
    paginationDiv,
    paginationMaxBtns = 7,
    filterDiv,
    searchDiv,
    sortDiv,
    countDiv,
    perPageDiv,
  }) {
    this.jsonPath = jsonPath;
    this.articleDiv = articleDiv;
    this.articleCard = articleCard;
    this.articlesPerPageOptions = articlesPerPageOptions.split(',').map(Number);
    this.paginationDiv = paginationDiv;
    this.paginationMaxBtns = paginationMaxBtns;
    this.filterDiv = filterDiv;
    this.searchDiv = searchDiv;
    this.sortDiv = sortDiv;
    this.countDiv = countDiv;
    this.perPageDiv = perPageDiv; // Initialize it
    this.state = {
      allArticles: [],
      totalArticles: 0,
      currentPage: (parseInt(getUrlParams('page'), 10) || 1) - 1,
      tags: (getUrlParams('tags') || '').split(',').filter(Boolean),
      sort: getUrlParams('sort') || 'newest',
      searchQuery: getUrlParams('q') || '',
      articlesPerPage: getUrlParams('per-page') || this.articlesPerPageOptions[0],
    };
  }

  /**
   * Update the page state and re-render the articles
   */
  updatePage() {
    const { currentPage, searchQuery, tags, sort, articlesPerPage, allArticles } = this.state;
    let articles = [...allArticles];

    // Filter articles by tags
    if (tags.length > 0) {
      articles = articles.filter((article) => tags.every((tag) => article.tags.toLowerCase().replace(/\s+/g, '-').includes(tag)));
    }

    // Filter articles by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      articles = articles.filter((article) => article.title.toLowerCase().includes(query) || article.description.toLowerCase().includes(query));
    }

    // Sort articles
    switch (sort) {
      case 'a-z':
        articles = articles.sort((A, B) => A.title.localeCompare(B.title));
        break;
      case 'z-a':
        articles = articles.sort((A, B) => B.title.localeCompare(A.title));
        break;
      case 'oldest':
        articles = articles.sort((A, B) => parseInt(A.publishDate, 10) - parseInt(B.publishDate, 10));
        break;
      case 'newest': default:
        articles = articles.sort((A, B) => parseInt(B.publishDate, 10) - parseInt(A.publishDate, 10));
        break;
    }

    this.state.filteredArticles = articles;
    this.state.totalArticles = articles.length;
    this.renderArticles(articles.slice(currentPage * articlesPerPage, (currentPage + 1) * articlesPerPage));
    this.renderFilter();
    this.renderSearchForm();
    this.renderSortDropdown();
    this.renderCount();
    this.renderPagination();
    this.renderPerPageDropdown();
    this.updateUrl(); // sync state
  }

  updateUrl() {
    // current page
    if (this.state.currentPage !== 0) updateUrlParam('page', this.state.currentPage + 1);
    else removeUrlParam('page');

    // per page
    if (this.state.articlesPerPage !== this.articlesPerPageOptions[0]) updateUrlParam('per-page', this.state.articlesPerPage);
    else removeUrlParam('per-page');

    // tags
    if (this.state.tags.length > 0) updateUrlParam('tags', this.state.tags.join(','));
    else removeUrlParam('tags');

    // search query
    if (this.state.searchQuery) updateUrlParam('q', this.state.searchQuery);
    else removeUrlParam('q');

    // sort order
    if (this.state.sort !== 'newest') updateUrlParam('sort', this.state.sort);
    else removeUrlParam('sort');
  }

  renderCount() {
    if (!this.countDiv) return;
    const start = this.state.currentPage * this.state.articlesPerPage + 1;
    const end = Math.min((this.state.currentPage + 1) * this.state.articlesPerPage, this.state.totalArticles);
    this.countDiv.textContent = `${translate('items')} ${start}–${end} ${translate('of')} ${this.state.totalArticles}`;
  }

  onPopState() {
    this.updatePage();
  }

  /**
   * Render articles and add them to articleDiv.
   * @param {Array} articles - The list of articles.
   */
  renderArticles(articles) {
    this.articleDiv.innerHTML = '';
    const article = document.createDocumentFragment();
    articles.forEach((card) => article.appendChild(this.articleCard(card)));
    this.articleDiv.appendChild(article);
  }

  renderFilter() {
    if (!this.filterDiv) return;
    this.filterDiv.innerHTML = '';
    const tags = {};

    // Build tag counts from the filtered articles
    this.state.filteredArticles.forEach((article) => {
      article.tags.split(', ').forEach((tag) => {
        const cleanedTag = tag.replace(/["[\]]+/g, '').trim();
        tags[cleanedTag] = (tags[cleanedTag] || 0) + 1;
      });
    });

    // Group tags by heading
    const groupedTags = {};
    Object.keys(tags).forEach((rawTag) => {
      const [heading, tag] = rawTag.split(' : ')[1].split(' / ');
      if (!groupedTags[heading]) groupedTags[heading] = [];
      groupedTags[heading].push({
        tag: tag.toLowerCase().replace(/\s+/g, '-'), // cleaned tag
        original: tag,
        count: tags[rawTag],
      });
    });

    const $filter = document.createDocumentFragment();
    const $filterHeading = h3('Filters Options');
    $filter.append($filterHeading);

    // if filters are selected
    if (this.state.tags.length > 0) {
      const $appliedFilterHeading = h4('Filters Applied');
      const $appliedFilters = ul({ class: 'applied-filters' });

      this.state.tags.forEach((tag) => {
        let originalName = tag;

        // find the original name
        Object.values(groupedTags).forEach((group) => {
          const foundTag = group.find((item) => item.tag === tag);
          if (foundTag) originalName = foundTag.original;
        });

        const $li = li(originalName, span({ class: 'icon-close' }, '\ue91c'));
        $li.addEventListener('click', () => {
          this.state.tags = this.state.tags.filter((t) => t !== tag);
          this.state.currentPage = 0;
          this.updatePage();
        });
        $appliedFilters.appendChild($li);
      });

      // clear all button
      const $clearAll = li({ class: 'clear-all' }, 'Clear All');
      $clearAll.addEventListener('click', () => {
        this.state.tags = []; // clear all tags
        this.state.currentPage = 0;
        this.updatePage();
      });
      $appliedFilters.append($clearAll);

      this.filterDiv.append($appliedFilterHeading, $appliedFilters);
    }

    // Initialize state to keep track of open/closed groups
    this.groupState = this.groupState || {};

    // Build filter groups
    Object.keys(groupedTags).sort().forEach((heading) => {
      const isOpen = this.groupState[heading] || false;

      const $groupHeading = h5({ class: isOpen ? 'open' : '' }, heading, span({ class: 'icon' }, isOpen ? '－' : '＋'));

      // create the filters list
      const $filters = ul({ class: 'filter-options', style: `display: ${isOpen ? 'block' : 'none'}` });

      // Toggle group visibility
      $groupHeading.addEventListener('click', () => {
        this.groupState[heading] = !this.groupState[heading];
        const isCurrentlyOpen = this.groupState[heading];
        const icon = $groupHeading.querySelector('.icon');
        icon.textContent = isCurrentlyOpen ? '－' : '＋';
        $filters.style.display = isCurrentlyOpen ? 'block' : 'none';
      });

      groupedTags[heading].forEach(({ tag, original, count }) => {
        const isSelected = this.state.tags.includes(tag);
        const $li = li({ class: isSelected ? 'selected' : '' }, a({ href: `?tags=${tag}` }, `${original} `, small(`(${count})`)));

        $li.addEventListener('click', (event) => {
          event.preventDefault();
          if (isSelected) this.state.tags = this.state.tags.filter((t) => t !== tag);
          else this.state.tags.push(tag); // add tag if not selected
          this.state.currentPage = 0;
          this.updatePage();
        });

        $filters.appendChild($li);
      });

      $filter.append($groupHeading, $filters);
    });

    this.filterDiv.appendChild($filter);
  }

  renderSortDropdown() {
    if (!this.sortDiv) return;
    this.sortDiv.innerHTML = '';
    this.sortDiv.classList.add('select-dropdown', 'sort');

    const availableSortOptions = ['newest', 'oldest', 'a-z', 'z-a'];
    const sortOptions = availableSortOptions.map((key) => ({ label: translate(key), value: key }));

    const $currentSelection = div(
      { class: 'selected' },
      `Sort by: ${sortOptions.find((option) => option.value === this.state.sort)?.label || translate('newest')}`,
    );

    const $dropdown = ul({ class: 'options' });

    sortOptions.forEach((option) => {
      const $li = li({ class: option.value === this.state.sort ? 'active' : '' }, option.label);
      $li.addEventListener('click', () => {
        if (this.state.sort !== option.value) {
          this.state.sort = option.value;
          this.state.currentPage = 0;
          this.updatePage();
        }
        $currentSelection.textContent = `Sort by: ${option.label}`;
        $dropdown.classList.remove('open');
      });
      $dropdown.appendChild($li);
    });

    $currentSelection.addEventListener('click', (event) => {
      event.stopPropagation();
      $dropdown.classList.toggle('open');
    });

    // Close dropdown if clicked outside
    document.addEventListener('click', () => {
      $dropdown.classList.remove('open');
    });

    this.sortDiv.append($currentSelection, $dropdown);
  }

  renderPerPageDropdown() {
    if (!this.perPageDiv) return;

    this.perPageDiv.innerHTML = '';
    this.perPageDiv.classList.add('select-dropdown', 'per-page');
    const $currentSelection = div({ class: 'selected' }, `${this.state.articlesPerPage} per page`);
    const $dropdown = ul({ class: 'options' });

    this.articlesPerPageOptions.forEach((option) => {
      const $li = li({ class: option === this.state.articlesPerPage ? 'active' : '' }, `${option.toString()} per page`);
      $li.addEventListener('click', () => {
        if (this.state.articlesPerPage !== option) {
          this.state.articlesPerPage = option;
          this.state.currentPage = 0;
          this.updatePage();
        }

        // update selected class
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

    this.perPageDiv.append($currentSelection, $dropdown);
  }

  renderSearchForm() {
    if (!this.searchDiv) return;
    this.searchDiv.innerHTML = '';
    this.searchDiv.classList.add('filter-search');
    const searchPlaceholder = translate('search');
    const $form = form();
    const $input = input({
      type: 'listing-search',
      name: 'q',
      placeholder: searchPlaceholder,
      value: getUrlParams('q') || '',
    });

    $input.addEventListener('focus', () => {
      $input.placeholder = '';
    });

    $input.addEventListener('blur', () => {
      if (!$input.value.trim()) {
        $input.placeholder = searchPlaceholder;
      }
    });

    const $submit = button({ class: 'icon-search', type: 'submit', 'aria-label': 'Search Button' });
    $form.append($input, $submit);

    $form.addEventListener('submit', (event) => {
      event.preventDefault();
      const query = $input.value.trim();
      this.state.currentPage = 0;
      this.state.searchQuery = query;
      this.updatePage();
    });

    this.searchDiv.appendChild($form);
  }

  /**
   * Create a pagination button.
   * @param {number} n - The page number.
   * @returns {HTMLElement} The pagination button element.
   */
  createPageBtn(n) {
    const $pageBtn = button({ class: n === this.state.currentPage ? 'active' : '' }, (n + 1).toString());
    $pageBtn.addEventListener('click', () => {
      if (this.state.currentPage !== n) {
        this.state.currentPage = n;
        this.scrollTop();
        this.updatePage();
      }
    });
    return $pageBtn;
  }

  /**
   * Render the article list and initialize event listeners.
   * Fetches translations and articles, updates the page, and sets up a popstate event listener.
   * @async
   * @returns {Promise<void>}
   */
  renderPagination() {
    if (!this.paginationDiv) return;
    this.paginationDiv.innerHTML = '';

    // Exit if article count is less than max page count
    if (this.state.totalArticles < this.state.articlesPerPage) return;

    const p = document.createDocumentFragment();

    const $prev = button({ class: 'prev' }, translate('prev'));
    $prev.addEventListener('click', () => {
      if (this.state.currentPage > 0) {
        this.state.currentPage -= 1;
        this.scrollTop();
        this.updatePage();
      }
    });
    $prev.disabled = this.state.currentPage === 0;
    p.appendChild($prev);

    const totalPages = Math.ceil(this.state.totalArticles / this.state.articlesPerPage);

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
      if (this.state.currentPage < totalPages - half * 2 + 1 + extra) {
        startPage = Math.max(1, this.state.currentPage - half);
        endPage = Math.max(this.paginationMaxBtns - 2, this.state.currentPage + half + extra);
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

    const $next = button({ class: 'next' }, translate('next'));
    $next.addEventListener('click', () => {
      if (this.state.currentPage < totalPages - 1) {
        this.state.currentPage += 1;
        this.scrollTop();
        this.updatePage();
      }
    });
    $next.disabled = this.state.currentPage === totalPages - 1;
    p.appendChild($next);

    this.paginationDiv.appendChild(p);
    this.updateUrl();
  }

  scrollTop() {
    const { top } = this.articleDiv.getBoundingClientRect();
    const scrollToY = top + window.scrollY - 120; // account for header
    window.scrollTo({ top: scrollToY, behavior: 'smooth' });
  }

  /**
   * Render the article list and initialize event listeners.
   */
  async render() {
    try {
      const translationsUrl = '/translations.json';
      // eslint-disable-next-line no-unused-vars
      const [region, locale] = getRegionLocale();

      // fetch both articles and translations
      const [articlesResponse] = await Promise.all([
        fetch(this.jsonPath),
        loadTranslations(translationsUrl, locale),
      ]);

      // handle articles response
      if (!articlesResponse.ok) throw new Error('Failed to fetch articles');
      const { data } = await articlesResponse.json();
      this.state.allArticles = data;

      // render page after data and translations are loaded
      await this.updatePage();

      // event listener for popstate
      // window.addEventListener('popstate', (event) => this.onPopState(event));
    } catch (error) {
      console.error('Error during render:', error);
    }
  }
}
