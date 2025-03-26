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
import { createColorBlock, createIngredientBlock, createContactUs, getSocialShare, createCardsBlock } from './helper.js';
import { newsMap } from './mapping.js';

let title = '';
let description = '';
let image = '';
let eventType = '';
let duration = '';
let location = '';
let boothNumber = '';
let registrationLink = '';
let registrationEventSite = '';


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
        .replace(/[^a-z0-9/]/gm, '-');
    })(url);

    const main = document.body;
    createEventTemplate(document, main);
    createMetadata(main, document, path, html);
    resetVariables();

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
  const meta = {};  
  if (title) {
    meta.Title = title;
  }

  // description
  const desc = document.querySelector("[property='og:description']");
  if (desc) {
    meta.description = desc.content;
  }

  // image  
  if (image) {
    const el = document.createElement('img');
    el.src = image;
    meta.Image = el;
  }
  // page name
 meta['Event Type'] = eventType;
 meta['Duration'] = duration;
 meta['Location'] = location;
 meta['Booth Number'] = boothNumber;
 meta['Registration'] = registrationLink;
 meta['Registration event site'] = registrationEventSite;
 meta['Template'] = 'events';
 meta['keywords'] = '';
  const socialShare = getSocialShare(document);
  if (socialShare) meta['social-share'] = socialShare;
  else meta['social-share'] = '';
  const block = WebImporter.Blocks.getMetadataBlock(document, meta);
  main.append(block);
  return meta;
};

export function getMetadataProp(document, queryString) {
  let metaDataField;
  const metadata = document.querySelector(queryString);
  if (metadata) {
    metaDataField = metadata.textContent ? metadata.textContent : metadata.content;
    metadata.remove();
  }
  return metaDataField;
}

export function createEventTemplate(document, main) {
  const eventWrapper = document.querySelector('.event-detail__wrapper .event-detail__primary');
  const heading = eventWrapper.querySelector('.heading > h2');
  const labelText = eventWrapper.querySelector('.label-text');
  if (labelText) labelText.remove();
  if (heading) {
    title = heading.textContent;
    heading.remove();
  }
  const eventDetails = eventWrapper.querySelectorAll('.event-detail__details');
  eventDetails.forEach(detail => {
    if (detail.textContent.includes('Duration')) {
      duration = detail.textContent.split(':')[1].trim();
    } else if (detail.textContent.includes('Event Type')) {
      eventType = detail.textContent.split(':')[1].trim();
    } else if (detail.textContent.includes('Location')) {
      location = detail.textContent.split(':')[1].trim();
    } else if (detail.textContent.includes('Booth Number')) {
      boothNumber = detail.textContent.split(':')[1].trim();
    }
    detail.remove();
  });
  const rteBlock = eventWrapper.querySelector('.rte-block--large-body-text');
  const links = rteBlock.querySelectorAll('a');
  links.forEach(link => {
    if (link.textContent.includes('Register')) {
      registrationLink = link.href;
      link.remove();
    }
  });

  const eventImage = document.querySelector('.event-detail__wrapper .event-detail__media > picture > img'); 
  if (eventImage) {
    image = eventImage.src;
    eventImage.remove();
  }
  let registerEvent = document.querySelector('.event-detail__wrapper .register-event .event-detail__body > a') 
  ? document.querySelector('.event-detail__wrapper .register-event .event-detail__body > a') 
  : document.querySelector('.event-detail__wrapper .event-detail__body > a') ;
  if (registerEvent) {
    registrationEventSite = registerEvent.href;
    registerEvent.parentNode.remove();
  }
  if (registrationLink === '') {
    const secondaryCta  = document.querySelector('.event-detail__wrapper .register-event .register-event__text > a');
    if (secondaryCta) {
      registrationLink = secondaryCta.href;
      secondaryCta.parentNode.remove();
    }
  }
  
}

function resetVariables() {
  title = '';
  description = '';
  image = '';
  eventType = '';
  duration = '';
  location = '';
  boothNumber = '';
  registrationLink = '';
  registrationEventSite = '';
}