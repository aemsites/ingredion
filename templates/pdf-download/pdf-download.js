/* eslint-disable function-paren-newline, object-curly-newline */
import { div, h3, a, table, tr, th, td, label, input, span, h1, p } from '../../scripts/dom-helpers.js';
import { PRODUCT_API, getUrlParams } from '../../scripts/product-api.js';

const { productId, productName } = getUrlParams();

export default async function decorate(doc) {
  const $main = doc.querySelector('main');

  // Fetch product details
  const productDetailsResponse = await fetch(PRODUCT_API.PRODUCT_DETAILS(productName));
  const productDetails = await productDetailsResponse.json();
  const product = productDetails.results[0];

  // get the response from the API
  const response = await fetch(PRODUCT_API.ALL_DOCUMENTS(productId));
  const productData = await response.json();

  const $page = div({ class: 'section' },
    div({ class: 'default-content-wrapper' },
      // header
      div({ class: 'product-header' },
        div({ class: 'content' },
          h1(product.heading),
          div({ class: 'cta-links' },
            a({ class: 'view-all', href: '#documents' }, 'View All Documents'),
            a({ class: 'download-all', href: PRODUCT_API.DOWNLOAD_ALL_DOCUMENTS(productName, productId) }, 'Download All Documents'),
          ),
          div({ class: 'buttons' },
            // TODO: Add sample functionality
            a({ class: 'button' }, product.primaryCtaLabel),
            // TODO: Learn More Page??
            a({ class: 'button secondary', href: product.secondaryCtaUrl }, product.secondaryCtaLabel),
          ),
        ),
        div({ class: 'anchor-nav' },
            div({ class: 'content' },
                a({ href: '#' }, 'Details'),
                a({ href: '#technical-documents' }, 'Technical Documents'),
                a({ href: '#sds-documents' }, 'SDS Documents'),
            ),
        ),
      ),

      p(product.description.replace(/<[^>]*>/g, '')),

      // Technical Documents Table
      div({ class: 'table-wrapper' },
        h3({ id: 'technical-documents' }, 'Technical Documents'),
        table(
          tr(
            th(a({ class: 'select-all' }, 'Select All')),
            th('Document Type'),
            th('Format'),
            th('Size'),
          ),
          ...productData.technicalDocuments.map((techDoc) => tr(
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
        h3({ id: 'sds-documents' }, 'SDS Documents'),
        table(
          tr(
            th(a({ class: 'select-all' }, 'Select All')),
            th('Region'),
            th('Language'),
            th('Size'),
          ),
          ...productData.sdsDocuments.map((sdsDoc) => tr(
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

  // Clear and append both tables

  $main.append($page);

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

  // Add scroll behavior for fixed header and active nav links
  const productHeader = document.querySelector('.product-header');
  let fixedHeader = null;

  window.addEventListener('scroll', () => {
    if (productHeader) {
      if (window.scrollY > 280) {
        if (!fixedHeader) {
          // Clone the header and add fixed class
          fixedHeader = productHeader.cloneNode(true);
          fixedHeader.classList.add('fixed');
          document.body.appendChild(fixedHeader);
          // Fade out the original header
          productHeader.classList.add('fade-out');
        }
      } else if (fixedHeader) {
        // Remove the fixed header when scrolling back up
        fixedHeader.remove();
        fixedHeader = null;
        // Fade in the original header
        productHeader.classList.remove('fade-out');
      }
    }

    // Handle active state for nav links
    const sections = ['#technical-documents', '#sds-documents'];
    const navLinks = document.querySelectorAll('.anchor-nav a');
    
    let currentSection = '';
    sections.forEach(section => {
      const element = document.querySelector(section);
      if (element) {
        const rect = element.getBoundingClientRect();
        if (rect.top <= 200) {
          currentSection = section;
        }
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === currentSection) {
        link.classList.add('active');
      }
    });
  });

  // Add download functionality
  const downloadSelectedDocuments = (button) => {
    const { docType } = button.dataset;
    const selectedIds = Array.from(button.closest('.table-wrapper').querySelectorAll('input[type="checkbox"]:checked'))
      .map((cb) => cb.dataset.docId)
      .join(',');

    if (!selectedIds) return;

    const downloadUrl = `${PRODUCT_API.DOWNLOAD_DOCUMENTS(productName, productId)}?productId=${productId}&documentType=${docType}&assetId=${selectedIds}`;

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
