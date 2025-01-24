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
    const authorBio = document.querySelector('.author-bio');
    const imageWithDesc = document.querySelector('.imageWithDescription .image-desc .image-desc__wrapper');
    if (!authorBio && !imageWithDesc) {
      console.log('No author bio found');
      return;    
    }
    if (authorBio) {
    const authorName = authorBio.querySelector('.author-bio__text .heading').innerText;
    const authorImage = authorBio.querySelector('.author-bio__image > picture > img');
    const authorBioText = authorBio.querySelector('.author-bio__text .body-text').innerText;
    const href = authorImage.getAttribute('src');
    const u = new URL(href, url);
    const newPath = WebImporter.FileUtils.sanitizePath(u.pathname);
      // no "element", the "from" property is provided instead - importer will download the "from" resource as "path"
    result.push({ 
      path: new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, ''),
      from: href,
      report: {
        title: document.title,
        author: authorName,
        description: authorBioText,
        path: newPath,
      }});
    } else {
      const authorName = imageWithDesc.querySelector('.image-desc__text .heading').innerText;
      const authorImage = imageWithDesc.querySelector('.image-desc__image > picture > img');
      const authorBioText = imageWithDesc.querySelector('.image-desc__text .rte-block').innerText;
      const href = authorImage.getAttribute('src');
      const u = new URL(href, url);
      const newPath = WebImporter.FileUtils.sanitizePath(u.pathname);
        // no "element", the "from" property is provided instead - importer will download the "from" resource as "path"
      result.push({ 
        path: new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, ''),
        from: href,
        report: {
          title: document.title,
          author: authorName,
          description: authorBioText,
          path: newPath,
        }});
    }
     
    return result;
  },
};