// This file contains all the product API endpoints

export const API_HOST = 'https://publish-p154883-e1640201.adobeaemcloud.com';
// prod
// export const API_HOST = 'https://www.ingredion.com';

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
  PRODUCT_DETAILS: (region, locale) => `/content/ingredion-com/${region}/${locale}/search/jcr:content/searchResults.ingredients.json`,
  ALL_DOCUMENTS: (region) => `/bin/ingredion-com/ingredient-finder.${region}.search.json`,
  DOWNLOAD_DOCUMENTS: (region) => `/bin/ingredion-com/searchResults.${region}.ingredients.json`,
  DOWNLOAD_ALL_DOCUMENTS: (region) => `/bin/ingredion-com/tech-documents.${region}.techDocs.json`,
  DOWNLOAD_ALL_DOCUMENTS_FROM_SEARCH: (region) => `/bin/ingredion-com/documents.${region}.view.json`,
  SEARCH_INGREDIENTS: (region) => `/bin/ingredion-com/documents-download.${region}.download.zip`,
  SEARCH_DOCUMENTS: (region) => `/bin/ingredion-com/sdsAssets.${region}.download.zip`,
  SEARCH_INGREDIENTS_BY_NAME: (region) => `/bin/ingredion-com/ingredient-finder.${region}.search.json`,
};

export const API_PATH_OVERRIDES = {
  SEARCH_INGREDIENT_BY_CATEGORY_SUBCATEGORY: {
    'na-es-mx': '/bin/ingredion-com/ingredient-finder.na.search.json',
    'na-kerr': '/bin/ingredion-com/ingredient-finder.na.search.json',
    'sa-pt-br': '/bin/ingredion-com/ingredient-finder.sa.search.json',
    'sa-es-co': '/bin/ingredion-com/ingredient-finder.sa.search.json',
    'sa-es-ar': '/bin/ingredion-com/ingredient-finder.sa.search.json',
  },
  PRODUCT_DETAILS: {
    'na-es-mx': '/bin/ingredion-com/searchResults.na.ingredients.json',
    'sa-pt-br': '/bin/ingredion-com/searchResults.sa.ingredients.json',
  },
  ALL_DOCUMENTS: {
    'na-es-mx': '/bin/ingredion-com/ingredient-finder.na.search.json',
    'sa-pt-br': '/bin/ingredion-com/ingredient-finder.sa.search.json',
  },
  DOWNLOAD_DOCUMENTS: {
    'na-es-mx': '/bin/ingredion-com/searchResults.na.ingredients.json',
    'na-kerr': '/bin/ingredion-com/searchResults.na.ingredients.json',
  },
  DOWNLOAD_ALL_DOCUMENTS: {
    'na-es-mx': '/bin/ingredion-com/tech-documents.na.techDocs.json',
    'na-kerr': '/bin/ingredion-com/tech-documents.na.techDocs.json',
  },
  DOWNLOAD_ALL_DOCUMENTS_FROM_SEARCH: {
    'na-es-mx': '/bin/ingredion-com/documents.na.view.json',
    'na-kerr': '/bin/ingredion-com/documents.na.view.json',
  },
  SEARCH_INGREDIENTS: {
    'na-es-mx': '/bin/ingredion-com/documents-download.na.download.zip',
    'sa-pt-br': '/bin/ingredion-com/documents-download.sa.download.zip',
  },
  SEARCH_DOCUMENTS: {
    'na-es-mx': '/bin/ingredion-com/sdsAssets.na.download.zip',
    'sa-pt-br': '/bin/ingredion-com/sdsAssets.sa.download.zip',
  },
  SEARCH_INGREDIENTS_BY_NAME: {
    'na-es-mx': '/bin/ingredion-com/ingredient-finder.na.search.json',
    'na-kerr': '/bin/ingredion-com/ingredient-finder.na.search.json',
    'sa-pt-br': '/bin/ingredion-com/ingredient-finder.sa.search.json',
    'sa-es-co': '/bin/ingredion-com/ingredient-finder.sa.search.json',
    'sa-es-ar': '/bin/ingredion-com/ingredient-finder.sa.search.json',
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
  POPULATE_INGREDIENT_CATEGORY_SUBCATEGORY: (region, locale) => `${API_HOST}${resolveApiPath('POPULATE_INGREDIENT_CATEGORY_SUBCATEGORY', region, locale)}`,
  SEARCH_INGREDIENT_BY_CATEGORY_SUBCATEGORY: (region, locale) => `${API_HOST}${resolveApiPath('SEARCH_INGREDIENT_BY_CATEGORY_SUBCATEGORY', region, locale)}`,
  INGREDIENT_SEARCH_TYPEAHEAD: (region, locale) => `${API_HOST}${resolveApiPath('INGREDIENT_SEARCH_TYPEAHEAD', region, locale)}`,
  PRODUCT_DETAILS: (region, locale, productName) => `${API_HOST}${resolveApiPath('PRODUCT_DETAILS', region, locale)}?initialTab=&q=${productName}`,
  ALL_DOCUMENTS: (region, locale, productId) => `${API_HOST}${resolveApiPath('ALL_DOCUMENTS', region, locale, productId)}?productId=${productId}`,
  DOWNLOAD_DOCUMENTS: (region, locale, productName) => `${API_HOST}${resolveApiPath('DOWNLOAD_DOCUMENTS', region, locale, productName)}/${productName}/jcr:content.download.zip`,
  DOWNLOAD_ALL_DOCUMENTS: (region, locale, productName, productId) => `${API_HOST}${resolveApiPath('DOWNLOAD_ALL_DOCUMENTS', region, locale, productName, productId)}/${productName}/jcr:content.download.zip?productId=${productId}&documentType=all`,
  DOWNLOAD_ALL_DOCUMENTS_FROM_SEARCH: (region, locale, productId) => `${API_HOST}${resolveApiPath('DOWNLOAD_ALL_DOCUMENTS_FROM_SEARCH', region, locale, productId)}?productId=${productId}&documentType=all`,
  SEARCH_INGREDIENTS: (region, locale) => `${API_HOST}${resolveApiPath('SEARCH_INGREDIENTS', region, locale)}`,
  SEARCH_DOCUMENTS: (region, locale) => `${API_HOST}${resolveApiPath('SEARCH_DOCUMENTS', region, locale)}`,
  SEARCH_INGREDIENTS_BY_NAME: (region, locale) => `${API_HOST}${resolveApiPath('SEARCH_INGREDIENTS_BY_NAME', region, locale)}`,
};
