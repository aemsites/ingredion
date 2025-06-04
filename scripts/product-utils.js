/* eslint-disable function-paren-newline, object-curly-newline */
import { div, h4, h3, a, table, tr, th, td, label, input } from './dom-helpers.js';
import { API_PRODUCT, API_HOST } from './product-api.js';
import { translate, getRegionLocale } from './utils.js';
import { createModal } from '../blocks/modal/modal.js';
import { loadCSS } from './aem.js';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/**
 * Format a date into a readable string
 * @param {Date} date - The date to format
 * @param {boolean} isRange - Whether this is part of a date range
 * @returns {string} The formatted date string
 */
function formatDate(date, isRange = false) {
  const month = MONTHS[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();

  return `${month} ${day}${isRange ? '' : ','} ${year}`;
}

/**
 * Parse event date from various string formats and optionally format it
 * @param {string} dateStr - The date string to parse
 * @param {boolean} [format=false] - Whether to return a formatted string instead of Date object
 * @returns {Date|string|null} The parsed date, formatted string, or null if unparseable
 */
export function parseEventDate(dateStr, format = false) {
  if (!dateStr) return null;

  try {
    // Handle JSON string format
    const parsed = JSON.parse(dateStr);
    if (!parsed || !parsed[0]) return null;
    // eslint-disable-next-line no-param-reassign,prefer-destructuring
    dateStr = parsed[0];
  } catch (e) {
    // If it's not a JSON string, use it as is
  }

  // Handle ISO date format (2025-04-28T20:25:57.917Z)
  if (dateStr.includes('T')) {
    const date = new Date(dateStr);
    return format ? formatDate(date) : date;
  }

  // Extract year from the date string
  const yearMatch = dateStr.match(/\d{4}/);
  if (!yearMatch) return null;
  const year = parseInt(yearMatch[0], 10);

  // Handle date ranges (e.g., "October 13-14, 2021" or "May 10-12, 2022")
  const rangeMatch = dateStr.match(/^([A-Za-z]+\s+\d+)(?:-(\d+))?,\s+\d{4}/);
  if (rangeMatch) {
    const date = new Date(rangeMatch[0]);
    date.setFullYear(year);
    if (format) {
      if (rangeMatch[2]) {
        // If we have a range end date, format it as a range
        const endDate = new Date(date);
        endDate.setDate(parseInt(rangeMatch[2], 10));
        const startMonth = MONTHS[date.getMonth()];
        const endMonth = MONTHS[endDate.getMonth()];

        if (startMonth === endMonth) {
          return `${startMonth} ${date.getDate()}-${endDate.getDate()}, ${year}`;
        }
        return `${formatDate(date, true)}-${formatDate(endDate)}`;
      }
      return formatDate(date);
    }
    return date;
  }

  // Handle single dates (e.g., "February 9, 2023")
  const singleDateMatch = dateStr.match(/^[A-Za-z]+\s+\d+,\s+\d{4}/);
  if (singleDateMatch) {
    const date = new Date(singleDateMatch[0]);
    date.setFullYear(year);
    return format ? formatDate(date) : date;
  }

  // Handle dates with "Start time" suffix
  const startTimeMatch = dateStr.match(/^([A-Za-z]+\s+\d+,\s+\d{4})\s+Start time/);
  if (startTimeMatch) {
    const date = new Date(startTimeMatch[1]);
    date.setFullYear(year);
    return format ? formatDate(date) : date;
  }

  // Handle dates with ampersand (e.g., "September 8 & 9, 2022")
  const ampersandMatch = dateStr.match(/^([A-Za-z]+\s+\d+)\s*&\s*(\d+),\s+\d{4}/);
  if (ampersandMatch) {
    const date = new Date(ampersandMatch[0]);
    date.setFullYear(year);
    if (format) {
      const endDate = new Date(date);
      endDate.setDate(parseInt(ampersandMatch[2], 10));
      const startMonth = MONTHS[date.getMonth()];
      const endMonth = MONTHS[endDate.getMonth()];

      if (startMonth === endMonth) {
        return `${startMonth} ${date.getDate()}-${endDate.getDate()}, ${year}`;
      }
      return `${formatDate(date, true)}-${formatDate(endDate)}`;
    }
    return date;
  }

  // Handle dates with extra spaces around dash (e.g., "July 19 - 23, 2021")
  const spacedDashMatch = dateStr.match(/^([A-Za-z]+\s+\d+)\s*-\s*(\d+),\s+\d{4}/);
  if (spacedDashMatch) {
    const date = new Date(spacedDashMatch[0]);
    date.setFullYear(year);
    if (format) {
      const endDate = new Date(date);
      endDate.setDate(parseInt(spacedDashMatch[2], 10));
      const startMonth = MONTHS[date.getMonth()];
      const endMonth = MONTHS[endDate.getMonth()];

      if (startMonth === endMonth) {
        return `${startMonth} ${date.getDate()}-${endDate.getDate()}, ${year}`;
      }
      return `${formatDate(date, true)}-${formatDate(endDate)}`;
    }
    return date;
  }

  return null;
}

// eslint-disable-next-line import/prefer-default-export
export async function viewAllDocsModal(product) {
  loadCSS('/styles/documents-table.css');

  const [region, locale] = getRegionLocale();

  // Get product documents after we have the product ID
  const productDocsResponse = await fetch(
    API_PRODUCT.ALL_DOCUMENTS(region, locale, product.productId));
  const productDocs = await productDocsResponse.json();

  // Function to render modal content based on viewport size
  function renderModalContent() {
    if (window.matchMedia('(max-width: 1024px)').matches) {
      // Mobile view
      return div({ class: 'related-ingredient-modal' },
        // Technical Documents Table
        productDocs.technicalDocuments?.length > 0 ? div({ class: 'table-wrapper mobile-view' },
          h4(product.heading),
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
        ) : null,

        // SDS Documents Table
        productDocs.sdsDocuments?.length > 0 ? div({ class: 'table-wrapper mobile-view' },
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
        ) : null,
      );
    }

    // Desktop view
    const $modalContent = div({ class: 'related-ingredient-modal' },
      // Technical Documents Table
      productDocs.technicalDocuments?.length > 0 ? div({ class: 'table-wrapper' },
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
      ) : null,

      // SDS Documents Table
      productDocs.sdsDocuments?.length > 0 ? div({ class: 'table-wrapper' },
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
      ) : null,
    );

    // Add Select All functionality for both tables
    $modalContent.querySelectorAll('.select-all').forEach((btn) => {
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

      const downloadUrl = `${API_PRODUCT.DOWNLOAD_DOCUMENTS(region, locale, product.productName, product.productId)}?productId=${product.productId}&documentType=${docType}&assetId=${selectedIds}`;

      // Use a temp link for reliability across browsers
      const tempLink = a({ href: downloadUrl, download: `${docType}-documents.zip`, style: 'display: none' });
      document.body.appendChild(tempLink);
      tempLink.click();
      tempLink.remove();
    };

    $modalContent.querySelectorAll('.download-wrapper .button').forEach(($button) => {
      $button.addEventListener('click', () => downloadSelectedDocuments($button));
    });

    return $modalContent;
  }

  // Create initial modal content
  const { showModal, block } = await createModal([renderModalContent()]);
  const dialog = block.querySelector('dialog');
  dialog.classList.add('related-ingredient-modal');

  // Track current viewport state
  let isMobile = window.matchMedia('(max-width: 1024px)').matches;
  let resizeTimeout;

  // Handle resize with debounce
  const handleResize = () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const newIsMobile = window.matchMedia('(max-width: 1024px)').matches;

      // Only update if we've crossed the breakpoint
      if (newIsMobile !== isMobile) {
        const modalContent = block.querySelector('dialog > div');
        if (modalContent) {
          // Store current scroll position
          const scrollTop = window.scrollY;

          // Update content while preserving modal structure
          const newContent = renderModalContent();
          const modalWrapper = div({ class: 'modal-content' });
          modalWrapper.appendChild(newContent);
          modalContent.replaceWith(modalWrapper);

          // Restore scroll position
          window.scrollTo(0, scrollTop);
        }
        isMobile = newIsMobile;
      }
    }, 100);
  };

  // Add resize listener
  window.addEventListener('resize', handleResize);

  // Clean up the listener when the modal is closed
  dialog.addEventListener('close', () => {
    window.removeEventListener('resize', handleResize);
    clearTimeout(resizeTimeout);
  });

  showModal();
}
