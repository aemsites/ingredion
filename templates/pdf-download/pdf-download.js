/* eslint-disable function-paren-newline, object-curly-newline */
import { div, h3, a, table, tr, th, td, label, input, span, h1, p } from '../../scripts/dom-helpers.js';

// Example URL: https://www.ingredion.com/na/en-us/ingredient/nhance-59-07730402.html#

const productId = new URLSearchParams(window.location.search).get('pid'); // 3891
const productName = new URLSearchParams(window.location.search).get('name'); // nhance-59-07730402

const SERVICE_HOST = 'https://www.ingredion.com';
const GET_ALL_DOCUMENTS = `${SERVICE_HOST}/content/ingredion-com/na/en-us/search/jcr:content/searchResults.view.json?productId=${productId}`;
const DOWNLOAD_DOCUMENTS = `${SERVICE_HOST}/content/ingredion-com/ingredients/na/${productName}/jcr:content.download.zip`;
const DOWNLOAD_ALL_DOCUMENTS = `${DOWNLOAD_DOCUMENTS}?productId=${productId}&documentType=all`;

export default async function decorate(doc) {
  const $main = doc.querySelector('main');

  // get the response from the API
  const response = await fetch(GET_ALL_DOCUMENTS);
  const productData = await response.json();

  const $page = div({ class: 'section' },
    div({ class: 'default-content-wrapper' },
      // header
      div({ class: 'product-header' },
        div({ class: 'content' },
          h1('NEED SERVICE FOR TITLE'),
          div({ class: 'cta-links' },
            a({ class: 'view-all', href: '#documents' }, 'View All Documents'),
            a({ class: 'download-all', href: DOWNLOAD_ALL_DOCUMENTS }, 'Download All Documents'),
          ),
          div({ class: 'buttons' },
            a({ class: 'button' }, 'Add Sample'),
            a({ class: 'button secondary', href: '#' }, 'Contact Us'),
          ),
        ),
        div({ class: 'anchor-links' },
          a({ href: '#technical-documents' }, 'Technical Documents'),
          a({ href: '#sds-documents' }, 'SDS Documents'),
        ),
      ),

      p('NEED SERVICE FOR PRODUCT DESCRIPTION'),

      // Technical Documents Table
      div({ class: 'table-wrapper', id: 'technical-documents' },
        h3('Technical Documents'),
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
      div({ class: 'table-wrapper', id: 'sds-documents' },
        h3('SDS Documents'),
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

  // Add scroll behavior for fixed header
  window.addEventListener('scroll', () => {
    const productHeader = document.querySelector('.product-header');
    if (productHeader) {
      if (window.scrollY > 280) {
        productHeader.classList.add('fixed');
      } else {
        productHeader.classList.remove('fixed');
      }
    }
  });

  // Add download functionality
  const downloadSelectedDocuments = (button) => {
    const { docType } = button.dataset;
    const selectedIds = Array.from(button.closest('.table-wrapper').querySelectorAll('input[type="checkbox"]:checked'))
      .map((cb) => cb.dataset.docId)
      .join(',');

    if (!selectedIds) return;

    const downloadUrl = `${DOWNLOAD_DOCUMENTS}?productId=${productId}&documentType=${docType}&assetId=${selectedIds}`;


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
