// This file contains all the product API endpoints

// prod
export const API_HOST = 'https://www.ingredion.com';

// stage - testing (todo: remove before go-live)
// export const API_HOST = 'https://ingredion-stage65.adobecqms.net';

export const getUrlParams = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    productName: params.get('name'),
  };
};

export const API_PRODUCT = {
  POPULATE_INGREDIENT_CATEGORY_SUBCATEGORY: () => `${API_HOST}/content/ingredion-com/na/en-us/jcr:content/header.search.json?initialTab=`,
  SEARCH_INGREDIENT_BY_CATEGORY_SUBCATEGORY: () => `${API_HOST}/content/ingredion-com/na/en-us/ingredients/ingredient-finder/jcr:content/par/ingredientfinder.search.json`,
  INGREDIENT_SEARCH_TYPEAHEAD: () => `${API_HOST}/content/ingredion-com/na/en-us.ingredient-search-typeahead.json?initialTab=`,
  PRODUCT_DETAILS: (productName) => `${API_HOST}/content/ingredion-com/na/en-us/search/jcr:content/searchResults.ingredients.json?initialTab=&q=${productName}`,
  ALL_DOCUMENTS: (productId) => `${API_HOST}/content/ingredion-com/na/en-us/search/jcr:content/searchResults.view.json?productId=${productId}`,
  DOWNLOAD_DOCUMENTS: (productName) => `${API_HOST}/content/ingredion-com/ingredients/na/${productName}/jcr:content.download.zip`,
  DOWNLOAD_ALL_DOCUMENTS: (productName, productId) => `${API_HOST}/content/ingredion-com/ingredients/na/${productName}/jcr:content.download.zip?productId=${productId}&documentType=all`,
  DOWNLOAD_ALL_DOCUMENTS_FROM_SEARCH: (productId) => `${API_HOST}/content/ingredion-com/na/en-us/search/jcr:content/searchResults.download.zip?productId=${productId}&documentType=all`,
  SEARCH_INGREDIENTS: () => `${API_HOST}/content/ingredion-com/na/en-us/search/jcr:content/searchResults.ingredients.json`,
  SEARCH_DOCUMENTS: () => `${API_HOST}/content/ingredion-com/na/en-us/search/jcr:content/searchResults.techDocs.json`,
  SEARCH_INGREDIENTS_BY_NAME: () => `${API_HOST}/content/ingredion-com/na/en-us/ingredients/ingredient-finder/jcr:content/par/ingredientfinder.search.json`,
};
