// This file contains all the product API endpoints

// prod
export const API_HOST = 'https://preview.ingredion.com';

// stage - testing (todo: remove before go-live)
// export const API_HOST = 'https://ingredion-stage65.adobecqms.net';

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
  PRODUCT_DETAILS: (region, locale) => `/content/ingredion-com/${region}/${locale}/search/jcr:content/searchResults.ingredients.json`,
  ALL_DOCUMENTS: (region, locale) => `/content/ingredion-com/${region}/${locale}/search/jcr:content/searchResults.view.json`,
  DOWNLOAD_DOCUMENTS: (region) => `/content/ingredion-com/ingredients/${region}`,
  DOWNLOAD_ALL_DOCUMENTS: (region) => `/content/ingredion-com/ingredients/${region}`,
  DOWNLOAD_ALL_DOCUMENTS_FROM_SEARCH: (region, locale) => `/content/ingredion-com/${region}/${locale}/search/jcr:content/searchResults.download.zip`,
  SEARCH_INGREDIENTS: (region, locale) => `/content/ingredion-com/${region}/${locale}/search/jcr:content/searchResults.ingredients.json`,
  SEARCH_DOCUMENTS: (region, locale) => `/content/ingredion-com/${region}/${locale}/search/jcr:content/searchResults.techDocs.json`,
  SEARCH_INGREDIENTS_BY_NAME: (region, locale) => `/content/ingredion-com/${region}/${locale}/ingredients/ingredient-finder/jcr:content/par/ingredientfinder.search.json`,
};

export const API_PATH_OVERRIDES = {
  SEARCH_INGREDIENT_BY_CATEGORY_SUBCATEGORY: {
    'na-es-mx': '/content/ingredion-com/na/es-mx/ingredientes/buscador-de-ingredientes/jcr:content/par/ingredientfinder.search.json',
    'na-kerr': '/content/ingredion-com/na/kerr/ingredient-finder/jcr:content/par/ingredientfinder.search.json',
    'sa-pt-br': '/content/ingredion-com/sa/pt-br/ingredientes/busque-o-ingrediente/jcr:content/par/ingredientfinder.search.json',
    'sa-es-co': '/content/ingredion-com/sa/es-co/nuestros-ingredientes/busca-el-ingrediente/jcr:content/par/ingredientfinder.search.json',
    'sa-es-ar': '/content/ingredion-com/sa/es-ar/nuestros-ingredientes/buscador-de-ingredientes/jcr:content/par/ingredientfinder.search.json',
  },
  PRODUCT_DETAILS: {
    'na-es-mx': '/content/ingredion-com/na/es-mx/buscar/jcr:content/searchResults.ingredients.json',
    'sa-pt-br': '/content/ingredion-com/sa/pt-br/buscar/jcr:content/searchResults.ingredients.json',
  },
  ALL_DOCUMENTS: {
    'na-es-mx': '/content/ingredion-com/na/es-mx/buscar/jcr:content/searchResults.view.json',
    'sa-pt-br': '/content/ingredion-com/sa/pt-br/buscar/jcr:content/searchResults.ingredients.json',
  },
  DOWNLOAD_DOCUMENTS: {
    'na-es-mx': '/content/ingredion-com/ingredients/es-mx',
    'na-kerr': '/content/ingredion-com/ingredients/kerr',
  },
  DOWNLOAD_ALL_DOCUMENTS: {
    'na-es-mx': '/content/ingredion-com/ingredients/es-mx',
    'na-kerr': '/content/ingredion-com/ingredients/kerr',
  },
  DOWNLOAD_ALL_DOCUMENTS_FROM_SEARCH: {
    'na-es-mx': '/content/ingredion-com/na/es-mx/buscar/jcr:content/searchResults.download.zip',
    'na-kerr': '/content/ingredion-com/na/kerr/buscar/jcr:content/searchResults.download.zip',
  },
  SEARCH_INGREDIENTS: {
    'na-es-mx': '/content/ingredion-com/na/es-mx/buscar/jcr:content/searchResults.ingredients.json',
    'sa-pt-br': '/content/ingredion-com/sa/pt-br/buscar/jcr:content/searchResults.ingredients.json',
  },
  SEARCH_DOCUMENTS: {
    'na-es-mx': '/content/ingredion-com/na/es-mx/buscar/jcr:content/searchResults.techDocs.json',
    'sa-pt-br': '/content/ingredion-com/sa/pt-br/buscar/jcr:content/searchResults.techDocs.json',
  },
  SEARCH_INGREDIENTS_BY_NAME: {
    'na-es-mx': '/content/ingredion-com/na/es-mx/ingredientes/buscador-de-ingredientes/jcr:content/par/ingredientfinder.search.json',
    'na-kerr': '/content/ingredion-com/na/kerr/ingredient-finder/jcr:content/par/ingredientfinder.search.json',
    'sa-pt-br': '/content/ingredion-com/sa/pt-br/ingredientes/busque-o-ingrediente/jcr:content/par/ingredientfinder.search.json',
    'sa-es-co': '/content/ingredion-com/sa/es-co/nuestros-ingredientes/busca-el-ingrediente/jcr:content/par/ingredientfinder.search.json',
    'sa-es-ar': '/content/ingredion-com/sa/es-ar/nuestros-ingredientes/buscador-de-ingredientes/jcr:content/par/ingredientfinder.search.json',
  },
};

const resolveApiPath = (apiKey, region, locale) => {
  const key = `${region}-${locale}`;
  const override = API_PATH_OVERRIDES[apiKey]?.[key];
  if (override) return override;

  const defaultBuilder = DEFAULT_PATHS[apiKey];
  if (defaultBuilder) return defaultBuilder(region, locale);

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
