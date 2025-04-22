/* eslint-disable function-paren-newline, object-curly-newline */
import { div, h2, h3, a, table, tr, th, td, label, input } from './dom-helpers.js';
import { API_PRODUCT, API_HOST } from './product-api.js';
import { translate } from './utils.js';
import { createModal } from '../blocks/modal/modal.js';

// eslint-disable-next-line import/prefer-default-export
export async function viewAllDocsModal(product) {
  // Get product documents after we have the product ID
  const productDocsResponse = await fetch(API_PRODUCT.ALL_DOCUMENTS(product.productId));
  const productDocs = await productDocsResponse.json();

  const modalContent = div(
    { class: 'modal-content' },
    h2(product.heading),
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
        ...productDocs.technicalDocuments.map((techDoc) => tr(
          td(label({ class: 'checkbox' }, input({ type: 'checkbox', 'data-doc-id': techDoc.id }))),
          td(a({ class: 'doc', href: API_HOST + techDoc.path, target: '_blank' }, techDoc.documentType)),
          td(techDoc.format),
          td(techDoc.size),
        )),
      ),
      div({ class: 'download-wrapper' }, a({ class: 'button', 'data-doc-type': 'technical' }, 'Download Documents')),
    ),

    // SDS Documents Table
    div({ class: 'table-wrapper' },
      h3({ id: 'sds-documents' }, translate('sds-documents')),
      table(
        tr(
          th(a({ class: 'select-all' }, translate('select-all'))),
          th(translate('region')),
          th(translate('language')),
          th(translate('size')),
        ),
        ...productDocs.sdsDocuments.map((sdsDoc) => tr(
          td(label({ class: 'checkbox' }, input({ type: 'checkbox', 'data-doc-id': sdsDoc.id }))),
          td(a({ class: 'doc', href: API_HOST + sdsDoc.path, target: '_blank' }, sdsDoc.locale.region)),
          td(sdsDoc.locale.language),
          td(sdsDoc.size),
        )),
      ),
      div({ class: 'download-wrapper' }, a({ class: 'button', 'data-doc-type': 'sds' }, 'Download Documents')),
    ),
  );

  const { showModal } = await createModal([modalContent]);
  showModal();
}
