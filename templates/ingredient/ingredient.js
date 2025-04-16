/* eslint-disable function-paren-newline, object-curly-newline */
import { div, h1, h2, h3, h4, a, button, table, tr, th, td, label, input, img, strong, ul, li } from '../../scripts/dom-helpers.js';
import { API_HOST, API_PRODUCT, getUrlParams } from '../../scripts/product-api.js';
import { getRegionLocale, loadTranslations, translate } from '../../scripts/utils.js';
import { addIngredientToCart } from '../../scripts/add-to-cart.js';

const { productId, productName } = getUrlParams();

export default async function decorate(doc) {
  const [, locale] = getRegionLocale();
  await loadTranslations(locale);

  const $main = doc.querySelector('main');

  // Fetch product details
  const productDetailsResponse = await fetch(API_PRODUCT.PRODUCT_DETAILS(productName));
  const productDetails = await productDetailsResponse.json();
  const product = productDetails.results[0];

  // get the response from the API
  const response = await fetch(API_PRODUCT.ALL_DOCUMENTS(productId));
  const productData = await response.json();

  let gallery = '';

  const description = div({ class: 'description' });
  description.innerHTML = product.description;

  let $page = '';
  let productHeader = '';
  
  // Helper function to update fixed header
  const updateFixedHeader = (productHeader) => {
    // const fixedHeader = productHeader.cloneNode(true);
    // fixedHeader.classList.add('fixed');
    const existingFixedHeader = document.body.querySelector('.product-header.fixed');
    let fixedHeader = '';

    if (!existingFixedHeader) {
      fixedHeader = productHeader.cloneNode(true);
      fixedHeader.classList.add('fixed');
      document.body.appendChild(fixedHeader);

    } else {
      existingFixedHeader.innerHTML = productHeader.innerHTML;
    }

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
  };


  // render page content based on screen size
  const renderPageContent = () => {
    if (window.matchMedia('(max-width: 1024px)').matches) {
      // mobile view

      if (product.resourceLinks) {
        gallery = div({ class: 'gallery' },
          div({ class: 'selected' },
            ...product.resourceLinks.map((link, index) => img({ src: API_HOST + link, alt: 'product image', class: index === 0 ? 'active' : '' })),
          ),
          ul({ class: 'dots' },
            ...product.resourceLinks.map((link, index) => li({ class: `thumb ${index === 0 ? 'active' : ''}` })),
          ),
        );
      }

      productHeader = div({ class: 'product-header' },
        div({ class: 'content mobile-view' },
          h1(product.heading),
          div({ class: 'type' }, strong('Product Type: '), product.productType),
          div({ class: 'cta-links' },
            a({ class: 'view-all', href: '#technical-documents' }, 'View All Documents'),
          ),
          div({ class: 'cta-buttons' },
            a({ class: 'button add-sample-btn'}, 'Add Sample'),
            a({ class: 'button secondary', href: `contact-us-modal?${productName}` }, translate('contact-us')),
          ),
        ),
        div({ class: 'anchor-nav' },
          div({ class: 'content mobile-view' },
            a({ href: '#view-documents' }, 'Documents'),
            a({ href: '#' }, 'Contact'),
            a({ class: 'add-sample-btn' }, 'Add Sample'),
          ),
        ),
      );

      // Update fixed header
      updateFixedHeader(productHeader);

      $page = div({ class: 'section  mobile-view' },
        div({ class: 'default-content-wrapper' },
          div({ class: 'product-content' },
            productHeader,
            gallery,
            description,
          ),

          h4('Technical and SDS Documents'),
          
          div({ class: 'view-all-docs-btn-wrapper', id: 'view-documents' }, button({ class: 'button view-all-docs-btn' }, 'View All Documents')),

          div({ class: 'view-all-docs-wrapper' },
            div({ class: 'docs-header' },
              h4('Documents'),
              div({ class: 'close-docs' }),
            ),

            // Technical Documents Table
            div({ class: 'table-wrapper mobile-view' },

              h2(product.heading),
              h3({ id: 'technical-documents' }, translate('technical-documents')),
              table(
                tr(
                  th(translate('document-type')),
                  th(),
                ),
                ...productData.technicalDocuments.map((techDoc) => tr(
                  td({ class: 'document-type' }, techDoc.documentType),
                  td(a({ class: 'doc', href: API_HOST + techDoc.path, target: '_blank'  }, 'VIEW')),
                ),
                ),
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
                ...productData.sdsDocuments.map((sdsDoc) => tr(
                  td({ class: 'region' }, sdsDoc.locale.region),
                  td(a({ class: 'doc', href: API_HOST + sdsDoc.path, target: '_blank'  }, 'VIEW')),
                ),
                ),
              ),
            ),
          ),
        ),
      );

      $main.innerHTML = '';
      $main.append($page);

      // show view all docs wrapper on click of view all docs btn
      document.querySelector('.view-all-docs-btn').addEventListener('click', () => {
        document.querySelector('.view-all-docs-wrapper').classList.add('active');
      });

      // close docs wrapper on click of close docs wrapper
      document.querySelector('.close-docs').addEventListener('click', () => {
        document.querySelector('.view-all-docs-wrapper').classList.remove('active');
      });
      
    } else {
      // desktop view
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

      productHeader = div({ class: 'product-header' },
        div({ class: 'content' },
          h1(product.heading),
          div({ class: 'type' }, strong('Product Type: '), product.productType),
          div({ class: 'cta-links' },
            a({ class: 'view-all', href: '#technical-documents' }, 'View All Documents'),
            a({ class: 'download-all', href: API_PRODUCT.DOWNLOAD_ALL_DOCUMENTS(productName, productId) }, 'Download All Documents'),
          ),
          div({ class: 'cta-buttons' },
            a({ class: 'button add-sample-btn'}, 'Add Sample'),
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
      );

      // Update fixed header
      updateFixedHeader(productHeader);

      $page = div({ class: 'section' },
        div({ class: 'default-content-wrapper' },
          div({ class: 'product-content' },
            div({ class: 'left-column' },
              productHeader,
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
              ...productData.technicalDocuments.map((techDoc) => tr(
                td(label({ class: 'checkbox' }, input({ type: 'checkbox', 'data-doc-id': techDoc.id }))),
                td(a({ class: 'doc', href: API_HOST + techDoc.path, target: '_blank' }, techDoc.documentType)),
                td(techDoc.format),
                td(techDoc.size),
              ),
              ),
            ),
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
              ...productData.sdsDocuments.map((sdsDoc) => tr(
                td(label({ class: 'checkbox' }, input({ type: 'checkbox', 'data-doc-id': sdsDoc.id }))),
                td(a({ class: 'doc', href: API_HOST + sdsDoc.path, target: '_blank' }, sdsDoc.locale.region)),
                td(sdsDoc.locale.language),
                td(sdsDoc.size),
              ),
              ),
            ),
          ),
        ),
      );

      // Clear existing content and append new content
      $main.innerHTML = '';
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

      // Add download functionality
      const downloadSelectedDocuments = (button) => {
        const { docType } = button.dataset;
        const selectedIds = Array.from(button.closest('.table-wrapper').querySelectorAll('input[type="checkbox"]:checked'))
          .map((cb) => cb.dataset.docId)
          .join(',');

        if (!selectedIds) return;

        const downloadUrl = `${API_PRODUCT.DOWNLOAD_DOCUMENTS(productName, productId)}?productId=${productId}&documentType=${docType}&assetId=${selectedIds}`;

        // Use a temp link for reliability across browsers
        const tempLink = a({ href: downloadUrl, download: `${docType}-documents.zip`, style: 'display: none' });
        document.body.appendChild(tempLink);
        tempLink.click();
        tempLink.remove();
      };

      document.querySelectorAll('.download-wrapper .button').forEach((button) => {
        button.addEventListener('click', () => downloadSelectedDocuments(button));
      });
    } // end desktop view
    
    // add sample button (both mobile and desktop)
    const addSampleBtns = document.querySelectorAll('.add-sample-btn');
    addSampleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        addIngredientToCart(productName, window.location.href);
      });
    });
  };


  // render page
  renderPageContent();
  window.addEventListener('resize', renderPageContent);

  // image gallery
  // TODO: clean up for mobile carousel
  // add video support
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
}
