/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/* global WebImporter */
/* eslint-disable no-console, class-methods-use-this */


export default {
  /**
   * Apply DOM operations to the provided document and return
   * the root element to be then transformed to Markdown.
   * @param {HTMLDocument} document The document
   * @param {string} url The url of the page imported
   * @param {string} html The raw html (the document is cleaned up during preprocessing)
   * @param {object} params Object containing some parameters given by the import process.
   * @returns {HTMLElement} The root element to be transformed
   */
  transform: ({
    // eslint-disable-next-line no-unused-vars
    document, url, html, params,
  }) => {
    // define the main element: the one that will be transformed to Markdown
    const main = document.body;
    createColorBlock(document, main);
    createIngredientBlock(document, main);
    createContactUs(main, document);
    createMetadata(main, document, url, html);

    // attempt to remove non-content elements
    WebImporter.DOMUtils.remove(main, [
      'header',
      '.header',
      'nav',
      '.nav',
      'footer',
      '.footer',
      'iframe',
      'noscript',
      '.popup',
    ]);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
    WebImporter.rules.convertIcons(main, document);


    const path = ((u) => {
      let p = new URL(u).pathname;
      if (p.endsWith('/')) {
        p = `${p}index`;
      }
      return decodeURIComponent(p)
        .toLowerCase()
        .replace(/\.html$/, '')
        .replace(/[^a-z0-9/]/gm, '-');
    })(url);

    return [{
      element: main,
      path,
    }];
  },
};



const createMetadata = (main, document, url, html) => {
  //const meta = updateCommonMetadata(document, url, html);
  const meta = {};
  // Create Metadata Block
  const title = document.querySelector('title');
  if (title) {
    meta.Title = title.textContent.replace(/[\n\t]/gm, '');
  }

  // description
  const desc = document.querySelector("[property='og:description']");
  if (desc) {
    meta.description = desc.content;
  }

  // image
  const img = document.querySelector("[property='og:image']");
  if (img && img.content) {
    const el = document.createElement('img');
    el.src = img.content;
    meta.Image = el;
  }
  // page name
  meta['Page Name'] = getPageName(document);
  const teaserTitle = getMetadataProp(document, '.heading > h2');
  if (teaserTitle) meta['teaser-title'] = teaserTitle;
  const teaserDescription = getMetadataProp(document, '.rte-block--large-body-text');
  if (teaserDescription) meta['teaser-description'] = teaserDescription;
  const dateCategory = getMetadataProp(document, '.date-category-tags');
  if (dateCategory) {
    meta['published-date'] = dateCategory.split('|')[0].trim();
    meta['categories'] = dateCategory.split('|')[1] ? dateCategory.split('|')[1].trim() : '';
  }
  meta['type'] = getMetadataProp(document, '.category-label');
  const socialShare = getSocialShare(document);
  if (socialShare) meta['social-share'] = socialShare;
  const block = WebImporter.Blocks.getMetadataBlock(document, meta);
  main.append(block);
  return meta;
};

export function getMetadataProp(document, queryString) {
  let metaDataField;
  const metadata = document.querySelector(queryString);
  if (metadata) {
    metaDataField = metadata.textContent ? metadata.textContent.replace(/[\n\t]/gm, '') : metadata.content;
    metadata.remove();
  }
  return metaDataField;
}

function createIngredientBlock(document, main) {
  const relatedIngredients = document.querySelector('.relatedIngredients');
  if (!relatedIngredients) return;
  const resultProdCards = document.querySelectorAll('.result-prod-card');
  if (!resultProdCards) {
    const cells = [['related ingredient']];
    const heading = relatedIngredients.querySelector('.heading > h2').textContent;
    const subHeading = relatedIngredients.querySelector('.rte-block').textContent;
    cells.push([heading,]);
    cells.push([subHeading,]);
    const table = WebImporter.DOMUtils.createTable(cells, document);
    main.append(table);
  } else {
    resultProdCards.forEach((resultProdCard) => {
      const cells = [['related ingredient']];
      const heading = resultProdCard.querySelector('.product-name').textContent;
      const h3 = resultProdCard.querySelector('.rte-block > h3');
      const subHeading = h3 ? h3.textContent : '';
      const pTag = resultProdCard.querySelector('.rte-block > p');
      const description = pTag ? pTag.textContent : '';
      const ctas = resultProdCard.querySelectorAll('.cta-icon');
      let ctaAnchor = ''
      ctas.forEach((cta) => {
        ctaAnchor += `<a href = '${cta.getAttribute('href')}'>${cta.innerText}</a>`;
      });
      const leftSide = `<h4>${heading}</h4><h3>${subHeading}</h3><p>${description}</p>${ctaAnchor}`;
      const resultCardButtons = document.querySelector('.result-card__buttons');
      const buttons = resultCardButtons.querySelectorAll('a');
      let rightSide = '';
      buttons.forEach((button) => {
        rightSide += `<a href = '${button.getAttribute('href')}'>${button.innerText}</a><br>`;
      });
      cells.push([leftSide,]);
      cells.push([rightSide,]);
      const table = WebImporter.DOMUtils.createTable(cells, document);
      main.append(table);
    });
  }
  relatedIngredients.remove();
  return;
}

function createContactUs(main, document) {
  const contactUs = document.querySelector('.contact-banner__wrapper');
  if (contactUs) {
    const heading = contactUs.querySelector('.heading > h3').textContent;
    let contactDetailsHeading = contactUs.querySelector('.contact-banner__primary .heading > h4') ?
      contactUs.querySelector('.contact-banner__primary .heading > h4').textContent : null;
    let contactDetails = contactUs.querySelector('.rte-block').textContent;
    if (!contactDetailsHeading) {
      contactDetailsHeading = contactUs.querySelector('.contact-banner__primary').textContent;
      contactDetails = contactUs.querySelector('.contact-banner__secondary').textContent;
    }

    const cells = [['contact us']];
    cells.push([heading,]);
    cells.push([contactDetailsHeading,]);
    cells.push([contactDetails,]);
    const contactUsBlock = WebImporter.DOMUtils.createTable(cells, document);
    main.append(contactUsBlock);
    contactUs.remove();
  }
}

function getPageName(document) {
  const breadcrumbElement = document.querySelector('.breadcrumbs > ul > li:last-of-type > a');
  if (!breadcrumbElement) return '';
  else return breadcrumbElement.textContent;
}

function getSocialShare(document) {
  const socialShare = document.querySelector('.social-share');
  const socialMetaProp = [];
  const facebook = socialShare.querySelector('.icon-Facebook');
  if (facebook) {
    socialMetaProp.push('facebook');
  }
  const twitter = socialShare.querySelector('.icon-Twitter');
  if (twitter) {
    socialMetaProp.push('X');
  }
  if (socialMetaProp.length === 0) return;
  else return socialMetaProp.join(', ');
}

function createColorBlock(document) {
  const colorBlocks = document.querySelectorAll('.colorBlockQuote');
  colorBlocks.forEach((colorBlock) => {
    const colorBlockQuote = colorBlock.querySelector('.colorblock-quote');
    if (!colorBlockQuote) return;
    const color = toHex(colorBlockQuote.style.backgroundColor); console.log(color);
    const cells = [[`colorblock(${color}) `]];
    const heading = colorBlockQuote.querySelector('.heading > h1').textContent;
    cells.push([heading]);
    const subHeading = colorBlockQuote.querySelector('.heading > h3');
    if (subHeading) cells.push([subHeading.textContent,]);
    const label = colorBlockQuote.querySelector('.label-text');
    if (label) cells.push([label.textContent,]);
    const table = WebImporter.DOMUtils.createTable(cells, document);
    colorBlock.append(table);
    colorBlockQuote.remove();
  });
}

function toHex(rgb) {

  // Grab the numbers
  const match = rgb.match(/\d+/g);

  // `map` over each number and return its hex
  // equivalent making sure to `join` the array up
  // and attaching a `#` to the beginning of the string 
  return `#${match.map(color => {
    const hex = Number(color).toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
  }).join('')}`;
}