/* eslint-disable function-paren-newline, object-curly-newline */
import { div, h4, h2, h3, a, table, tr, th, td, label, input } from './dom-helpers.js';
import { API_PRODUCT, API_HOST } from './product-api.js';
import { translate } from './utils.js';
import { createModal } from '../blocks/modal/modal.js';
import { loadCSS } from './aem.js';

// eslint-disable-next-line import/prefer-default-export
export async function viewAllDocsModal(product) {
  loadCSS('/styles/documents-table.css');

  // Get product documents after we have the product ID
  const productDocsResponse = await fetch(API_PRODUCT.ALL_DOCUMENTS(product.productId));
  const productDocs = await productDocsResponse.json();

  // Create media query object for mobile breakpoint
  const mobileQuery = window.matchMedia('(max-width: 1024px)');

  // Function to create modal content based on viewport size
  const createModalContent = (isMobile) => {
    let modalContent;
    if (isMobile) {
      return div({ class: 'related-ingredient-modal' },
        // Technical Documents Table
        div({ class: 'table-wrapper mobile-view' },
          h2(product.heading),
          h3({ id: 'technical-documents' }, translate('technical-documents')),
          table(
            tr(
              th(translate('document-type')),
              th(),
            ),
            ...productDocs.technicalDocuments.map((techDoc) => tr(
              td({ class: 'document-type' }, techDoc.documentType),
              td(a({ class: 'doc', href: API_HOST + techDoc.path, target: '_blank' }, 'VIEW')),
            )),
          ),
        ),

        // SDS Documents Table
        div({ class: 'table-wrapper mobile-view' },
          h3({ id: 'sds-documents' }, translate('sds-documents')),
          table(
            tr(
              th(translate('region')),
              th(),
            ),
            ...productDocs.sdsDocuments.map((sdsDoc) => tr(
              td({ class: 'region' }, sdsDoc.locale.region),
              td(a({ class: 'doc', href: API_HOST + sdsDoc.path, target: '_blank' }, 'VIEW')),
            )),
          ),
        ),
      );
    } else {

        modalContent = div({ class: 'related-ingredient-modal' },
            // Technical Documents Table
            div({ class: 'table-wrapper' },
                h4(product.heading),
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

      // Add Select All functionality for both tables
      modalContent.querySelectorAll('.select-all').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const checkboxes = e.target.closest('table').querySelectorAll('input[type="checkbox"]');
          const allChecked = Array.from(checkboxes).every((cb) => cb.checked);
          checkboxes.forEach((cb) => {
            cb.checked = !allChecked;
          });
        });
      });

      // Add download functionality
      const downloadSelectedDocuments = ($button) => {
        const { docType } = $button.dataset;
        const selectedIds = Array.from($button.closest('.table-wrapper').querySelectorAll('input[type="checkbox"]:checked'))
          .map((cb) => cb.dataset.docId)
          .join(',');

        if (!selectedIds) return;

        const downloadUrl = `${API_PRODUCT.DOWNLOAD_DOCUMENTS(product.productName, product.productId)}?productId=${product.productId}&documentType=${docType}&assetId=${selectedIds}`;

        // Use a temp link for reliability across browsers
        const tempLink = a({ href: downloadUrl, download: `${docType}-documents.zip`, style: 'display: none' });
        document.body.appendChild(tempLink);
        tempLink.click();
        tempLink.remove();
      };

      modalContent.querySelectorAll('.download-wrapper .button').forEach(($button) => {
        $button.addEventListener('click', () => downloadSelectedDocuments($button));
      });

        return modalContent;
    }
  }

  // Create initial modal content
  const modalContent = createModalContent(mobileQuery.matches);
  const { showModal, block } = await createModal([modalContent]);
  const dialog = block.querySelector('dialog');
  dialog.classList.add('related-ingredient-modal');

  // Add resize listener to update modal content
  let previousIsMobile = mobileQuery.matches;
  let resizeTimeout;

  const handleResize = () => {
    const currentIsMobile = mobileQuery.matches;
    
    // Only update if we've crossed the breakpoint
    if (currentIsMobile !== previousIsMobile) {
      const newContent = createModalContent(currentIsMobile);
      const modalContent = block.querySelector('dialog > div');
      
      if (modalContent) {
        // Preserve the modal-content class and structure
        const modalWrapper = div({ class: 'modal-content' });
        modalWrapper.appendChild(newContent);
        modalContent.replaceWith(modalWrapper);
      }
      
      previousIsMobile = currentIsMobile;
    }
  };

  // Add the resize listener with debounce
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(handleResize, 100);
  });

  // Clean up the listener when the modal is closed
  dialog.addEventListener('close', () => {
    window.removeEventListener('resize', handleResize);
    clearTimeout(resizeTimeout);
  });

  showModal();
}
