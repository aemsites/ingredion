/* eslint-disable function-paren-newline, object-curly-newline */
import { div, h4, a } from '../../scripts/dom-helpers.js';
import { API_PRODUCT } from '../../scripts/product-api.js';
import { getRegionLocale, loadTranslations, translate } from '../../scripts/utils.js';
import { addIngredientToCart } from '../../scripts/add-to-cart.js';
import { readBlockConfig } from '../../scripts/aem.js';
import { viewAllDocsModal } from '../../scripts/product-utils.js';

const [region, locale] = getRegionLocale();

async function renderRelatedIngredient(productDisplayName) {
  try {
    // Fetch product details
    const productDetailsResponse = await fetch(
      API_PRODUCT.PRODUCT_DETAILS(region, locale, productDisplayName));
    const productDetails = await productDetailsResponse.json();

    if (!productDetails?.results?.[0]) {
      throw new Error('No product data found');
    }

    const product = productDetails.results[0];

    const description = div({ class: 'description' });
    description.innerHTML = (product.description).replace(/&nbsp;/g, ' '); // replace &nbsp; for natural word wrapping

    // add sample button
    const addSampleBtn = a({ title: 'Add Sample', class: 'button add-sample-button' }, translate('add-sample'));
    addSampleBtn.addEventListener('click', () => addIngredientToCart(product.productName, window.location.href));

    const viewAllDocsLink = a({ class: 'view-all' }, 'View All Documents');
    viewAllDocsLink.addEventListener('click', () => viewAllDocsModal(product));

    const relatedIngredientBlock = div({ class: 'related-ingredient' },
      div({ class: 'content' },
        h4({ class: 'product-name' }, product.heading),
        description,
        div({ class: 'cta-links' },
          viewAllDocsLink,
          a({ class: 'download-all', href: API_PRODUCT.DOWNLOAD_ALL_DOCUMENTS(region, locale, product.productName, product.productId) }, 'Download All Documents'),
        ),
      ),
      div({ class: 'buttons' },
        addSampleBtn,
        a({ class: 'button secondary', href: `/${region}/${locale}/ingredient?name=${product.productName}`, title: 'Learn More' }, 'Learn More'),
      ),
    );

    return relatedIngredientBlock;
  } catch (error) {
    console.error('Error:', error);
    return div({ class: 'related-ingredient error' },
      div({ class: 'content' },
        h4({ class: 'product-name' }, productDisplayName),
        div({ class: 'error-message' }, 'Error retrieving data'),
      ),
    );
  }
}

export default async function decorate(block) {
  const { 'product-name': productDisplayName } = readBlockConfig(block);
  await loadTranslations(locale);

  // placeholder until rendered
  const placeholder = div({ class: 'related-ingredient loading' }, div({ class: 'loader' }));
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
    threshold: 0.01,
  });

  observer.observe(placeholder);
}
