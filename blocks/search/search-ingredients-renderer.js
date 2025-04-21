/* eslint-disable function-call-argument-newline, max-len, function-paren-newline, object-curly-newline, no-shadow */
import { div, h4, ul, li, small, form, input, button, span } from '../../scripts/dom-helpers.js';
import { translate } from '../../scripts/utils.js';
import { decorateBlock, loadBlock } from '../../scripts/aem.js';

function getUrlParams(key) {
  const params = new URLSearchParams(window.location.search);
  return key ? params.get(key) : params;
}

function createSelectDropdown({
  options,
  selectedValue,
  onSelect,
  defaultText = 'Select',
  labelSuffix = '',
  cssClass = [],
}) {
  const $dropdown = div({ class: ['select-dropdown', cssClass] },
    div({ class: 'selected' }, `${selectedValue || defaultText}${labelSuffix}`),
    ul({ class: 'options' }),
  );

  options.forEach(({ value, label, count }) => {
    const valueStr = String(value || '');
    const selectedValueStr = String(selectedValue || '');
    const isActive = valueStr.toLowerCase() === selectedValueStr.toLowerCase()
      || (valueStr === 'aToZ' && selectedValueStr.toLowerCase() === 'a-z')
      || (valueStr === 'zToA' && selectedValueStr.toLowerCase() === 'z-a');

    const $option = li({
      class: `option ${isActive ? 'active' : ''}`,
      style: isActive ? 'padding-right: 30px;' : '',
    },
    label,
    count !== undefined ? small(` (${count})`) : '',
    );

    $option.addEventListener('click', (event) => {
      event.stopPropagation();
      onSelect(value, $option, $dropdown);
      // Close this dropdown after selection
      $dropdown.querySelector('.options').classList.remove('open');
    });

    $dropdown.querySelector('.options').appendChild($option);
  });

  // Add click handler to toggle dropdown
  $dropdown.querySelector('.selected').addEventListener('click', (event) => {
    event.stopPropagation();

    const thisOptionsList = $dropdown.querySelector('.options');
    const isCurrentlyOpen = thisOptionsList.classList.contains('open');

    // close all open dropdowns
    document.querySelectorAll('.select-dropdown .options.open').forEach((optionsList) => {
      optionsList.classList.remove('open');
    });

    // open this one if it was closed
    if (!isCurrentlyOpen) thisOptionsList.classList.add('open');
  });

  // Close all dropdowns when clicking outside
  document.addEventListener('click', () => {
    document.querySelectorAll('.select-dropdown .options.open').forEach((optionsList) => {
      optionsList.classList.remove('open');
    });
  });

  return $dropdown;
}

/**
 * Create an IngredientRenderer.
 * @param {string} options.ingredientResults - array of filtered ingredient results.
 * @param {Element} options.articleDiv - The container element for the articles.
 * @param {Function} options.articleCard - The function to create an article card element.
 * @param {string|number} [options.articlesPerPageOptions=10] - The options for the number of articles per page.
 * @param {Element} options.paginationDiv - The container element for the pagination.
 * @param {number} [options.paginationMaxBtns=7] - The maximum number of pagination buttons.
 * @param {Element} options.filterTagsList - The container element for the filters.
 * @param {Element} options.searchDiv - The container element for the search form.
 * @param {Element} options.sortDropdown - The container element for the sort dropdown.
 * @param {Element} options.countDiv - The container element for the article count.
 * @param {Element} options.perPageDropdown - The container element for the per-page dropdown.
 * @param {Element} options.filterYearsDropdown - The container element for the filter years dropdown.
 * @param {Element} options.filterTypesDropdown - The container element for the filter types dropdown.
 * @param {Element} options.filterByTagDropdown - The container element for the filter by specific tag dropdown.
 */
export default class IngredientRenderer {
  constructor({
    ingredientResults,
    articleDiv,
    articleCard,
    articlesPerPageOptions = '10, 25, 50',
    paginationDiv,
    paginationMaxBtns = 7,
    filterTagsList,
    filterYearsDropdown,
    filterTypesDropdown,
    searchDiv,
    sortDropdown,
    countDiv,
    perPageDropdown,
    filterByTagDropdown,
    clearFilters,
  }) {
    this.ingredientResults = ingredientResults;
    this.articleDiv = articleDiv;
    this.articleCard = articleCard;
    this.articlesPerPageOptions = String(articlesPerPageOptions).split(',').map(Number);
    this.paginationDiv = paginationDiv;
    this.paginationMaxBtns = paginationMaxBtns;
    this.filterTagsList = filterTagsList;
    this.filterYearsDropdown = filterYearsDropdown;
    this.filterTypesDropdown = filterTypesDropdown;
    this.searchDiv = searchDiv;
    this.sortDropdown = sortDropdown;
    this.countDiv = countDiv;
    this.perPageDropdown = perPageDropdown;
    this.filterByTagDropdown = filterByTagDropdown;
    this.clearFilters = clearFilters;

    // Parse initial URL parameters for facets
    const url = new URL(window.location);
    const appliedFacets = [];
    let hasFacetParams = false;

    // Process each facet group from the URL
    Array.from(url.searchParams.entries()).forEach(([group, values]) => {
      // Skip non-facet parameters
      if (['initialTab', 'q', 'page', 'perPage', 'sortBy'].includes(group)) {
        return;
      }

      hasFacetParams = true;
      // Split comma-separated values and create applied facets
      const valueArray = values.split(',');
      valueArray.forEach((value) => {
        // Find the corresponding facet option to get the label
        const facetGroup = ingredientResults.facets?.[group];
        const facetOption = facetGroup?.options.find((opt) => opt.value === value);
        if (facetOption) {
          appliedFacets.push({
            group,
            value,
            label: facetOption.label,
          });
        }
      });
    });

    // Initialize state first
    this.state = {
      allArticles: ingredientResults.results,
      totalArticles: ingredientResults.totalItemsCount,
      currentPage: (parseInt(getUrlParams('activePage'), 10) || 1) - 1,
      sort: getUrlParams('sortBy') || 'Sort By',
      articlesPerPage: getUrlParams('perPage') || this.articlesPerPageOptions[0],
    };

    // If we have facet parameters in the URL, make an API call
    if (hasFacetParams) {
      (async () => {
        try {
          const response = await fetch(
            `https://www.ingredion.com/content/ingredion-com/na/en-us/search/jcr:content/searchResults.ingredients.json?${url.searchParams.toString()}`,
          );
          if (!response.ok) throw new Error('Failed to fetch');
          const newResults = await response.json();

          // Update the ingredient results with both new data and applied facets
          this.ingredientResults = {
            ...newResults,
            appliedFacets,
          };

          // Update state with new data
          this.state = {
            ...this.state,
            allArticles: newResults.results,
            totalArticles: newResults.totalItemsCount,
          };

          // Re-render the page with new data
          this.updatePage();
        } catch (error) {
          console.error('Error fetching initial results:', error);
        }
      })();
    } else {
      // If no facet parameters, just use the provided results
      this.ingredientResults = {
        ...ingredientResults,
        appliedFacets,
      };
    }

    // Synchronize initial URL state
    window.history.replaceState({ ...this.state }, '', window.location.href);

    // Listen to popstate events for back/forward navigation
    window.addEventListener('popstate', (event) => {
      const state = event.state || this.parseUrl();
      this.state = { ...this.state, ...state };
      this.updatePage();
    });
  }

  parseUrl() {
    return {
      currentPage: (parseInt(getUrlParams('activePage'), 10) || 1) - 1,
      sort: getUrlParams('sortBy') || 'Sort By',
      searchQuery: getUrlParams('q') || '',
      articlesPerPage: getUrlParams('perPage') || this.articlesPerPageOptions[0],
    };
  }

  /**
   * Update the page state and re-render the articles
   */
  updatePage() {
    const { currentPage, articlesPerPage, allArticles } = this.state;
    const articles = [...allArticles];

    this.state.filteredArticles = articles;
    this.renderArticles(articles.slice(currentPage * articlesPerPage, (currentPage + 1) * articlesPerPage));
    this.renderFilterTags();
    this.renderSortDropdown();
    this.renderCount();
    this.renderPagination();
    this.renderPerPageDropdown();
    this.renderClearFilters();
    this.updateUrl(); // sync state
  }

  updateUrl() {
    const url = new URL(window.location);

    // Update the URL parameters
    function updateUrlParam(key, value) {
      url.searchParams.set(key, value);
    }
    function removeUrlParam(key) {
      url.searchParams.delete(key);
    }

    // Manage URL parameters
    if (this.state.currentPage !== 0) updateUrlParam('activePage', this.state.currentPage + 1);
    else removeUrlParam('activePage');

    if (this.state.articlesPerPage !== this.articlesPerPageOptions[0]) updateUrlParam('perPage', this.state.articlesPerPage);
    else removeUrlParam('perPage');

    if (this.state.sort !== 'Sort By') updateUrlParam('sortBy', this.state.sort);
    else removeUrlParam('sortBy');

    // Compare with current history state to avoid redundant pushes
    if (JSON.stringify(window.history.state) !== JSON.stringify(this.state)) {
      window.history.pushState({ ...this.state }, '', url.toString());
    }
  }

  renderCount() {
    if (!this.countDiv) return;
    const start = this.state.currentPage * this.state.articlesPerPage + 1;
    const end = Math.min((this.state.currentPage + 1) * this.state.articlesPerPage, this.state.totalArticles);
    this.countDiv.textContent = `${translate('items')} ${start}–${end} ${translate('of')} ${this.state.totalArticles}`;
  }

  /**
   * Render articles and add them to articleDiv.
   * @param {Array} articles - The list of articles.
   */
  async renderArticles(articles) {
    this.articleDiv.innerHTML = '';

    if (articles.length > 0) {
      const ingredientBlocks = await Promise.all(
        articles.map(async (article) => {
          const block = this.articleCard(article);
          const relatedIngredientBlock = block.querySelector('.related-ingredient');
          if (relatedIngredientBlock) {
            decorateBlock(relatedIngredientBlock);
            await loadBlock(relatedIngredientBlock);
          }
          return block;
        }),
      );
      this.articleDiv.append(...ingredientBlocks);
    } else {
      this.articleDiv.append(div({ class: 'no-results-message' }, 'No ingredient results found.'));
    }
  }

  renderFilterTypes() {
    if (!this.filterTypesDropdown) return;
    this.filterTypesDropdown.innerHTML = '';

    const types = {};
    this.state.allArticles.forEach((article) => {
      if (article.type) {
        try {
          const type = JSON.parse(article.type)[0];
          if (type && type !== 'undefined') { // Only count defined types
            types[type] = (types[type] || 0) + 1;
          }
        } catch (e) {
          // Skip invalid JSON
          console.warn('Invalid type format:', article.type);
        }
      }
    });

    const typeOptions = [
      ...Object.keys(types)
        .filter((type) => type && type !== 'undefined') // Extra safety filter
        .sort()
        .map((type) => ({
          value: type,
          label: type,
          count: types[type],
        })),
      { value: '', label: 'All Types' },
    ];

    const $dropdown = createSelectDropdown({
      options: typeOptions,
      selectedValue: this.state.type,
      defaultText: 'Type',
      onSelect: (value, option, dropdown) => {
        this.state.currentPage = 0;
        this.state.type = value;
        dropdown.querySelector('.selected').textContent = value || 'Type';
        this.updatePage();
      },
      cssClass: ['filter-types'],
    });

    this.filterTypesDropdown.appendChild($dropdown);
  }

  renderFilterByTagDropdown() {
    if (!this.filterByTagDropdown) return;
    const tagCategory = this.filterByTagDropdown.getAttribute('data-tag');
    if (!tagCategory) return;

    this.filterByTagDropdown.innerHTML = '';

    const tags = {};

    // Build tag counts from all articles
    this.state.allArticles.forEach((article) => {
      article.tags.split(',').forEach((tag) => {
        const cleanedTag = tag.replace(/["[\]]+/g, '').trim();
        if (cleanedTag.startsWith(`${tagCategory} /`)) {
          tags[cleanedTag] = (tags[cleanedTag] || 0) + 1;
        }
      });
    });

    // Process tags to get just the second part after "Markets /"
    const tagOptions = Object.keys(tags)
      .map((fullTag) => {
        const [, tag] = fullTag.split(' / ');
        const cleanedValue = tag.toLowerCase().replace(/\s+/g, '-'); // for filtering
        return {
          value: cleanedValue, // lowercase hyphenated for filtering
          label: tag.trim(), // original format for display
          count: tags[fullTag],
        };
      })
      .sort((a, b) => a.label.localeCompare(b.label));

    // Add "All Markets" option at the end
    tagOptions.push({ value: '', label: `All ${tagCategory}` });

    // Find the currently selected option and use its label for display
    const selectedTag = this.state.tags.find((tag) => tagOptions.some((option) => option.value === tag),
    );
    const selectedOption = tagOptions.find((opt) => opt.value === selectedTag);
    const selectedDisplay = selectedOption ? selectedOption.label : '';

    const $dropdown = createSelectDropdown({
      options: tagOptions,
      selectedValue: selectedDisplay, // Use the display label instead of the value
      defaultText: tagCategory,
      onSelect: (value, option, dropdown) => {
        this.state.currentPage = 0;

        // Remove any existing tags from this category
        this.state.tags = this.state.tags.filter((tag) => !tagOptions.some((option) => option.value === tag),
        );

        // Add the new tag if one was selected
        if (value) {
          this.state.tags.push(value);
        }

        // Use the original format label for display
        const selectedOption = tagOptions.find((opt) => opt.value === value);
        dropdown.querySelector('.selected').textContent = selectedOption
          ? selectedOption.label // Use the original format label
          : tagCategory;

        this.updatePage();
      },
      cssClass: ['filter-by-tag'],
    });

    this.filterByTagDropdown.appendChild($dropdown);
  }

  renderFilterTags() {
    if (!this.filterTagsList) return;
    this.filterTagsList.innerHTML = '';
    this.groupState = this.groupState || {};

    // Create filters section
    const createFacetGroup = (facetKey, facetData) => {
      const isActive = this.ingredientResults.appliedFacets?.some((f) => f.group === facetKey);
      const isOpen = this.groupState[facetKey] || false;
      const facetGroupWrapper = div({ class: `facet-group__wrapper${isActive ? ' is-active' : ''}` });

      const header = div({ class: 'facet-group__header' });
      header.appendChild(h4({ class: 'facet-group__title' }, facetData.label));
      const toggleIcon = span({ class: 'icon' }, isOpen ? '－' : '＋');
      header.appendChild(toggleIcon);

      const content = div({ class: 'facet-group__content' });
      content.style.display = isOpen ? 'block' : 'none';

      // Create toggle view button if more than 10 options
      const hasMore = facetData.options.length > 10;
      let isShowingAll = false;

      facetData.options.forEach((option) => {
        const isSelected = this.ingredientResults.appliedFacets?.some(
          (f) => f.group === facetKey && f.value === option.value,
        );

        const facet = div({ class: 'facet' });
        const label = document.createElement('label');
        label.className = 'form-checkbox';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = isSelected;
        checkbox.value = option.value;
        checkbox.dataset.facetGroup = facetKey;

        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(`${option.label} (${option.count})`));
        label.appendChild(div({ class: 'form-checkbox-check' }));

        checkbox.addEventListener('change', async () => {
          // Create filter object
          const filter = {
            group: facetKey,
            value: option.value,
            checked: checkbox.checked,
          };

          try {
            // Get current URL parameters
            const url = new URL(window.location);
            const currentValue = url.searchParams.get(filter.group) || '';

            // Update URL parameters based on checkbox state
            if (filter.checked) {
              // Add value to parameter
              const newValue = currentValue ? `${currentValue},${filter.value}` : filter.value;
              url.searchParams.set(filter.group, newValue);
            } else {
              // Remove value from parameter
              const values = currentValue.split(',').filter((v) => v !== filter.value);
              if (values.length > 0) {
                url.searchParams.set(filter.group, values.join(','));
              } else {
                url.searchParams.delete(filter.group);
              }
            }

            // Always set activePage to 1 when changing facets
            url.searchParams.set('activePage', '1');

            // Preserve other important parameters
            const initialTab = url.searchParams.get('initialTab');
            const query = url.searchParams.get('q');
            if (initialTab) url.searchParams.set('initialTab', initialTab);
            if (query) url.searchParams.set('q', query);

            // Update URL without page refresh
            window.history.pushState({}, '', url.toString());

            // Make API call with updated params
            const response = await fetch(
              `https://www.ingredion.com/content/ingredion-com/na/en-us/search/jcr:content/searchResults.ingredients.json?${url.searchParams.toString()}`,
            );
            if (!response.ok) throw new Error('Failed to fetch');
            const newResults = await response.json();

            // Update appliedFacets based on checkbox state
            if (filter.checked) {
              this.ingredientResults.appliedFacets = [
                ...(this.ingredientResults.appliedFacets || []),
                {
                  group: filter.group,
                  value: filter.value,
                  label: option.label,
                },
              ];
            } else {
              this.ingredientResults.appliedFacets = (this.ingredientResults.appliedFacets || [])
                .filter((f) => !(f.group === filter.group && f.value === filter.value));
            }

            // Update the ingredient results and state
            this.ingredientResults = {
              ...newResults,
              appliedFacets: this.ingredientResults.appliedFacets,
            };

            // Update state with new data
            this.state = {
              ...this.state,
              allArticles: newResults.results,
              totalArticles: newResults.totalItemsCount,
              currentPage: 0, // Reset to first page when filters change
            };

            this.updatePage();
          } catch (error) {
            console.error('Error updating filters:', error);
          }
        });

        facet.appendChild(label);
        if (!isShowingAll && content.querySelectorAll('.facet').length >= 10) {
          facet.style.display = 'none';
        }
        content.appendChild(facet);
      });

      if (hasMore) {
        const toggleView = div({ class: 'facet-toggle-view has-more' });
        const toggleText = document.createTextNode('');
        const toggleIcon = span({ class: 'icon' }, '＋');
        toggleView.appendChild(toggleText);
        toggleView.appendChild(toggleIcon);

        toggleView.addEventListener('click', () => {
          isShowingAll = !isShowingAll;
          content.classList.toggle('show-all');
          toggleIcon.textContent = isShowingAll ? '－' : '＋';
          // if showing all, show facets beyond 10 else hide
          if (isShowingAll) {
            content.querySelectorAll('.facet').forEach((facet, index) => {
              if (index >= 10) facet.style.display = 'block';
            });
          } else {
            content.querySelectorAll('.facet').forEach((facet, index) => {
              if (index >= 10) facet.style.display = 'none';
            });
          }
        });

        content.appendChild(toggleView);
      }

      // Add click handler to toggle visibility
      header.addEventListener('click', () => {
        this.groupState[facetKey] = !this.groupState[facetKey];
        const isCurrentlyOpen = this.groupState[facetKey];
        content.style.display = isCurrentlyOpen ? 'block' : 'none';
        toggleIcon.textContent = isCurrentlyOpen ? '－' : '＋';
      });

      facetGroupWrapper.appendChild(header);
      facetGroupWrapper.appendChild(content);

      const facetGroup = div({ class: 'facet-group' });
      facetGroup.appendChild(facetGroupWrapper);
      return facetGroup;
    };

    const filtersList = div({ class: 'filters-list' });

    // Add applied facets if they exist
    if (this.ingredientResults.appliedFacets?.length > 0) {
      const appliedFacets = div({ class: 'facet-applied' });
      this.ingredientResults.appliedFacets.forEach((facet) => {
        const appliedItem = div({ class: 'facet-applied__item' });
        appliedItem.appendChild(div({ class: 'facet-applied__label' }, facet.label));
        const removeButton = div({ class: 'facet-applied__remove icon-close' });
        // Add click handler for remove button
        removeButton.addEventListener('click', async () => {
          try {
            // Get current URL parameters
            const url = new URL(window.location);
            const currentValue = url.searchParams.get(facet.group) || '';

            // Remove the value from the parameter
            const values = currentValue.split(',').filter((v) => v !== facet.value);
            if (values.length > 0) {
              url.searchParams.set(facet.group, values.join(','));
            } else {
              url.searchParams.delete(facet.group);
            }

            // Always set activePage to 1 when removing facets
            url.searchParams.set('activePage', '1');

            // Preserve other important parameters
            const initialTab = url.searchParams.get('initialTab');
            const query = url.searchParams.get('q');
            if (initialTab) url.searchParams.set('initialTab', initialTab);
            if (query) url.searchParams.set('q', query);

            // Update URL without page refresh
            window.history.pushState({}, '', url.toString());

            // Make API call with updated params
            const response = await fetch(
              `https://www.ingredion.com/content/ingredion-com/na/en-us/search/jcr:content/searchResults.ingredients.json?${url.searchParams.toString()}`,
            );
            if (!response.ok) throw new Error('Failed to fetch');
            const newResults = await response.json();

            // Remove from appliedFacets
            this.ingredientResults.appliedFacets = (this.ingredientResults.appliedFacets || [])
              .filter((f) => !(f.group === facet.group && f.value === facet.value));

            // Update the ingredient results and state
            this.ingredientResults = {
              ...newResults,
              appliedFacets: this.ingredientResults.appliedFacets,
            };

            // Update state with new data
            this.state = {
              ...this.state,
              allArticles: newResults.results,
              totalArticles: newResults.totalItemsCount,
              currentPage: 0, // Reset to first page when filters change
            };

            this.updatePage();
          } catch (error) {
            console.error('Error removing filter:', error);
          }
        });

        appliedItem.appendChild(removeButton);
        appliedFacets.appendChild(appliedItem);
      });
      filtersList.appendChild(appliedFacets);
    }

    // Add Clear All button
    const clearAll = div({ class: 'facet-clear-all' }, 'Clear All');
    // hide clear all button if no facets are applied
    if (this.ingredientResults.appliedFacets?.length === 0) {
      clearAll.style.display = 'none';
    }
    clearAll.addEventListener('click', async () => {
      this.ingredientResults.appliedFacets = [];
      this.state.currentPage = 0;
      // update url by removing all facets
      const url = new URL(window.location);
      url.searchParams.delete('applications');
      url.searchParams.delete('productType');
      url.searchParams.delete('subApplications');
      // Always set activePage to 1 when clearing filters
      url.searchParams.set('activePage', '1');
      window.history.pushState({}, '', url.toString());
      const response = await fetch(
        `https://www.ingredion.com/content/ingredion-com/na/en-us/search/jcr:content/searchResults.ingredients.json?${url.searchParams.toString()}`,
      );
      if (!response.ok) throw new Error('Failed to fetch');
      const newResults = await response.json();
      this.ingredientResults = {
        ...newResults,
        appliedFacets: [],
      };
      this.state = {
        ...this.state,
        allArticles: newResults.results,
        totalArticles: newResults.totalItemsCount,
        currentPage: 0, // Reset to first page when filters change
      };
      this.updatePage();
    });
    filtersList.appendChild(clearAll);

    // Add heading
    const heading = div({ class: 'heading' });
    heading.appendChild(h4('Filter Options'));
    filtersList.appendChild(heading);

    // Add facet groups
    Object.entries(this.ingredientResults.facets || {}).forEach(([key, data]) => {
      filtersList.appendChild(createFacetGroup(key, data));
    });

    this.filterTagsList.appendChild(filtersList);
  }

  renderSortDropdown() {
    if (!this.sortDropdown) return;
    this.sortDropdown.innerHTML = '';

    const sortOptions = [
      { value: 'Sort By', label: 'Sort By' },
      { value: 'relevance', label: 'Relevance' },
      { value: 'aToZ', label: 'A-Z' },
      { value: 'zToA', label: 'Z-A' },
    ].map((option) => ({
      ...option,
      count: undefined,
    }));

    // Find the currently selected option and use its label for display
    const selectedOption = sortOptions.find((opt) => opt.value === this.state.sort);
    const selectedDisplay = selectedOption ? selectedOption.label : 'Sort By';

    const $dropdown = createSelectDropdown({
      options: sortOptions,
      selectedValue: selectedDisplay,
      onSelect: async (value, option, dropdown) => {
        if (this.state.sort !== value) {
          this.state.sort = value;
          this.state.currentPage = 0;

          // Use the translated label for display
          const selectedOption = sortOptions.find((opt) => opt.value === value);
          dropdown.querySelector('.selected').textContent = `${selectedOption.label}`;

          // Remove active class from all options and add it to the selected one
          dropdown.querySelectorAll('.options .option').forEach((opt) => {
            opt.classList.remove('active');
            opt.style.paddingRight = '';
          });
          // Find and update the selected option
          const selectedLi = Array.from(dropdown.querySelectorAll('.options .option')).find((li) => li.textContent.includes(selectedOption.label));
          if (selectedLi) {
            selectedLi.classList.add('active');
            selectedLi.style.paddingRight = '30px';
          }

          // on changing sort by option, i want to call respective api and update the page
          const url = new URL(window.location);
          url.searchParams.set('sortBy', value);
          // Always set activePage to 1 when changing sort
          url.searchParams.set('activePage', '1');
          window.history.pushState({}, '', url.toString());

          const response = await fetch(`https://www.ingredion.com/content/ingredion-com/na/en-us/search/jcr:content/searchResults.ingredients.json?${url.searchParams.toString()}`);
          const newResults = await response.json();
          this.ingredientResults = {
            ...newResults,
            appliedFacets: this.ingredientResults.appliedFacets,
          };
          this.state = {
            ...this.state,
            allArticles: newResults.results,
            totalArticles: newResults.totalItemsCount,
            currentPage: 0, // Reset to first page when filters change
          };
          this.updatePage();
        }
      },
      cssClass: ['filter-sort'],
    });

    this.sortDropdown.appendChild($dropdown);
  }

  renderPerPageDropdown() {
    if (!this.perPageDropdown) return;
    this.perPageDropdown.innerHTML = '';

    const perPageOptions = this.articlesPerPageOptions.map((value) => ({
      value,
      label: value.toString(),
    }));

    const $dropdown = createSelectDropdown({
      options: perPageOptions,
      selectedValue: this.state.articlesPerPage,
      labelSuffix: ' per page',
      onSelect: async (value, option, dropdown) => {
        if (this.state.articlesPerPage !== value) {
          try {
            // Get current URL parameters
            const url = new URL(window.location);
            // Update perPage parameter
            url.searchParams.set('perPage', value);
            // Reset activePage to 1
            url.searchParams.set('activePage', '1');

            // Update URL without page refresh
            window.history.pushState({}, '', url.toString());

            // Make API call with updated params
            const response = await fetch(
              `https://www.ingredion.com/content/ingredion-com/na/en-us/search/jcr:content/searchResults.ingredients.json?${url.searchParams.toString()}`,
            );
            if (!response.ok) throw new Error('Failed to fetch');
            const newResults = await response.json();

            // Update the ingredient results while preserving applied facets
            this.ingredientResults = {
              ...newResults,
              appliedFacets: this.ingredientResults.appliedFacets,
            };

            // Update state with new data
            this.state = {
              ...this.state,
              allArticles: newResults.results,
              totalArticles: newResults.totalItemsCount,
              currentPage: 0, // Reset to first page
              articlesPerPage: value,
            };

            // Update dropdown display
            dropdown.querySelector('.selected').textContent = `${value} per page`;

            this.updatePage();
          } catch (error) {
            console.error('Error updating per page:', error);
          }
        }
      },
      cssClass: ['per-page'],
    });

    this.perPageDropdown.appendChild($dropdown);
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
      value: this.state.searchQuery || '',
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
    $pageBtn.addEventListener('click', async () => {
      if (this.state.currentPage !== n) {
        try {
          // Get current URL parameters
          const url = new URL(window.location);
          // Update activePage parameter
          url.searchParams.set('activePage', (n + 1).toString());

          // Update URL without page refresh
          window.history.pushState({}, '', url.toString());

          // Make API call with updated params
          const response = await fetch(
            `https://www.ingredion.com/content/ingredion-com/na/en-us/search/jcr:content/searchResults.ingredients.json?${url.searchParams.toString()}`,
          );
          if (!response.ok) throw new Error('Failed to fetch');
          const newResults = await response.json();

          // Update the ingredient results while preserving applied facets
          this.ingredientResults = {
            ...newResults,
            appliedFacets: this.ingredientResults.appliedFacets,
          };

          // Update state with new data
          this.state = {
            ...this.state,
            allArticles: newResults.results,
            totalArticles: newResults.totalItemsCount,
            currentPage: n,
          };
          this.updatePage();
          this.renderArticles(newResults.results);

          this.scrollTop();
        } catch (error) {
          console.error('Error updating page:', error);
        }
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

    const p = document.createDocumentFragment();

    const $prev = button({ class: 'prev' }, translate('prev'));
    $prev.addEventListener('click', async () => {
      if (this.state.currentPage > 0) {
        try {
          const newPage = this.state.currentPage - 1;
          // Get current URL parameters
          const url = new URL(window.location);
          // Update activePage parameter
          url.searchParams.set('activePage', (newPage + 1).toString());

          // Update URL without page refresh
          window.history.pushState({}, '', url.toString());

          // Make API call with updated params
          const response = await fetch(
            `https://www.ingredion.com/content/ingredion-com/na/en-us/search/jcr:content/searchResults.ingredients.json?${url.searchParams.toString()}`,
          );
          if (!response.ok) throw new Error('Failed to fetch');
          const newResults = await response.json();

          // Update the ingredient results while preserving applied facets
          this.ingredientResults = {
            ...newResults,
            appliedFacets: this.ingredientResults.appliedFacets,
          };

          // Update state with new data
          this.state = {
            ...this.state,
            allArticles: newResults.results,
            totalArticles: newResults.totalItemsCount,
            currentPage: newPage,
          };
          this.updatePage();
          this.renderArticles(newResults.results);

          this.scrollTop();
        } catch (error) {
          console.error('Error updating page:', error);
        }
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
      const $spaceBtn = button({ class: 'space' }, '...');
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
    $next.addEventListener('click', async () => {
      if (this.state.currentPage < totalPages - 1) {
        try {
          const newPage = this.state.currentPage + 1;
          // Get current URL parameters
          const url = new URL(window.location);
          // Update activePage parameter
          url.searchParams.set('activePage', (newPage + 1).toString());

          // Update URL without page refresh
          window.history.pushState({}, '', url.toString());

          // Make API call with updated params
          const response = await fetch(
            `https://www.ingredion.com/content/ingredion-com/na/en-us/search/jcr:content/searchResults.ingredients.json?${url.searchParams.toString()}`,
          );
          if (!response.ok) throw new Error('Failed to fetch');
          const newResults = await response.json();

          // Update the ingredient results while preserving applied facets
          this.ingredientResults = {
            ...newResults,
            appliedFacets: this.ingredientResults.appliedFacets,
          };

          // Update state with new data
          this.state = {
            ...this.state,
            allArticles: newResults.results,
            totalArticles: newResults.totalItemsCount,
            currentPage: newPage,
          };
          this.updatePage();
          this.renderArticles(newResults.results);

          this.scrollTop();
        } catch (error) {
          console.error('Error updating page:', error);
        }
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
      const data = this.ingredientResults.results;
      this.state.allArticles = data;
      this.state.totalArticles = this.ingredientResults.totalItemsCount;

      // render page after data and translations are loaded
      await this.updatePage();
    } catch (error) {
      console.error('Error during render:', error);
    }
  }

  renderClearFilters() {
    if (!this.clearFilters) return;

    // Check if any filters are active
    const hasActiveFilters = this.state.tags.length > 0
      || this.state.searchQuery
      || this.state.year
      || this.state.type;

    // Show/hide clear filters based on active filters
    if (hasActiveFilters) {
      this.clearFilters.classList.remove('hidden');

      // Remove any existing click handlers
      const oldHandler = this.clearFiltersHandler;
      if (oldHandler) {
        this.clearFilters.removeEventListener('click', oldHandler);
      }

      // Create and store the new handler
      this.clearFiltersHandler = (event) => {
        event.preventDefault();

        // Reset all filters to default state
        this.state.tags = [];
        this.state.searchQuery = '';
        this.state.year = '';
        this.state.type = '';
        this.state.sort = 'newest';
        this.state.currentPage = 0;

        // Update the page with reset filters
        this.updatePage();
      };

      // Add the new handler
      this.clearFilters.addEventListener('click', this.clearFiltersHandler);
    } else {
      this.clearFilters.classList.add('hidden');
    }
  }
}
