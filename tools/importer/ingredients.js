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
  createForm, createTableBlock, sanitizeMetaTags,
  addTagsKeywords,
} from './helper.js';

import { newsMap } from './mapping.js';

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
    const path = ((u) => {
      let p = new URL(u).pathname;
      if (p.endsWith('/')) {
        p = `${p}index`;
      }
      return decodeURIComponent(p)
        .toLowerCase()
        .replace(/\.html$/, '')
        .replace(/[^a-zA-Z0-9/]/gm, '-');
    })(url);

    // define the main element: the one that will be transformed to Markdown
    const main = document.body;
    getSocialShare(document, main);
    createHeroBlock(document, main);
    createCalloutBlock(document, main);    
    createCardsBlock(document, main);    
    createVideoBlock(document, main);  
    createCarouselBlock(document, main);
    createTableBlock(document, main);
    createAnchorBlock(document, main);
    createIngredientBlock(document, main);
    createForm(document, main, path);
    createMetadata(main, document, path, html);
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
  const teaserTitle = getMetadataProp(document, '.heading > h1');
  if (teaserTitle) meta['teaser-title'] = teaserTitle;
  const teaserDescription = getMetadataProp(document, '.rte-block--large-body-text');
  if (teaserDescription) meta['teaser-description'] = teaserDescription;
  const dateCategory = getMetadataProp(document, '.date-category-tags');
  if (dateCategory) {
    meta['published-date'] = dateCategory.split('|')[0].trim();
    meta['categories'] = dateCategory.split('|')[1] ? dateCategory.split('|')[1].trim() : '';
  }
  meta.category = 'ingredients-page';
  const type = getMetadataProp(document, '.category-label');
  if (type && type !== undefined) meta['type'] = type;
  const socialShare = getSocialShare(document);
  if (socialShare) meta['social-share'] = socialShare;
  const caseInsensitiveUrl = Array.from(newsMap.keys()).find(key => key.replace('_','-').toLowerCase() === url.toLowerCase());
  if (caseInsensitiveUrl) {
    const sanitizedTags = addTagsKeywords(newsMap.get(caseInsensitiveUrl));console.log(sanitizedTags);
    if (sanitizedTags[0].length > 0) meta['tags'] = sanitizedTags[0].join(', ');
    if (sanitizedTags[1].length > 0) meta['keywords'] = sanitizedTags[1].join(', ');
  } else {
    meta['tags'] = '';
    meta['keywords'] = '';
  }  
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