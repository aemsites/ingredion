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

import {
  createCalloutBlock,
  createCardsBlock, 
  createVideoBlock,
  getSocialShare,
  createAnchorBlock,
  createHeroBlock,
  addAuthorBio,
  createColorBlock,
  createIngredientBlock,
  createContactUs,
  createForm,
  createTableBlock,
  createCTAIconBlock,
  createCarouselBlock,
  sanitizeMetaTags,
  createArticleList,
  addKeywords,
  alignCenter,
  convertHrefs
} from './helper.js';

import { newsMap } from './mapping.js';
import { urlCategoryMap } from './keywords.js';

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
    
    const main = document.body;
    convertHrefs(main);
    createHeroBlock(document, main);
    alignCenter(document);
    //getSocialShare(document, main);    
    createCalloutBlock(document, main);
    createCardsBlock(document, main);
    createVideoBlock(document, main);
    createColorBlock(document, main);
    createIngredientBlock(document, main);
    createContactUs(main, document);
    createCarouselBlock(document, main);
    createForm(document, main, path);
    createTableBlock(document, main);
    //createAnchorBlock(document, main);
    createCTAIconBlock(document, main);
    createArticleList(document, main);
    addAuthorBio(document, main);
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
      '.embeddedServiceHelpButton',
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
  const template = document.querySelector('.blog-header');
  let isArticle = false;
  if (template) {
    meta.template = 'article-detail';
    isArticle = true;
  }
  // description
  const desc = document.querySelector("[property='og:description']");
  if (desc) {
    meta.description = desc.content;
  }

  // Set image metadata
  const ogImage = document.querySelector("[property='og:image']");
  if (ogImage?.content) {
    meta.Image = Object.assign(document.createElement('img'), {src: ogImage.content});
  }

  // Set page metadata
  meta['Page Name'] = getPageName(document);
  const category = url.split('/')[3];
  if (category) meta.category = category;  
  // Get teaser metadata
  
  const teaser = {
    title: getMetadataProp(document, '.heading:first-of-type > h2', isArticle),
    description: getMetadataProp(document, '.rte-block--large-body-text', isArticle)
  };
  if (teaser.title) meta['Title'] = teaser.title;
  if (teaser.description) meta['description'] = teaser.description;
  const caseInsensitiveUrl = Array.from(newsMap.keys()).find(key => key.toLowerCase() === url.toLowerCase());
  if (caseInsensitiveUrl) {
    const sanitizedTags = sanitizeMetaTags(newsMap.get(caseInsensitiveUrl));console.log(sanitizedTags);
    if (sanitizedTags[0].length > 0) meta['tags'] = sanitizedTags[0].join(', ');
    if (sanitizedTags[1].length > 0) meta['categories'] = sanitizedTags[1].join(', ');
  } else {
    meta['tags'] = '';
  }
  // Get date and category metadata
  const dateCategory = getMetadataProp(document, '.date-category-tags');
  if (dateCategory) {
    const [date, category = ''] = dateCategory.split('|').map(s => s.trim());
    meta['published-date'] = date;
    meta['categories'] = category;    
  }
  meta['keywords'] = addKeywords(url);
  // Get type and social metadata
  const type = getMetadataProp(document, '.category-label');
  meta.type = (type == null || type == undefined) ? '' : type;

  const socialShare = getSocialShare(document);
  if (socialShare) meta['social-share'] = socialShare;

  // Create and append metadata block
  main.append(WebImporter.Blocks.getMetadataBlock(document, meta));
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
  return '#' + rgb.match(/\d+/g)
    .map(n => Number(n).toString(16).padStart(2, '0'))
    .join('');
}