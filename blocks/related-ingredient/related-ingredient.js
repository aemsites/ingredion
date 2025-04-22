/* eslint-disable function-paren-newline, object-curly-newline */
import { div, span, h4, p, a, h3 } from '../../scripts/dom-helpers.js';
import { API_PRODUCT } from '../../scripts/product-api.js';
import { addIngredientToCart } from '../../scripts/add-to-cart.js';
import { readBlockConfig } from '../../scripts/aem.js';


async function renderRelatedIngredient(productDisplayName) {
  try {
    // Fetch product details
    const productDetailsResponse = await fetch(API_PRODUCT.PRODUCT_DETAILS(productDisplayName));
    const productDetails = await productDetailsResponse.json();
    
    if (!productDetails?.results?.[0]) {
      throw new Error('No product data found');
    }
    
    const product = productDetails.results[0];
    
    // Get product documents after we have the product ID
    const productDocsResponse = await fetch(API_PRODUCT.ALL_DOCUMENTS(product.productId));
    const productDoc = await productDocsResponse.json();

    const description = div({ class: 'description' });
    // Replace &nbsp; with regular spaces to allow natural word wrapping
    description.innerHTML = (product.description).replace(/&nbsp;/g, ' ');

    // add sample button
    const addSampleBtn = a({ title: 'Add Sample', class: 'button add-sample-button' }, 'Add Sample');
    addSampleBtn.addEventListener('click', () => addIngredientToCart(product.productName, window.location.href));

    const relatedIngredientBlock = div({ class: 'related-ingredient2' },
      div({ class: 'content' },
        h4({ class: 'product-name' }, productDisplayName),
        description,
        div({ class: 'cta-links' },
          a({ class: 'view-all', href: '#technical-documents' }, 'View All Documents'),
          a({ class: 'download-all', href: API_PRODUCT.DOWNLOAD_ALL_DOCUMENTS(product.productName, product.productId) }, 'Download All Documents'),
        ),
      ),
      div({ class: 'buttons' },
        addSampleBtn,
        a({ class: 'button secondary', href: `/na/en-us/ingredient?pid=${product.productId}&name=${product.productName}`, title: 'Learn More'}, 'Learn More'), 
      ),
    );

    return relatedIngredientBlock
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}


export default function decorate(block) {
  const {
    'product-name': productDisplayName,
  } = readBlockConfig(block);

  // Create a placeholder div to maintain the space
  const placeholder = div({ class: 'related-ingredient2' });
  block.replaceWith(placeholder);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        renderRelatedIngredient(productDisplayName).then((content) => {
          placeholder.replaceWith(content);
        });
        observer.disconnect();
      }
    });
  }, {
    rootMargin: '400px 0px',
    threshold: 0.01
  });

  observer.observe(placeholder);
}
