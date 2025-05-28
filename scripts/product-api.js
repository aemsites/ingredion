// This file contains all the product API endpoints

import { resolveApiPath } from './utils.js';

// prod
// export const API_HOST = 'https://www.ingredion.com';

// stage - testing (todo: remove before go-live)
export const API_HOST = 'https://ingredion-stage65.adobecqms.net';

export const getUrlParams = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    productName: params.get('name'),
  };
};

export const DEFAULT_PATHS = {
  POPULATE_INGREDIENT_CATEGORY_SUBCATEGORY: (region, locale) => `/content/ingredion-com/${region}/${locale}/jcr:content/header.search.json?initialTab=`,
  SEARCH_INGREDIENT_BY_CATEGORY_SUBCATEGORY: (region, locale) => `/content/ingredion-com/${region}/${locale}/ingredients/ingredient-finder/jcr:content/par/ingredientfinder.search.json`,
  INGREDIENT_SEARCH_TYPEAHEAD: (region, locale) => `/content/ingredion-com/${region}/${locale}.ingredient-search-typeahead.json?initialTab=`,
  PRODUCT_DETAILS: (region, locale, productName) => `/content/ingredion-com/${region}/${locale}/search/jcr:content/searchResults.ingredients.json?initialTab=&q=${productName}`,
  ALL_DOCUMENTS: (region, locale, productId) => `/content/ingredion-com/${region}/${locale}/search/jcr:content/searchResults.view.json?productId=${productId}`,
  DOWNLOAD_DOCUMENTS: (region, productName) => `/content/ingredion-com/ingredients/${region}/${productName}/jcr:content.download.zip`,
  DOWNLOAD_ALL_DOCUMENTS: (region, productName, productId) => `/content/ingredion-com/ingredients/${region}/${productName}/jcr:content.download.zip?productId=${productId}&documentType=all`,
  DOWNLOAD_ALL_DOCUMENTS_FROM_SEARCH: (region, locale, productId) => `/content/ingredion-com/${region}/${locale}/search/jcr:content/searchResults.download.zip?productId=${productId}&documentType=all`,
  SEARCH_INGREDIENTS: (region, locale) => `/content/ingredion-com/${region}/${locale}/search/jcr:content/searchResults.ingredients.json`,
  SEARCH_DOCUMENTS: (region, locale) => `/content/ingredion-com/${region}/${locale}/search/jcr:content/searchResults.techDocs.json`,
  SEARCH_INGREDIENTS_BY_NAME: (region, locale) => `/content/ingredion-com/${region}/${locale}/ingredients/ingredient-finder/jcr:content/par/ingredientfinder.search.json`,
};

export const API_PATH_OVERRIDES = {
  SEARCH_INGREDIENT_BY_CATEGORY_SUBCATEGORY: {
    'na-es-mx': '/content/ingredion-com/na/es-mx/ingredientes/buscador-de-ingredientes/jcr:content/par/ingredientfinder.search.json',
  },
  PRODUCT_DETAILS: {
    'na-es-mx': '/content/ingredion-com/na/es-mx/busqueda/jcr:content/searchResults.ingredients.json',
  },
};

export const API_PRODUCT = {
  POPULATE_INGREDIENT_CATEGORY_SUBCATEGORY: (region, locale) => `${API_HOST}${resolveApiPath('POPULATE_INGREDIENT_CATEGORY_SUBCATEGORY', region, locale)}`,
  SEARCH_INGREDIENT_BY_CATEGORY_SUBCATEGORY: (region, locale) => `${API_HOST}${resolveApiPath('SEARCH_INGREDIENT_BY_CATEGORY_SUBCATEGORY', region, locale)}`,
  INGREDIENT_SEARCH_TYPEAHEAD: (region, locale) => `${API_HOST}${resolveApiPath('INGREDIENT_SEARCH_TYPEAHEAD', region, locale)}`,
  PRODUCT_DETAILS: (region, locale, productName) => `${API_HOST}${resolveApiPath('PRODUCT_DETAILS', region, locale)}?initialTab=&q=${productName}`,
  ALL_DOCUMENTS: (region, locale, productId) => `${API_HOST}${resolveApiPath('ALL_DOCUMENTS', region, locale, productId)}`,
  DOWNLOAD_DOCUMENTS: (region, productName) => `${API_HOST}${resolveApiPath('DOWNLOAD_DOCUMENTS', region, productName)}`,
  DOWNLOAD_ALL_DOCUMENTS: (region, productName, productId) => `${API_HOST}${resolveApiPath('DOWNLOAD_ALL_DOCUMENTS', region, productName, productId)}`,
  DOWNLOAD_ALL_DOCUMENTS_FROM_SEARCH: (region, locale, productId) => `${API_HOST}${resolveApiPath('DOWNLOAD_ALL_DOCUMENTS_FROM_SEARCH', region, locale, productId)}`,
  SEARCH_INGREDIENTS: (region, locale) => `${API_HOST}${resolveApiPath('SEARCH_INGREDIENTS', region, locale)}`,
  SEARCH_DOCUMENTS: (region, locale) => `${API_HOST}${resolveApiPath('SEARCH_DOCUMENTS', region, locale)}`,
  SEARCH_INGREDIENTS_BY_NAME: (region, locale) => `${API_HOST}${resolveApiPath('SEARCH_INGREDIENTS_BY_NAME', region, locale)}`,
};
