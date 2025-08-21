// This file contains all the product API endpoints

// prod
export const API_HOST = 'https://www.ingredion.com';

// API host for specific endpoints (header search and typeahead)
export const API_HOST_SPECIAL = window.location.origin;

// stage - testing (todo: remove before go-live)
// export const API_HOST = 'https://ingredion-stage65.adobecqms.net';

export const getUrlParams = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    productName: params.get('name'),
  };
};

export const DEFAULT_PATHS = {
  POPULATE_INGREDIENT_CATEGORY_SUBCATEGORY: (region) => `/bin/ingredion-com/headeringredient/header.${region}.search.json`,
  SEARCH_INGREDIENT_BY_CATEGORY_SUBCATEGORY: (region) => `/bin/ingredion-com/ingredient-finder.${region}.search.json`,
  INGREDIENT_SEARCH_TYPEAHEAD: (region) => `/bin/ingredion-com/typeaheadingredient.${region}.ingredient-search-typeahead.json`,
  PRODUCT_DETAILS: (region) => `/bin/ingredion-com/searchResults.${region}.ingredients.json`,
  ALL_DOCUMENTS: (region) => `/bin/ingredion-com/documents.${region}.view.json`,
  DOWNLOAD_DOCUMENTS: (region) => `/bin/ingredion-com/documents-download.${region}.download.zip`,
  DOWNLOAD_ALL_DOCUMENTS: (region) => `/bin/ingredion-com/documents-download.${region}.download.zip`,
  DOWNLOAD_ALL_DOCUMENTS_FROM_SEARCH: (region) => `/bin/ingredion-com/documents-download.${region}.download.zip`,
  SEARCH_INGREDIENTS: (region) => `/bin/ingredion-com/searchResults.${region}.ingredients.json`,
  SEARCH_DOCUMENTS: (region) => `/bin/ingredion-com/tech-documents.${region}.techDocs.json`,
  SEARCH_INGREDIENTS_BY_NAME: (region) => `/bin/ingredion-com/ingredient-finder.${region}.search.json`,
};

export const API_PATH_OVERRIDES = {
  POPULATE_INGREDIENT_CATEGORY_SUBCATEGORY: {
    'na-en-us': '/scripts/static/header.na.search.json',
    'na-es-mx': '/scripts/static/header.es-mx.search.json',
    'sa-pt-br': '/scripts/static/header.sa.search.json',
  },
  SEARCH_INGREDIENT_BY_CATEGORY_SUBCATEGORY: {
    'na-es-mx': '/bin/ingredion-com/ingredient-finder.es-mx.search.json',
    'na-kerr': '/bin/ingredion-com/ingredient-finder.kerr.search.json',
  },
  INGREDIENT_SEARCH_TYPEAHEAD: {
    'na-es-mx': '/bin/ingredion-com/typeaheadingredient.es-mx.ingredient-search-typeahead.json',
    'na-kerr': '/bin/ingredion-com/typeaheadingredient.kerr.ingredient-search-typeahead.json',
  },
  PRODUCT_DETAILS: {
    'na-es-mx': '/bin/ingredion-com/searchResults.es-mx.ingredients.json',
    'na-kerr': '/bin/ingredion-com/searchResults.kerr.ingredients.json',
  },
  ALL_DOCUMENTS: {
    'na-es-mx': '/bin/ingredion-com/documents.es-mx.view.json',
    'na-kerr': '/bin/ingredion-com/documents.kerr.view.json',
  },
  DOWNLOAD_DOCUMENTS: {
    'na-es-mx': '/bin/ingredion-com/documents-download.es-mx.download.zip',
    'na-kerr': '/bin/ingredion-com/documents-download.kerr.download.zip',
  },
  DOWNLOAD_ALL_DOCUMENTS: {
    'na-es-mx': '/bin/ingredion-com/documents-download.es-mx.download.zip',
    'na-kerr': '/bin/ingredion-com/documents-download.kerr.download.zip',
  },
  DOWNLOAD_ALL_DOCUMENTS_FROM_SEARCH: {
    'na-es-mx': '/bin/ingredion-com/documents-download.es-mx.download.zip',
    'na-kerr': '/bin/ingredion-com/documents-download.kerr.download.zip',
  },
  SEARCH_INGREDIENTS: {
    'na-es-mx': '/bin/ingredion-com/searchResults.es-mx.ingredients.json',
    'na-kerr': '/bin/ingredion-com/searchResults.kerr.ingredients.json',
  },
  SEARCH_DOCUMENTS: {
    'na-es-mx': '/bin/ingredion-com/tech-documents.es-mx.techDocs.json',
    'na-kerr': '/bin/ingredion-com/tech-documents.kerr.techDocs.json',
  },
  SEARCH_INGREDIENTS_BY_NAME: {
    'na-es-mx': '/bin/ingredion-com/ingredient-finder.es-mx.search.json',
    'na-kerr': '/bin/ingredion-com/ingredient-finder.kerr.search.json',
  },
};

const resolveApiPath = (apiKey, region, locale) => {
  const key = `${region}-${locale}`;
  const override = API_PATH_OVERRIDES[apiKey]?.[key];
  if (override) return override;

  const defaultBuilder = DEFAULT_PATHS[apiKey];
  if (defaultBuilder) return defaultBuilder(region, locale);

  // eslint-disable-next-line no-console
  console.warn(`No path defined for ${apiKey}`);
  return '';
};

export const API_PRODUCT = {
  POPULATE_INGREDIENT_CATEGORY_SUBCATEGORY: (region, locale) => {
    const key = `${region}-${locale}`;
    const isSpecialEndpoint = ['na-en-us', 'na-es-mx', 'sa-pt-br'].includes(key);
    const host = isSpecialEndpoint ? API_HOST_SPECIAL : API_HOST;
    return `${host}${resolveApiPath('POPULATE_INGREDIENT_CATEGORY_SUBCATEGORY', region, locale)}`;
  },
  SEARCH_INGREDIENT_BY_CATEGORY_SUBCATEGORY: (region, locale) => `${API_HOST}${resolveApiPath('SEARCH_INGREDIENT_BY_CATEGORY_SUBCATEGORY', region, locale)}`,
  INGREDIENT_SEARCH_TYPEAHEAD: (region, locale) => `${API_HOST}${resolveApiPath('INGREDIENT_SEARCH_TYPEAHEAD', region, locale)}`,
  PRODUCT_DETAILS: (region, locale, productName) => `${API_HOST}${resolveApiPath('PRODUCT_DETAILS', region, locale)}?initialTab=&q=${productName}`,
  ALL_DOCUMENTS: (region, locale, productId) => `${API_HOST}${resolveApiPath('ALL_DOCUMENTS', region, locale, productId)}?productId=${productId}`,
  DOWNLOAD_DOCUMENTS: (region, locale, productName) => `${API_HOST}${resolveApiPath('DOWNLOAD_DOCUMENTS', region, locale, productName)}`,
  DOWNLOAD_ALL_DOCUMENTS: (region, locale, productName, productId) => `${API_HOST}${resolveApiPath('DOWNLOAD_ALL_DOCUMENTS', region, locale, productName, productId)}?productId=${productId}&documentType=all`,
  DOWNLOAD_ALL_DOCUMENTS_FROM_SEARCH: (region, locale, productId) => `${API_HOST}${resolveApiPath('DOWNLOAD_ALL_DOCUMENTS_FROM_SEARCH', region, locale, productId)}?productId=${productId}&documentType=all`,
  SEARCH_INGREDIENTS: (region, locale) => `${API_HOST}${resolveApiPath('SEARCH_INGREDIENTS', region, locale)}`,
  SEARCH_DOCUMENTS: (region, locale) => `${API_HOST}${resolveApiPath('SEARCH_DOCUMENTS', region, locale)}`,
  SEARCH_INGREDIENTS_BY_NAME: (region, locale) => `${API_HOST}${resolveApiPath('SEARCH_INGREDIENTS_BY_NAME', region, locale)}`,
};
