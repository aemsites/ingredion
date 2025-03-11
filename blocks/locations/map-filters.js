import {
  button, div, li, option, select, strong, ul,
} from '../../scripts/dom-helpers.js';
import { filters } from '../../scripts/inventory.js';
import { getCitiesInCommunities } from '../../scripts/communities.js';
import { debounce } from '../../scripts/utils.js';

const originalArray = [];
let filterChoices;

// eslint-disable-next-line no-use-before-define
const debouncedRenderElement = debounce(renderFilters, 100);

const chosenFilters = new Proxy(originalArray, {
  get(target, property) {
    return Reflect.get(target, property);
  },
  set(target, property, value) {
    const result = Reflect.set(target, property, value);
    debouncedRenderElement(target);
    const e = new CustomEvent('filtersChanged', { detail: { chosenFilters: target } });
    window.dispatchEvent(e);
    return result;
  },
  deleteProperty(target, property) {
    const result = Reflect.deleteProperty(target, property);
    debouncedRenderElement(target);
    return result;
  },
});

function resolveFilter(filterValue) {
  return filters.find((f) => f.value === filterValue);
}

function resetOptions() {
  if (chosenFilters.length === 0) {
    document.querySelectorAll('option')
      .forEach((optionEl) => {
        optionEl.selected = false;
      });
  }
}

function removeFilter(filter) {
  chosenFilters.splice(chosenFilters.indexOf(filter), 1);
  if (chosenFilters.length === 0) {
    resetOptions();
  }
}

function renderFilters(array) {
  function toUpper(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Clear the filter choices list to rebuild it
  filterChoices.innerHTML = 'Filters: ';

  // Add the chosen filters to the filter choices list
  array.forEach((filter) => {
    filterChoices.append(
      li(
        {
          onclick: () => {
            removeFilter(filter);
          },
        },
        toUpper(`${filter.category}: `),
        strong(filter.label),
      ),
    );
  });

  // If there are filters, show the clear button
  if (chosenFilters.length > 0) {
    document.querySelector('.filter-choices').classList.add('show');
    filterChoices.append(
      button(
        {
          class: 'light-gray small',
          onclick: () => {
            chosenFilters.length = 0;
            resetOptions();
          },
        },
        'Clear',
      ),
    );
  } else {
    document.querySelector('.filter-choices').classList.remove('show');
  }
}

/**
 * Build an array of option elements from the given filters.
 * @param allFilters {Array} - An array of filters to be added to the select element.
 * @returns {*[]} - An array of option elements.
 */
function buildOptions(allFilters) {
  const optionEls = [];

  allFilters.forEach((filter) => {
    const properties = { value: filter.value };
    optionEls.push(option(properties, filter.label));
  });

  return optionEls;
}

/**
 * Return a select element with the given options.  When the select element is changed, the
 * chosenFilters array is updated with the selected filter.
 *
 * @param options {Array} - An array of option elements to be added to the select element.
 * @returns {Element} - A select element with the given options.
 */
function buildSelect(options) {
  return select({
    // eslint-disable-next-line no-unused-vars
    onchange: (event) => {
      const filter = resolveFilter(event.target.value);
      const index = chosenFilters.findIndex((f) => f.category === filter.category);
      if (index !== -1) {
        chosenFilters[index] = filter;
      } else {
        chosenFilters.push(filter);
      }
    },
  }, ...options);
}

async function addCitiesToFilters() {
  filters.push({
    category: 'city',
    label: 'All',
    value: 'city-*',
    rule: (models) => models.filter(() => true),
  });
  const cities = await getCitiesInCommunities();
  cities.forEach((city) => {
    filters.push({
      category: 'city',
      label: city,
      value: city,
      rule: (models) => models.filter((model) => model.city === city),
    });
  });
}

function buildHomeTypeFilter() {
  const homeTypeOptions = buildOptions(
    [
      ...filters.filter((f) => f.category === 'label' && f.label === 'Home Type'),
      ...filters.filter((f) => f.category === 'homestyle')],
  );
  return buildSelect(homeTypeOptions);
}

function buildPriceFilter() {
  const priceOptions = buildOptions(
    [
      ...filters.filter((f) => f.category === 'label' && f.label === 'Price'),
      ...filters.filter((f) => f.category === 'price')],
  );
  return buildSelect(priceOptions);
}

function buildBedFilter() {
  const bedsOptions = buildOptions(
    [
      ...filters.filter((f) => f.category === 'label' && f.label === 'Beds'),
      ...filters.filter((f) => f.category === 'beds')],
  );
  return buildSelect(bedsOptions);
}

function buildCityFilter() {
  const cityOptions = buildOptions(
    [
      ...filters.filter((f) => f.category === 'label' && f.label === 'City'),
      ...filters.filter((f) => f.category === 'city')],
  );
  return buildSelect(cityOptions);
}

function buildSquareFeetFilter() {
  const sqFtOptions = buildOptions(
    [
      ...filters.filter((f) => f.category === 'label' && f.label === 'Square Feet'),
      ...filters.filter((f) => f.category === 'sqft')],
  );
  return buildSelect(sqFtOptions);
}

function buildBathsFilter() {
  const bathsOptions = buildOptions(
    [
      ...filters.filter((f) => f.category === 'label' && f.label === 'Baths'),
      ...filters.filter((f) => f.category === 'baths')],
  );
  return buildSelect(bathsOptions);
}

function buildCarsFilter() {
  const carsOptions = buildOptions(
    [
      ...filters.filter((f) => f.category === 'label' && f.label === 'Cars'),
      ...filters.filter((f) => f.category === 'cars')],
  );
  return buildSelect(carsOptions);
}

function buildStatusFilter() {
  const statusOptions = buildOptions(
    [
      ...filters.filter((f) => f.category === 'label' && f.label === 'Status'),
      ...filters.filter((f) => f.category === 'status')],
  );
  return buildSelect(statusOptions);
}

export default async function buildFilters() {
  await addCitiesToFilters();
  const homeType = buildHomeTypeFilter();
  const price = buildPriceFilter();
  const beds = buildBedFilter();
  const city = buildCityFilter();
  const sqFt = buildSquareFeetFilter();
  const baths = buildBathsFilter();
  const cars = buildCarsFilter();
  const status = buildStatusFilter();

  filterChoices = ul(
    { class: 'filter-choices' },
    'Filters: ',
  );

  return div(
    { class: 'filter-container' },
    div(
      { class: 'filters fluid-grid' },
      homeType,
      price,
      beds,
      city,
      sqFt,
      baths,
      cars,
      status,
    ),
    filterChoices,
  );
}