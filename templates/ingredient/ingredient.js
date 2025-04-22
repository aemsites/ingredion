/* eslint-disable function-paren-newline, object-curly-newline */
import { div, h3, a, table, tr, th, td, label, input, img, h1, strong } from '../../scripts/dom-helpers.js';
import { API_HOST, API_PRODUCT, getUrlParams } from '../../scripts/product-api.js';
import { getRegionLocale, loadTranslations, translate } from '../../scripts/utils.js';
import { addIngredientToCart } from '../../scripts/add-to-cart.js';

const { productName } = getUrlParams();

export default async function decorate(doc) {
  const [, locale] = getRegionLocale();
  await loadTranslations(locale);

  const $main = doc.querySelector('main');

  // Fetch product details
  const productDetailsResponse = await fetch(API_PRODUCT.PRODUCT_DETAILS(productName));
  const productDetails = await productDetailsResponse.json();
  const product = productDetails.results[0];

  // get the response from the API
  const productDocsResponse = await fetch(API_PRODUCT.ALL_DOCUMENTS(product.productId));
  const productDoc = await productDocsResponse.json();

  let gallery = '';
  if (product.resourceLinks) {
    gallery = div({ class: 'right-column gallery' },
      div({ class: 'selected' },
        ...product.resourceLinks.map((link, index) => img({ src: API_HOST + link, alt: 'product image', class: index === 0 ? 'active' : '' })),
      ),
      div({ class: 'thumbs' },
        ...product.resourceLinks.map((link, index) => div({ class: `thumb ${index === 0 ? 'active' : ''}` },
          img({ src: API_HOST + link, alt: 'thumb image' }),
        )),
      ),
    );
  }

  const description = div({ class: 'description' });
  description.innerHTML = product.description;

  const $page = div({ class: 'section' },
    div({ class: 'default-content-wrapper' },
      div({ class: 'product-content' },
        div({ class: 'left-column' },
          // header
          div({ class: 'product-header' },
            div({ class: 'content' },
              h1(product.heading),
              div({ class: 'type' }, strong('Product Type: '), product.productType),
              div({ class: 'cta-links' },
                a({ class: 'view-all', href: '#technical-documents' }, 'View All Documents'),
                a({ class: 'download-all', href: API_PRODUCT.DOWNLOAD_ALL_DOCUMENTS(productName, product.productId) }, 'Download All Documents'),
              ),
              div({ class: 'cta-buttons' },
                a({ class: 'button add-sample-btn' }, 'Add Sample'),
                // TODO: add modal for contact us and pass product name
                a({ class: 'button secondary', href: `contact-us-modal?${productName}` }, translate('contact-us')),
              ),
            ),
            div({ class: 'anchor-nav' },
              div({ class: 'content' },
                a({ href: '#' }, translate('details')),
                a({ href: '#technical-documents' }, translate('technical-documents')),
                a({ href: '#sds-documents' }, translate('sds-documents')),
              ),
            ),
          ),
          description,
        ),
        gallery,
      ),

      // Technical Documents Table
      div({ class: 'table-wrapper' },
        h3({ id: 'technical-documents' }, translate('technical-documents')),
        table(
          tr(
            th(a({ class: 'select-all' }, translate('select-all'))),
            th(translate('document-type')),
            th(translate('format')),
            th(translate('size')),
          ),
          ...productDoc.technicalDocuments.map((techDoc) => tr(
            td(label({ class: 'checkbox' }, input({ type: 'checkbox', 'data-doc-id': techDoc.id }))),
            td(a({ class: 'doc', href: techDoc.path }, techDoc.documentType)),
            td(techDoc.format),
            td(techDoc.size),
          ),
          ),
        ),
        div({ class: 'download-wrapper' }, a({ class: 'button', 'data-doc-type': 'technical' }, 'Download Documents')),
      ),

      // // SDS Documents Table
      div({ class: 'table-wrapper' },
        h3({ id: 'sds-documents' }, translate('sds-documents')),
        table(
          tr(
            th(a({ class: 'select-all' }, translate('select-all'))),
            th(translate('region')),
            th(translate('language')),
            th(translate('size')),
          ),
          ...productDoc.sdsDocuments.map((sdsDoc) => tr(
            td(label({ class: 'checkbox' }, input({ type: 'checkbox', 'data-doc-id': sdsDoc.id }))),
            td(a({ class: 'doc', href: sdsDoc.path }, sdsDoc.locale.region)),
            td(sdsDoc.locale.language),
            td(sdsDoc.size),
          ),
          ),
        ),
        div({ class: 'download-wrapper' }, a({ class: 'button', 'data-doc-type': 'sds' }, 'Download Documents')),
      ),
    ),
  );

  $main.append($page);

  // gallery interactions
  if (product.resourceLinks) {
    const thumbs = document.querySelectorAll('.gallery .thumb');
    thumbs.forEach((thumb, index) => {
      thumb.addEventListener('click', () => {
        const oldSelectedImage = document.querySelector('.gallery img.active');
        const newSelectedImage = document.querySelector(`.gallery img:nth-child(${index + 1})`);
        thumbs.forEach((t) => { t.classList.remove('active'); });
        thumb.classList.add('active');
        newSelectedImage.classList.add('new');
        setTimeout(() => {
          newSelectedImage.classList.add('active');
          oldSelectedImage.classList.remove('active');
          // After transition completes, remove new class
          setTimeout(() => {
            newSelectedImage.classList.remove('new');
          }, 400);
        }, 50);
      });
    });
  }

  // Add scroll behavior for fixed header and active nav links
  const productHeader = document.querySelector('.product-header');
  const fixedHeader = productHeader.cloneNode(true);
  fixedHeader.classList.add('fixed');
  document.body.appendChild(fixedHeader);

  // let fixedHeader = null;

  window.addEventListener('scroll', () => {
    // show-hide fixed header
    if (window.scrollY > 280) {
      productHeader.classList.add('fade-out');
      // Add 'on' class after a small delay to allow for transition
      setTimeout(() => fixedHeader.classList.add('on'), 10);
    } else {
      productHeader.classList.remove('fade-out');
      fixedHeader.classList.remove('on');
    }

    // Handle active state for nav links
    const sections = ['#technical-documents', '#sds-documents'];
    const navLinks = document.querySelectorAll('.anchor-nav a');

    let currentSection = '';
    sections.forEach((section) => {
      const element = document.querySelector(section);
      if (element) {
        const rect = element.getBoundingClientRect();
        if (rect.top <= 200) {
          currentSection = section;
        }
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === currentSection) {
        link.classList.add('active');
      }
    });
  });

  // add sample button
  const addSampleBtns = document.querySelectorAll('.add-sample-btn');
  addSampleBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      addIngredientToCart(productName, window.location.href);
    });
  });

  // Add Select All functionality for both tables
  document.querySelectorAll('.select-all').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const checkboxes = e.target.closest('table').querySelectorAll('input[type="checkbox"]');
      const allChecked = Array.from(checkboxes).every((cb) => cb.checked);
      checkboxes.forEach((cb) => {
        cb.checked = !allChecked;
      });
    });
  });

  // Add download functionality
  const downloadSelectedDocuments = (button) => {
    const { docType } = button.dataset;
    const selectedIds = Array.from(button.closest('.table-wrapper').querySelectorAll('input[type="checkbox"]:checked'))
      .map((cb) => cb.dataset.docId)
      .join(',');

    if (!selectedIds) return;

    const downloadUrl = `${API_PRODUCT.DOWNLOAD_DOCUMENTS(productName, product.productId)}?productId=${product.productId}&documentType=${docType}&assetId=${selectedIds}`;

    // Use a temp link for reliability across browsers
    const tempLink = a({ href: downloadUrl, download: `${docType}-documents.zip`, style: 'display: none' });
    document.body.appendChild(tempLink);
    tempLink.click();
    tempLink.remove();
  };

  document.querySelectorAll('.download-wrapper .button').forEach((button) => {
    button.addEventListener('click', () => downloadSelectedDocuments(button));
  });
}
