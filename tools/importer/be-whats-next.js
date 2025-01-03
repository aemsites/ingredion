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

const colorMapping = new Map([
  ['#0073d8', 'blue'],
  ['#273691', 'dark-blue'],
  ['#006a71', 'teal'],
  ['#6cb33e', 'green'],
  ['#4f6e18', 'dark-green'],
  ['#ffe115', 'yellow'],
  ['#c5aa2e', 'mustard'],
  ['#ff7017', 'orange'],
  ['#db2807', 'red'],
  ['#6266b9', 'lilac'],
  ['#b41f75', 'purple'],
  ['#6a0c5f', 'dark-purple'],
  ['#ffffff', 'transparent']
]);

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
    createCalloutBlock(document, main);
    createCardsBlock(document, main);
    createVideoBlock(document, main);
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

function createCalloutBlock(document, main) {
  let callOutBlocks = document.querySelectorAll('.colorblock-img-text__wrapper');
  let calloutImg = '';
  let backgroundColor = '';
  let heading = '';
  let rteText = '';
  let ctalink = ''; 
  callOutBlocks.forEach((callOut) => {
    let imageLeft;
    [...callOut.children].forEach((child, index) => {
      if (child.classList.contains('colorblock-img-text__image')) {
        const image = child.querySelector('picture > img');
        calloutImg = document.createElement('img');
        calloutImg.src = image.src;
        if (callOut.classList.contains('colorblock-img-text--imgRight')) imageLeft = false;
        else imageLeft = true;
      } else if (child.classList.contains('colorblock-img-text__text')) {
        backgroundColor = colorMapping.get(toHex(child.style.backgroundColor).toLowerCase());
        heading = child.querySelector('.colorblock-img-text__text--wrapper .heading > h3').textContent;
        rteText = child.querySelector('.colorblock-img-text__text--wrapper .rte-block');
        if (rteText) {
          rteText = rteText.innerHTML;
        }
        ctalink = child.querySelector('.colorblock-img-text__text--wrapper .secondary-cta-link') ? 
          child.querySelector('.colorblock-img-text__text--wrapper .secondary-cta-link').outerHTML : '';
        if (ctalink === '') {
          ctalink = child.querySelector('.colorblock-img-text__text--wrapper .primary-cta') ? 
            child.querySelector('.colorblock-img-text__text--wrapper .primary-cta').outerHTML : '';
        }
      }
      child.remove();
    });
    const cells = backgroundColor === '' ? [['Callout']] : [[`Callout (${backgroundColor})`]];
    if (imageLeft) cells.push([calloutImg, `<h3>${heading}</h3> ${rteText} ${ctalink}`]);
    else cells.push([`<h3>${heading}</h3> ${rteText} ${ctalink}`, calloutImg]);
    const callOutBlock = WebImporter.DOMUtils.createTable(cells, document); 
    callOut.appendChild(callOutBlock);    
  });
  callOutBlocks = document.querySelectorAll('.colorblock-text-cta__wrapper');
  callOutBlocks.forEach((callOut) => {
    [...callOut.children].forEach((child) => {
      if (child.classList.contains('colorblock-text-cta__text')) {
        heading = child.querySelector('.heading > h3').textContent;
        rteText = child.querySelector('.rte-block');
        if (rteText) {
          rteText = rteText.innerHTML;
        }
      } else if (child.classList.contains('secondary-cta-link')) {
        ctalink = child.outerHTML;
      }
      child.remove();
    });
    const cells = [['Callout']];
    cells.push([`<h3>${heading}</h3> ${rteText} ${ctalink}`]);
    const callOutBlock = WebImporter.DOMUtils.createTable(cells, document); 
    callOut.replaceWith(callOutBlock);    
  });
}

function createCardsBlock(document, main) {
  let cardsBlocks = document.querySelectorAll('.section__content--columns-3');
  cardsBlocks.forEach((cardsBlock) => {
    const cells = [['Cards']];
    const cards = cardsBlock.querySelectorAll('.content-card');
    let cardsList = [];
    cards.forEach((card, index) => {    
      let cardImg = card.querySelector('.content-card__image > a > picture') ? card.querySelector('.content-card__image > a > picture') : card.querySelector('.content-card__image > picture');
      if (cardImg) cardImg = cardImg.outerHTML;
      else cardImg = '';
      const cardHeading = card.querySelector('.content-card__text .heading > h3') ? card.querySelector('.content-card__text .heading > h3').textContent : '';
      const cardText = card.querySelector('.content-card__text .rte-block') ? card.querySelector('.content-card__text .rte-block').textContent : '';
      const cardLink = card.querySelector('.content-card__text > a') ? card.querySelector('.content-card__text > a').outerHTML : '';
      cardsList.push(`${cardImg} <h3>${cardHeading}<h3> ${cardText} ${cardLink}`);
      if (index === cards.length - 1) {
        for (let i = 0; i < cardsList.length; i += 3) {
          if (cardsList[i + 2] === undefined) cells.push([cardsList[i], cardsList[i + 1]]);
          else if (cardsList[i + 1] === undefined) cells.push([cardsList[i]]);
          else cells.push([cardsList[i], cardsList[i + 1], cardsList[i + 2]]);          
        }
      }      
    });
    const cardsTable = WebImporter.DOMUtils.createTable(cells, document);
    cardsBlock.replaceWith(cardsTable);
  });
  cardsBlocks = document.querySelectorAll('.card-slider__wrapper');
  cardsBlocks.forEach((cardsBlock) => {
    const cells = [['Cards(slim)']];
    const cards = cardsBlock.querySelectorAll('.card');    
    cards.forEach((card, index) => {      
      const cardImg = card.querySelector('.card__image > picture').outerHTML;
      const cardHeading = card.querySelector('.card__text .heading > h4').textContent;
      const cardText = card.querySelector('.card__text .rte-block').textContent;
      const cardLinkText = card.querySelector('.card__text .secondary-cta');
      let cardLink = document.createElement('a');
      cardLink.href = cardLinkText.parentElement.href;
      cardLink.textContent = cardLinkText.textContent;
      cells.push([`${cardImg} ${cardHeading} ${cardText} ${cardLink.outerHTML}`]);      
    });
    const cardsTable = WebImporter.DOMUtils.createTable(cells, document);
    cardsBlock.replaceWith(cardsTable);
  });
  cardsBlocks = document.querySelectorAll('.section__content--columns-2');
  cardsBlocks.forEach((cardsBlock) => {
    const cells = [['Cards']];
    const cards = cardsBlock.querySelectorAll('.content-card');
    let cardsList = [];
    cards.forEach((card, index) => {    
      let cardImg = card.querySelector('.content-card__image > a > picture') ? card.querySelector('.content-card__image > a > picture') : card.querySelector('.content-card__image > picture');
      if (cardImg) cardImg = cardImg.outerHTML;
      else cardImg = '';
      const cardHeading = card.querySelector('.content-card__text .heading > h3') ? card.querySelector('.content-card__text .heading > h3').textContent : '';
      const cardText = card.querySelector('.content-card__text .rte-block') ? card.querySelector('.content-card__text .rte-block').textContent : '';
      const cardLink = card.querySelector('.content-card__text > a') ? card.querySelector('.content-card__text > a').outerHTML : '';
      cardsList.push(`${cardImg} <h3>${cardHeading}<h3> ${cardText} ${cardLink}`);
      if (index === cards.length - 1) {
        for (let i = 0; i < cardsList.length; i += 2) {
          if (cardsList[i + 1] === undefined) cells.push([cardsList[i]]);
          else cells.push([cardsList[i], cardsList[i + 1]]);          
        }
      }      
    });
    const cardsTable = WebImporter.DOMUtils.createTable(cells, document);
    cardsBlock.replaceWith(cardsTable);
  });

  cardsBlocks = document.querySelectorAll('.fourColumnTeaserGrid .section__content');
  cardsBlocks.forEach((cardsBlock) => {
    const cells = [['Cards(4-column-teaser)']];
    const cards = cardsBlock.querySelectorAll('.link-card');
    let cardsList = [];
    cards.forEach((card, index) => {    
      let cardImg = card.querySelector('picture');
      card.removeChild(cardImg.parentElement);
      if (cardImg) cardImg = cardImg.outerHTML;
      else cardImg = '';      
      cardsList.push(`${cardImg} <a href='${card.href}'>${card.textContent}</a>`);
      if (index === cards.length - 1) {
        for (let i = 0; i < cardsList.length; i += 4) {
          if (cardsList[i + 1] === undefined) cells.push([cardsList[i]]);
          else if (cardsList[i + 2] === undefined) cells.push([cardsList[i], cardsList[i + 1]]);
          else if (cardsList[i + 3] === undefined) cells.push([cardsList[i], cardsList[i + 1], cardsList[i + 2]]);
          else cells.push([cardsList[i], cardsList[i + 1], cardsList[i + 2], cardsList[i + 3]]);                
        }
      }
    });
    const cardsTable = WebImporter.DOMUtils.createTable(cells, document);
    cardsBlock.replaceWith(cardsTable);
  });
}

function createVideoBlock(document, main) {
  let videoBlocks = document.querySelectorAll('.video-banner');
  videoBlocks.forEach((videoBlock) => {
    const cells = [['Video']];
    let videoURL = videoBlock.getAttribute('data-video-url');
    const picture = videoBlock.querySelector('.video-banner__wrapper > picture').outerHTML;
    const videoID = videoURL.split('/').at(-1);
    videoURL = `https://vimeo.com/${videoID}`;
    cells.push([`${picture} ${videoURL}`]);
    const videoTable = WebImporter.DOMUtils.createTable(cells, document);
    videoBlock.replaceWith(videoTable);
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