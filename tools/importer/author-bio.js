export default {
  /**
   * Apply DOM operations to the provided document and return
   * the root element to be then transformed to Markdown.
   * @param {HTMLDocument} document The document
   * @param {string} url The url of the page imported
   * @param {string} html The raw html (the document is cleaned up during preprocessing)
   * @param {object} params Object containing some parameters given by the import process.
   * @returns {HTMLElement} The root element to be transformed
   */
transform: ({ document, url, params }) => {
    const main = document.body;
    const result = [];
    
    
    const newPath = WebImporter.FileUtils.sanitizePath(url.pathname);
    const blogHeader = document.querySelector('.video-banner');
    if (blogHeader) {// no "element", the "from" property is provided instead - importer will download the "from" resource as "path"
    result.push({ 
      path: new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, ''),      
      report: {
        title: document.title,       
        path: newPath,
        url: url.href
      }});
    }
     
    return result;
  },
};