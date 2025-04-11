const SERVICE_HOST = 'https://www.ingredion.com';

export const getUrlParams = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    productId: params.get('pid'),
    productName: params.get('name'),
  };
};

export const PRODUCT_API = {
  PRODUCT_DETAILS: (productName) => `${SERVICE_HOST}/content/ingredion-com/na/en-us/search/jcr:content/searchResults.ingredients.json?initialTab=&q=${productName}`,
  ALL_DOCUMENTS: (productId) => `${SERVICE_HOST}/content/ingredion-com/na/en-us/search/jcr:content/searchResults.view.json?productId=${productId}`,
  DOWNLOAD_DOCUMENTS: (productName) => `${SERVICE_HOST}/content/ingredion-com/ingredients/na/${productName}/jcr:content.download.zip`,
  DOWNLOAD_ALL_DOCUMENTS: (productName, productId) => `${SERVICE_HOST}/content/ingredion-com/ingredients/na/${productName}/jcr:content.download.zip?productId=${productId}&documentType=all`,
}; 