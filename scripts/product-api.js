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
  PRODUCT_DETAILS: (productName) => `${API_HOST}/content/ingredion-com/na/en-us/search/jcr:content/searchResults.ingredients.json?initialTab=&q=${productName}`,
  ALL_DOCUMENTS: (productId) => `${API_HOST}/content/ingredion-com/na/en-us/search/jcr:content/searchResults.view.json?productId=${productId}`,
  DOWNLOAD_DOCUMENTS: (productName) => `${API_HOST}/content/ingredion-com/ingredients/na/${productName}/jcr:content.download.zip`,
  DOWNLOAD_ALL_DOCUMENTS: (productName, productId) => `${API_HOST}/content/ingredion-com/ingredients/na/${productName}/jcr:content.download.zip?productId=${productId}&documentType=all`,
};
