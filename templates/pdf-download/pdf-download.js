/* eslint-disable function-paren-newline, object-curly-newline */
import { div, h3, a, table, tr, th, td, label, input, span, h1, p } from '../../scripts/dom-helpers.js';

export default async function decorate(doc) {
    const $main = doc.querySelector('main');
  // get product-ID query param from URL
  const productId = new URLSearchParams(window.location.search).get('product-id');

  // TODO: fix CORS issue
  // get the response from the API
  const response = await fetch(`https://www.ingredion.com/content/ingredion-com/na/en-us/search/jcr:content/searchResults.view.json?productId=${productId}`);
  const productData = await response.json();


const $page = div({ class: 'section' }, 
    div({ class: 'default-content-wrapper' },
        // header
        div({ class: 'product-header' },
            div({ class: 'content' },
                h1('N-HANCE® 59 - 07730402'),
                div({ class: 'cta-links' },
                    a({ class: 'view-all', href: '#documents' }, 'View All Documents'),
                    a({ class: 'download-all', href: `https://www.ingredion.com/content/ingredion-com/ingredients/na/nhance-59-07730402/_jcr_content.download.zip?productId=${productId}&documentType=all` }, 'Download All Documents')
                ),
                div({ class: 'buttons' },
                    a({ class: 'button' }, 'Add Sample'),
                    a({ class: 'button secondary', href: '#' }, 'Contact Us'),
                ), 
            ),
            div({ class: 'anchor-links' },
                a({ href: '#technical-documents' }, 'Technical Documents'),
                a({ href: '#sds-documents' }, 'SDS Documents')
            )          
        ),

        p('N-HANCE® 59 functional native starch is a high viscosity potato-based starch that is recommended for low temperature and low shear food processing. Functional native starches are made with a revolutionary technology that gives properties similar to modified starches while meeting clean labeling criteria. This product is produced under Ingredion Incorporated\'s TRUETRACE® Identity Preserved Program for non-GM products.'),
        
        // Technical Documents Table
        div({ class: 'table-wrapper', id: 'technical-documents' },
            h3('Technical Documents'),
            table(
                tr(
                    th(a({ class: 'select-all' }, 'Select All')),
                    th('Document Type'),
                    th('Format'),
                    th('Size')
                ),
                ...productData.technicalDocuments.map(techDoc =>
                    tr(
                        td(label({ class: 'checkbox' }, input({ type: 'checkbox', 'data-doc-id': techDoc.id }))),
                        td(a({ class: 'doc', href: techDoc.path }, techDoc.documentType)),
                        td(techDoc.format),
                        td(techDoc.size)
                    ),
                ),
            ),
            div({ class: 'download-wrapper' }, a({ class: 'button' }, 'Download Documents')),
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
                ...productData.sdsDocuments.map(sdsDoc =>
                    tr(
                        td(label({ class: 'checkbox' }, input({ type: 'checkbox', 'data-doc-id': sdsDoc.id }))),
                        td(a({ class: 'doc', href: sdsDoc.path }, sdsDoc.locale.region)),
                        td(sdsDoc.locale.language),
                        td(sdsDoc.size),
                    )
                ),
            ),
            div({ class: 'download-wrapper' }, a({ class: 'button' }, 'Download Documents')),
        ),
    )
);

  // Clear and append both tables

  $main.append($page);

  // Add Select All functionality for both tables
  document.querySelectorAll('.select-all').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const table = e.target.closest('table');
      const checkboxes = table.querySelectorAll('input[type="checkbox"]');
      const allChecked = Array.from(checkboxes).every(cb => cb.checked);
      checkboxes.forEach(cb => {
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
}
