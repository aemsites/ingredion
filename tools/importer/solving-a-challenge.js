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

import { createCalloutBlock, createCardsBlock, createVideoBlock, getSocialShare, createAnchorBlock, createCarouselBlock, createHeroBlock, createIngredientBlock,
  createForm, createTableBlock,
} from './helper.js';

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
    const isFormulationTemplate = document.querySelector('.formulation-page') ? true : false;
    if (isFormulationTemplate) {
      createFormulationTemplate(document, main);
    } else {
      getSocialShare(document, main);
      createHeroBlock(document, main);
      createCalloutBlock(document, main);    
      createCardsBlock(document, main);    
      createVideoBlock(document, main);  
      createCarouselBlock(document, main);
      createTableBlock(document, main);
      createAnchorBlock(document, main);
      createIngredientBlock(document, main);
      createForm(document, main);      
    }
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
      '.dynamic-form',      
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
  const teaserTitle = getMetadataProp(document, '.heading > h1', false);
  if (teaserTitle) meta['teaser-title'] = teaserTitle;
  const teaserDescription = getMetadataProp(document, '.rte-block--large-body-text', false);
  if (teaserDescription) meta['teaser-description'] = teaserDescription;
  const dateCategory = getMetadataProp(document, '.date-category-tags');
  if (dateCategory) {
    meta['published-date'] = dateCategory.split('|')[0].trim();
    meta['categories'] = dateCategory.split('|')[1] ? dateCategory.split('|')[1].trim() : '';
  }
  const type = getMetadataProp(document, '.category-label');
  if (type && type !== undefined) meta['type'] = type;
  const socialShare = getSocialShare(document);
  if (socialShare) meta['social-share'] = socialShare;
  meta['keywords'] = '';
  meta['template'] = 'formulation';
  const block = WebImporter.Blocks.getMetadataBlock(document, meta);
  main.append(block);
  return meta;
};

export function getMetadataProp(document, queryString, remove = true) {
  const metadata = document.querySelector(queryString);
  if (!metadata) return;
  
  const value = metadata.textContent ? metadata.textContent.replace(/[\n\t]/gm, '') : metadata.content;
  if (remove) metadata.remove();
  return value;
}

function getPageName(document) {
  const breadcrumbElement = document.querySelector('.breadcrumbs > ul > li:last-of-type > a');
  if (!breadcrumbElement) return '';
  else return breadcrumbElement.textContent;
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

function createFormulationTemplate(document, main) {
  const formulationPage = document.querySelector('.formulation-page');
  const formulationHeader = formulationPage.querySelector('.formulation-header .formulation-header__wrapper');
  const slim_header = formulationPage.querySelector('.formulation-header .slim-header');
  slim_header.remove();
  createGalleryBlock(formulationHeader);
  const formulationInstructions = formulationPage.querySelector('.formulation-header .ingredientListingTable');
  createFormulationInstructions(formulationInstructions);
  createIngredientBlock(document, main, true);
}

function createGalleryBlock(formulationHeader) {
  // Create gallery table cells
  const cells = [['Gallery']];

  // Build image div
  const imageDiv = document.createElement('div');
  formulationHeader.querySelectorAll('.formulation-header__image .image-slider .image-slider__slider .image-slider__thumbnail > img')
    .forEach(image => {
      const img = document.createElement('img');
      img.src = image.src;
      imageDiv.append(img);
    });

  // Build text div
  const galleryText = formulationHeader.querySelector('.formulation-header__text');
  const galleryTextDiv = document.createElement('div');

  // Add headings
  galleryTextDiv.append(galleryText.querySelector('h3'));
  galleryTextDiv.append(galleryText.querySelector('h1'));

  // Add ingredients section
  const ingredients = galleryText.querySelector('.formulation-header__ingredients');
  const p = document.createElement('p');
  p.textContent = `${ingredients.textContent.split(':')[0].trim()}: `;
  galleryTextDiv.append(p);

  // Add ingredient links
  ingredients.querySelectorAll('a').forEach(href => {
    const innerDiv = document.createElement('div');
    const a = document.createElement('a');
    a.href = href.href;
    a.textContent = href.textContent + ' [class: text-link]' ;
    innerDiv.append(a);
    p.append(innerDiv);
  });

  // Add CTA
  const cta = galleryText.querySelector('.formulation-header__cta > a');
  cta.href = 'https://main--ingredion--aemsites.aem.live/na/en-us/modals/contact-us-modal';
  galleryTextDiv.append(cta);

  // Build final gallery block
  cells.push([galleryTextDiv.outerHTML, , imageDiv.outerHTML]);
  const galleryDiv = document.createElement('div');
  const gallery = WebImporter.DOMUtils.createTable(cells, document);
  
  const ptag = document.createElement('p');
  ptag.textContent = '---';
  galleryDiv.append(gallery, ptag);

  formulationHeader.replaceWith(galleryDiv);
}

function createFormulationInstructions(instructions) {
  // Create main container div
  const formulationInstructionsDiv = document.createElement('div');

  // Add description section
  const description = instructions.querySelector('.section .section__content .section-title-description-wrapper .heading > h2');
  formulationInstructionsDiv.append(description);

  // Add section metadata for instructions
  const section = [['Section Metadata']];
  section.push(['Style', 'instructions-section']);
  const instructionsSection = WebImporter.DOMUtils.createTable(section, document);
  formulationInstructionsDiv.append(instructionsSection);
  formulationInstructionsDiv.append(pTag());

  // Create formula section
  const formaulationTable = instructions.querySelector(
    '.section .section__content .ingredients-table .ingredients-table__wrapper .ingredients-table__contentWrapper > div:first-of-type'
  );
  const formulaDiv = document.createElement('div');

  // Add formula heading
  const formulaHeading = formaulationTable.querySelector('.heading > h3');
  formulaDiv.append(formulaHeading);

  // Add formula table
  const formulaTable = formaulationTable.querySelector('.ingredients-table__table > table');
  const formulaTableBlock = createFormulationTable(formulaTable, 'formula');
  formulaDiv.append(formulaTableBlock);

  // Add left column metadata
  const leftSection = [['Section Metadata']];
  leftSection.push(['Style', 'column-left ']);
  const leftSectionTable = WebImporter.DOMUtils.createTable(leftSection, document);
  formulaDiv.append(leftSectionTable);
  formulaDiv.append(pTag());

  // Add preparation section
  const prepTable = instructions.querySelector('.ingredients-table__wrapper .ingredients-table__contentWrapper .ingredients-table__preparations');
  const prepHeading = prepTable.querySelector('.heading > h3');
  formulaDiv.append(prepHeading);

  // Add ordered lists
  const ols = prepTable.querySelectorAll('.rte-block > ol');
  const guidelineText = prepTable.querySelector('.rte-block > h2');
  
  ols.forEach((ol, count) => {
    const rightTable = [['Table(List)']];
    const lis = ol.querySelectorAll('li');
    
    lis.forEach((li, index) => {
      rightTable.push([`${index + 1}. ${li.textContent}`]);
    });
    
    const rightTableBlock = WebImporter.DOMUtils.createTable(rightTable, document);
    formulaDiv.append(rightTableBlock);
    
    if (count < ols.length - 1) {
      formulaDiv.append(guidelineText);
    }
  });

  // Add right column metadata  
  const rightSection = [['Section Metadata']];
  rightSection.push(['Style', 'column-right ']);
  const rightSectionTable = WebImporter.DOMUtils.createTable(rightSection, document);
  formulaDiv.append(rightSectionTable);
  formulaDiv.append(pTag());

  // Combine and replace
  formulationInstructionsDiv.append(formulaDiv);
  instructions.replaceWith(formulationInstructionsDiv);
}

function pTag() {
  const ptag = document.createElement('p');
  ptag.textContent = '---';
  return ptag;
}

function createFormulationTable(tableParent, blockOption) {
  const cells = [[`Table(${blockOption})`]];
  const th = tableParent.querySelectorAll('thead > tr > th');
  const tr = tableParent.querySelectorAll('tbody > tr');
  const tfoot = tableParent.querySelectorAll('tfoot > tr');
  const headingArray = [];
  th.forEach((heading) => {
    headingArray.push(heading.textContent);
  });
  cells.push(headingArray);
  
  tr.forEach((row) => {
    const rowArray = [];
    const td = row.querySelectorAll('td');
    td.forEach((cell) => {
      rowArray.push(cell.textContent);
    });
    cells.push(rowArray);
  });
  tfoot.forEach((row) => {
    const rowArray = [];
    const td = row.querySelectorAll('td');
    td.forEach((cell) => {
      rowArray.push(cell.textContent);
    });
    cells.push(rowArray);
  });
  const table = WebImporter.DOMUtils.createTable(cells, document);
  return table;
}