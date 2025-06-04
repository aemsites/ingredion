/* eslint-disable function-paren-newline, object-curly-newline, no-underscore-dangle */
import { div, h1, h2, h3, h4, a, button, table, tr, th, td, label, input, img, strong, script } from '../../scripts/dom-helpers.js';
import { API_HOST, API_PRODUCT, getUrlParams } from '../../scripts/product-api.js';
import { getRegionLocale, loadTranslations, translate } from '../../scripts/utils.js';
import { addIngredientToCart } from '../../scripts/add-to-cart.js';

const [region, locale] = getRegionLocale();

// Checks if a path looks like a valid image file (e.g., ends with /filename.ext)
function isValidImagePath(path) {
  // check if image path is valid
  return /\/[^/]+\.[a-zA-Z0-9]+$/.test(path);
}

// Update fixed header
function updateFixedHeader($productHeader) {
  // clean up any existing fixed headers and observers
  const cleanup = () => {
    const existingFixed = document.body.querySelector('.product-header.fixed');
    if (existingFixed) existingFixed.remove();
  };

  // clean up on init
  cleanup();

  const $fixedHeader = $productHeader.cloneNode(true);
  $fixedHeader.classList.add('fixed', 'hidden');
  document.body.appendChild($fixedHeader);

  const rightColumn = document.querySelector('.right-column');

  // Create intersection observer for header
  const headerObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // fade out fixed header (fade in product header)
          $productHeader.classList.remove('fade-out');
          $fixedHeader.classList.remove('visible');
          // slide up gallery
          if (rightColumn) rightColumn.classList.remove('slide-down');
          // Wait for transition to complete then hide
          setTimeout(() => $fixedHeader.classList.add('hidden'), 300);
        } else {
          // fade in fixed header (fade out product header)
          $productHeader.classList.add('fade-out');
          $fixedHeader.classList.remove('hidden');
          // slide down gallery
          if (rightColumn) rightColumn.classList.add('slide-down');
          requestAnimationFrame(() => {
            // eslint-disable-next-line no-unused-expressions
            $fixedHeader.offsetHeight; // force reflow
            $fixedHeader.classList.add('visible');
          });
        }
      });
    },
    {
      rootMargin: '-200px 0px 0px 0px',
      threshold: 0.1,
    },
  );

  // Ensure the observer is connected
  headerObserver.observe($productHeader);

  // Handle active state for nav links
  const handleNavLinks = () => {
    const sections = ['#technical-documents', '#sds-documents'];
    const navLinks = document.querySelectorAll('.anchor-nav a');
    let currentSection = '';

    sections.forEach((section) => {
      const element = document.querySelector(section);
      if (element) {
        const rect = element.getBoundingClientRect();
        if (rect.top <= 200) currentSection = section;
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === currentSection) link.classList.add('active');
    });
  };

  // Add scroll listener for nav links
  window.addEventListener('scroll', handleNavLinks);

  // Return cleanup function
  return () => {
    headerObserver.disconnect();
    window.removeEventListener('scroll', handleNavLinks);
    cleanup();
  };
}

function showProductError($main) {
  const $error = div({ class: 'default-content-wrapper' },
    div({ class: 'error-message' }, 'Issue retrieving product information'),
  );
  $main.querySelector('.section').appendChild($error);
}

export default async function decorate(doc) {
  const { productName } = getUrlParams();
  await loadTranslations(locale);

  const $main = doc.querySelector('main');

  // get product details
  let product = null;
  let productDetails = null;
  try {
    // eslint-disable-next-line max-len
    const fetchProductDetails = await fetch(API_PRODUCT.PRODUCT_DETAILS(region, locale, productName));
    if (fetchProductDetails.status === 204) {
      showProductError($main);
      return;
    }
    if (fetchProductDetails.ok) {
      productDetails = await fetchProductDetails.json();
      product = productDetails.results?.[0];
      if (!product) {
        showProductError($main);
        return;
      }
    } else {
      showProductError($main);
      return;
    }
  } catch (e) {
    showProductError($main);
    return;
  }

  // get product documents
  const fetchProductDocs = await fetch(
    API_PRODUCT.ALL_DOCUMENTS(region, locale, product.productId));
  const productDocs = await fetchProductDocs.json();

  // update the title tag with the product name
  document.title = product.heading;

  const description = div({ class: 'description' });
  description.innerHTML = product.description;

  let gallery = '';
  if (product.resourceLinks) {
    // Filter out resource links that are not valid paths
    // eslint-disable-next-line max-len
    const validResourceLinks = product.resourceLinks.filter((link) => link.resourceLink && isValidImagePath(link.resourceLink),
    );
    // Only build the gallery if there are valid image paths
    if (validResourceLinks.length > 0) {
      // If videos exist, load Vimeo script
      if (product.resourceLinks.some((link) => link.teaserVideo)) {
        await new Promise((resolve) => {
          if (window.Vimeo) {
            resolve();
          } else {
            const vimeoScript = script({ src: 'https://player.vimeo.com/api/player.js' });
            vimeoScript.onload = resolve;
            document.head.appendChild(vimeoScript);
          }
        });
      }

      // Build the gallery using only valid image/video links
      gallery = div({ class: 'gallery' },
        div({ class: 'slides-wrapper' },
          div({ class: 'slides' },
            ...validResourceLinks.map((link, index) => {
              if (link.teaserVideo) {
                // Video slide
                const videoId = link.teaserVideo.split('/').pop();
                return div({ class: `video slide ${index === 0 ? 'active' : ''}` },
                  div({ class: 'vimeo-player', 'data-vimeo-id': videoId }),
                  div({ class: 'play-btn' }),
                  img({ src: API_HOST + link.teaserVideoThumbnail, alt: 'video thumbnail' }),
                );
              }
              // Image slide
              return div({ class: `image slide ${index === 0 ? 'active' : ''}` },
                img({ src: API_HOST + link.resourceLink, alt: 'product image' }),
              );
            }),
          ),
          div({ class: 'slide-nav' },
            ...validResourceLinks.map((link, index) => div({ class: `thumb ${index === 0 ? 'active' : ''}` },
              img({ src: API_HOST + (link.teaserVideoThumbnail || link.resourceLink), alt: 'thumb image' }),
            )),
          ),
        ),
      );
    } else {
      // No valid images: do not render the gallery
      gallery = '';
    }
  }

  // render page content (mobile or desktop)
  let cleanupHeader = null;
  function renderPageContent() {
    // cleanup previous header if it exists
    if (cleanupHeader) cleanupHeader();

    let $page = '';
    let $productHeader = '';

    if (window.matchMedia('(max-width: 1024px)').matches) {
      /*
        MOBILE VIEW
      */
      $productHeader = div({ class: 'product-header' },
        div({ class: 'content mobile-view' },
          h1(product.heading),
          div({ class: 'type' }, strong('Product Type: '), product.productType),
          div({ class: 'cta-links' },
            a({ class: 'view-all', href: '#technical-documents' }, 'View All Documents'),
          ),
          div({ class: 'cta-buttons' },
            a({ class: 'button add-sample-btn' }, 'Add Sample'),
            a({ class: 'button secondary', href: `/${region}/${locale}/modals/contact-us-modal-pdp` }, translate('contact-us')),
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
      cleanupHeader = updateFixedHeader($productHeader);

      $page = div({ class: 'section  mobile-view' },
        div({ class: 'default-content-wrapper' },
          div({ class: 'product-content' },
            $productHeader,
            gallery !== '' ? gallery : null,
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
            productDocs.technicalDocuments?.length > 0 ? div({ class: 'table-wrapper mobile-view' },
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
                ),
                ),
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
                ),
                ),
              ),
            ) : null,
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
      /*
        DESKTOP VIEW
      */
      $productHeader = div({ class: 'product-header' },
        div({ class: 'content' },
          h1(product.heading),
          product.productType ? div({ class: 'type' }, strong('Product Type: '), product.productType) : null,
          div({ class: 'cta-links' },
            a({ class: 'view-all', href: '#technical-documents' }, 'View All Documents'),
            a({ class: 'download-all', href: API_PRODUCT.DOWNLOAD_ALL_DOCUMENTS(region, product.productName, product.productId) }, 'Download All Documents'),
          ),
          div({ class: 'cta-buttons' },
            a({ class: 'button add-sample-btn' }, 'Add Sample'),
            a({ class: 'button secondary', href: `/${region}/${locale}/modals/contact-us-modal-pdp` }, translate('contact-us')),
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
      cleanupHeader = updateFixedHeader($productHeader);

      $page = div({ class: 'section' },
        div({ class: 'default-content-wrapper' },
          div({ class: 'product-content' },
            div({ class: 'left-column' },
              $productHeader,
              description,
            ),
            gallery && div({ class: 'right-column' }, gallery),
          ),

          // Technical Documents Table
          productDocs.technicalDocuments?.length > 0 ? div({ class: 'table-wrapper' },
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
      const downloadSelectedDocuments = ($button) => {
        const { docType } = $button.dataset;
        const selectedIds = Array.from($button.closest('.table-wrapper').querySelectorAll('input[type="checkbox"]:checked'))
          .map((cb) => cb.dataset.docId)
          .join(',');

        if (!selectedIds) return;

        const downloadUrl = `${API_PRODUCT.DOWNLOAD_DOCUMENTS(region, product.productName)}?productId=${product.productId}&documentType=${docType}&assetId=${selectedIds}`;

        // Use a temp link for reliability across browsers
        const tempLink = a({ href: downloadUrl, download: `${docType}-documents.zip`, style: 'display: none' });
        document.body.appendChild(tempLink);
        tempLink.click();
        tempLink.remove();
      };

      document.querySelectorAll('.download-wrapper .button').forEach(($button) => {
        $button.addEventListener('click', () => downloadSelectedDocuments($button));
      });
    } // end desktop view

    // add sample button (both mobile and desktop)
    const addSampleBtns = document.querySelectorAll('.add-sample-btn');
    addSampleBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        addIngredientToCart(productName, window.location.href);
      });
    });

    // After creating new header
    cleanupHeader = updateFixedHeader($productHeader);
  }

  // render page
  renderPageContent();

  // Debounce resize handler to prevent too many updates
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(renderPageContent, 100);
  });

  // Gallery & Video Handling
  if (product.resourceLinks) {
    const thumbs = document.querySelectorAll('.gallery .slide-nav .thumb');
    thumbs.forEach((thumb, index) => {
      thumb.addEventListener('click', () => {
        // ignore if thumb is already active
        if (thumb.classList.contains('active')) return;

        const oldSelectedImage = document.querySelector('.gallery .slides .slide.active');
        const newSelectedImage = document.querySelector(`.gallery .slides .slide:nth-child(${index + 1})`);
        const slidesContainer = document.querySelector('.gallery .slides');

        // Reset any playing videos when switching
        document.querySelectorAll('.slide.playing').forEach((slide) => {
          slide.classList.remove('playing');
          if (slide._player) {
            slide._player.destroy();
            slide._player = null;
          }
        });

        thumbs.forEach((t) => { t.classList.remove('active'); });
        thumb.classList.add('active');

        if (oldSelectedImage && newSelectedImage) {
          newSelectedImage.classList.add('new');
          requestAnimationFrame(() => {
            newSelectedImage.classList.add('active');
            slidesContainer.style.aspectRatio = newSelectedImage.classList.contains('video') ? '16/9' : 'auto';
          });
          setTimeout(() => {
            newSelectedImage.classList.remove('new');
            oldSelectedImage.classList.remove('active');
          }, 400);
        }
      });
    });

    // play on click
    document.querySelectorAll('.play-btn').forEach((playBtn) => {
      playBtn.addEventListener('click', async (e) => {
        const slide = e.target.closest('.slide');
        if (!slide.classList.contains('playing')) {
          // Wait for Vimeo API to be ready
          if (typeof Vimeo === 'undefined') {
            await new Promise((resolve) => {
              const checkVimeo = setInterval(() => {
                if (typeof Vimeo !== 'undefined') {
                  clearInterval(checkVimeo);
                  resolve();
                }
              }, 100);
            });
          }

          slide.classList.add('playing');

          // Initialize Vimeo player only when clicked
          const playerElement = slide.querySelector('.vimeo-player');
          const videoId = playerElement.getAttribute('data-vimeo-id');

          if (!slide._player) {
            // eslint-disable-next-line no-undef
            slide._player = new Vimeo.Player(playerElement, {
              id: videoId,
              responsive: true,
              controls: true,
              title: false,
              byline: false,
              portrait: false,
              autoplay: true,
            });

            // Handle player errors
            slide._player.on('error', (error) => {
              console.error('Vimeo player error:', error);
              slide.classList.remove('playing');
              if (slide._player) {
                slide._player.destroy();
                slide._player = null;
              }
            });
          } else {
            slide._player.play();
          }
        }
      });
    });
  }
}
