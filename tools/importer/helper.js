import { urlCategoryMap } from './keywords.js';
import { PDPMap } from './pdpMapping.js';
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
  ['#ffffff', ''],
  ['#68e0a1', 'teal']
]);

const sheet = new Map([
  ['be-whats-next' ,'be-whats-next'],
  ['events', 'news-events'],
  ['news', 'news'],
  ['resource-library', 'formulation']
])

const previewURL = 'https://main--ingredion--aemsites.aem.page';
const r = new RegExp('^(?:[a-z+]+:)?//', 'i');

export function createHeroBlock(document, main) {
  const hero = document.querySelector('.hero__wrapper');
  const blogHeader = document.querySelector('.blog-header');
  if (hero) {    
    const ptag = document.createElement('p');
    ptag.textContent = '---';
    hero.insertAdjacentElement('afterend', ptag);
    const breadcrumbs = WebImporter.DOMUtils.createTable([['Breadcrumbs']], document);
    hero.insertAdjacentElement('afterend', breadcrumbs);
    const anchorBlock = createAnchorBlock(document, main);
    if (anchorBlock) {
      console.log('anchorBlock found');
      hero.insertAdjacentElement('afterend', anchorBlock);
    }
    const cells = hero.classList.contains('hero--text-left') ? [['Hero(align-left)']] : [['Hero']];
    
    const image = hero.querySelector('.hero__image > picture').outerHTML;
    const heading = hero.querySelector('.hero__text .heading > h1') ? hero.querySelector('.hero__text .heading > h1').outerHTML : '';
    const subHeading = hero.querySelector('.hero__text .body-text') ? hero.querySelector('.hero__text .body-text').outerHTML : '';
    
    let cta = hero.querySelector('.hero__text .primary-cta') ? hero.querySelector('.hero__text .primary-cta') : '';
    if (cta !== '') {
      cta.href = testURL(cta.href);
      cta = cta.outerHTML;
    }
    
    cells.push([image]);
    cells.push([`${heading} ${subHeading} ${cta}`]);
    
    const heroTable = WebImporter.DOMUtils.createTable(cells, document);
    hero.replaceWith(heroTable);
  } else if (!blogHeader) {
    const breadcrumbs = WebImporter.DOMUtils.createTable([['Breadcrumbs']], document);    
    main.prepend(breadcrumbs);
  }
}

function pTag() {
  return document.createElement('hr');
}

export function createCalloutBlock(document, main) {
  let callOutBlocks = document.querySelectorAll('.colorBlockImageAndText .colorblock-img-text__wrapper');
  let calloutImg = '';
  let backgroundColor = '';
  let heading = '';
  let rteText = '';
  let ctalink = '';
  
  callOutBlocks.forEach((callOut) => {
    convertHrefs(callOut);
    let imageLeft;
    
    [...callOut.children].forEach((child, index) => {
      if (child.classList.contains('colorblock-img-text__image')) {
        const image = child.querySelector('picture > img');
        calloutImg = document.createElement('img');
        calloutImg.src = image.src;
        imageLeft = !callOut.classList.contains('colorblock-img-text--imgRight');
        
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
    if (imageLeft) {
      cells.push([calloutImg, `<h3>${heading}</h3> ${rteText} ${ctalink}`]);
    } else {
      cells.push([`<h3>${heading}</h3> ${rteText} ${ctalink}`, calloutImg]);
    }
    
    const callOutBlock = WebImporter.DOMUtils.createTable(cells, document);
    callOut.appendChild(callOutBlock);
  });

  callOutBlocks = document.querySelectorAll('.colorblock-text-cta__wrapper');
  callOutBlocks.forEach((callOut) => {
    convertHrefs(callOut);
    const color = callOut.parentElement.style.backgroundColor;
    if (color) {
      backgroundColor = colorMapping.get(toHex(color).toLowerCase());
    }
    
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
    
    const cells = backgroundColor === '' ? [['Callout']] : [[`Callout (${backgroundColor})`]];
    cells.push([`<h3>${heading}</h3> ${rteText}`, `${ctalink}`]);
    
    const callOutBlock = WebImporter.DOMUtils.createTable(cells, document);
    callOut.replaceWith(callOutBlock);
  });

  callOutBlocks = document.querySelectorAll('.colorBlockVideoAndText .colorblock-img-text__wrapper');
  callOutBlocks.forEach((callOut) => {
    convertHrefs(callOut);
    let videoUrl = '';
    
    [...callOut.children].forEach((child, index) => {
      if (child.classList.contains('colorblock-img-text__image')) {
        const image = child.querySelector('picture > img');
        calloutImg = document.createElement('img');
        calloutImg.src = image.src;
        
        videoUrl = child.querySelector('.video-banner').getAttribute('data-video-url');
        let videoID = videoUrl.split('/').at(-1);
        
        if (videoUrl.includes('youtube')) {
          videoUrl = `https://youtu.be/${videoID}`;
        } else if (videoUrl.includes('vimeo')) {
          videoUrl = `https://vimeo.com/${videoID}`;
        }
        
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

    const cells = backgroundColor === '' ? [['Callout(video)']] : [[`Callout (video, ${backgroundColor})`]];
    cells.push([calloutImg, `<h3>${heading}</h3> ${rteText} ${ctalink} ${videoUrl}`]);
    
    const callOutBlock = WebImporter.DOMUtils.createTable(cells, document);
    callOut.appendChild(callOutBlock);
  });  
}

export function createCardsBlock(document, main) {
  let cardsBlocks = document.querySelectorAll('.section__content--columns-3');
  cardsBlocks.forEach((cardsBlock) => {
    convertHrefs(cardsBlock);
    const cells = [];
    const cards = cardsBlock.querySelectorAll('.content-card');
    let cardsList = [];
    if (cardsBlock.querySelector('.video-banner')) {
      cells.push(['Cards(video)']);
    } else {
      cells.push(['Cards']);
    }
    cards.forEach((card, index) => {
      if (card.querySelector('.video-banner')) {
        
        const videoBanner = card.querySelector('.video-banner');
        let cardImg = videoBanner.querySelector('picture');
        
        if (cardImg) {
          cardImg = cardImg.outerHTML;
        } else {
          cardImg = '';
        }
        
        const cardHeading = card.querySelector('.content-card__text .heading > h3')
          ? card.querySelector('.content-card__text .heading > h3').textContent
          : '';
          
        const cardText = card.querySelector('.content-card__text .rte-block')
          ? card.querySelector('.content-card__text .rte-block').innerHTML
          : '';
        cardText.replace('&nbsp;', '');
        
        let videoURL = videoBanner.getAttribute('data-video-url');
        let videoID = videoURL.split('/').at(-1);
        videoID = videoID.split('?').at(0);
    
        if (videoURL.includes('youtube')) {
          videoURL = `https://youtu.be/${videoID}`;
        } else if (videoURL.includes('vimeo')) {
          videoURL = `https://vimeo.com/${videoID}`;
        }
        
        const cardLinkText = card.querySelector('.content-card__text > a').innerText;
        const cardLink = `<div><a href='${videoURL}'>${cardLinkText}</a></div>`;
          
        cells.push([`${cardImg}`, `<h3>${cardHeading}</h3> ${cardText} ${cardLink}`]);
      } else {        
        let cardImg = card.querySelector('.content-card__image > a > picture') 
          ? card.querySelector('.content-card__image > a > picture')
          : card.querySelector('.content-card__image > picture');
          
        if (cardImg) {
          cardImg = cardImg.outerHTML;
        } else {
          cardImg = '';
        }
        
        const cardHeading = card.querySelector('.content-card__text .heading > h3')
          ? card.querySelector('.content-card__text .heading > h3').textContent
          : '';
          
        const cardText = card.querySelector('.content-card__text .rte-block')
          ? card.querySelector('.content-card__text .rte-block').innerHTML
          : '';
        cardText.replace('&nbsp;', '');
        
        const cardLink = card.querySelector('.content-card__text > a')
          ? card.querySelector('.content-card__text > a').outerHTML
          : '';
          
        cells.push([`${cardImg} <h3>${cardHeading}</h3> ${cardText} ${cardLink}`]);
      }
    });
    
    const cardsTable = WebImporter.DOMUtils.createTable(cells, document);
    const div = document.createElement('div');
    div.appendChild(cardsTable);
    div.appendChild(pTag());
    cardsBlock.replaceWith(div);
  });

  cardsBlocks = document.querySelectorAll('.card-slider__wrapper');
  cardsBlocks.forEach((cardsBlock, index) => {
    convertHrefs(cardsBlock);
    const cells = [['Cards(slim)']];
    const cards = cardsBlock.querySelectorAll('.card');
    
    cards.forEach((card, index) => {
      const cardImg = card.querySelector('.card__image > picture').outerHTML;
      const cardHeading = card.querySelector('.card__text .heading > h4').textContent;
      const cardText = card.querySelector('.card__text .rte-block').innerHTML;
      cardText.replace('&nbsp;', '');
      
      const cardLinkText = card.querySelector('.card__text .secondary-cta');
      let cardLink = document.createElement('a');
      
      if (cardLinkText !== null) {
        cardLink.href = (cardLinkText.parentElement.href);
        cardLink.textContent = cardLinkText.textContent;
      } else {
        cardLink.href = previewURL + card.querySelector('.card__text > a').href;
      }

      cells.push([`${cardImg} <h4>${cardHeading}</h4> ${cardText} ${cardLink.outerHTML}`]);
    });
    
    const cardsTable = WebImporter.DOMUtils.createTable(cells, document);
    if (cardsBlocks.length > 1) {
      const ptag = document.createElement('p');
      ptag.textContent = '---';
      cardsTable.append(ptag);
    }
    const div = document.createElement('div');
    div.appendChild(cardsTable);
    div.appendChild(pTag());
    cardsBlock.replaceWith(div);
    
  });

  cardsBlocks = document.querySelectorAll('.section__content--columns-2');
  cardsBlocks.forEach((cardsBlock, index) => {
    convertHrefs(cardsBlock);
    const cells = [];
    const cards = cardsBlock.querySelectorAll('.content-card');
    let cardsList = [];
    
    cards.forEach((card, index) => {
      if (card.querySelector('.video-banner')) {
        if (index === 0) cells.push(['Cards(video,two-column)']);
        const videoBanner = card.querySelector('.video-banner');
        let cardImg = videoBanner.querySelector('picture');
        
        if (cardImg) {
          cardImg = cardImg.outerHTML;
        } else {
          cardImg = '';
        }
        
        const cardHeading = card.querySelector('.content-card__text .heading > h3')
          ? card.querySelector('.content-card__text .heading > h3').textContent
          : '';

        const cardText = card.querySelector('.content-card__text .rte-block')
          ? card.querySelector('.content-card__text .rte-block').innerHTML
          : '';
        cardText.replace('&nbsp;', '');

        let videoURL = videoBanner.getAttribute('data-video-url');
        let videoID = videoURL.split('/').at(-1);
        videoID = videoID.split('?').at(0);
    
        if (videoURL.includes('youtube')) {
          videoURL = `https://youtu.be/${videoID}`;
        } else if (videoURL.includes('vimeo')) {
          videoURL = `https://vimeo.com/${videoID}`;
        }
        
        const cardLinkText = card.querySelector('.content-card__text > a').innerText;
        const cardLink = `<div><a href='${videoURL}'>${cardLinkText}</a></div>`;
          
        cells.push([`${cardImg}`, `<h3>${cardHeading}</h3> ${cardText} ${cardLink}`]);
      } else {
        if (index === 0) cells.push(['Cards(two-column)']);
        let cardImg = card.querySelector('.content-card__image > a > picture') 
          ? card.querySelector('.content-card__image > a > picture') 
          : card.querySelector('.content-card__image > picture');
        
        if (cardImg) {
          cardImg = cardImg.outerHTML;
        } else {
          cardImg = '';
        }
      
      const cardHeading = card.querySelector('.content-card__text .heading > h3') ? 
        card.querySelector('.content-card__text .heading > h3').textContent : '';
        
      const cardText = card.querySelector('.content-card__text .rte-block') ? 
        card.querySelector('.content-card__text .rte-block').innerHTML : '';
        
      const cardLink = card.querySelector('.content-card__text > a') ? 
        card.querySelector('.content-card__text > a').outerHTML : '';
        
        cells.push([`${cardImg} <h3>${cardHeading}</h3> ${cardText} ${cardLink}`]);
      }
    });
    
    const cardsTable = WebImporter.DOMUtils.createTable(cells, document);    
    const div = document.createElement('div');
    div.appendChild(cardsTable);
    div.appendChild(pTag());
    cardsBlock.replaceWith(div);
  });

  cardsBlocks = document.querySelectorAll('.fourColumnTeaserGrid .section__content');
  cardsBlocks.forEach((cardsBlock) => {
    convertHrefs(cardsBlock);
    const cells = [['Cards(four-column)']];
    const cards = cardsBlock.querySelectorAll('.link-card');
    let cardsList = [];
    
    cards.forEach((card, index) => {
      let cardImg = card.querySelector('picture');
      card.removeChild(cardImg.parentElement);
      
      if (cardImg) {
        cardImg = cardImg.outerHTML;
      } else {
        cardImg = '';
      }
      
      cells.push([`${cardImg}`, `<a href='${card.href}'>${card.textContent}</a>`]);
    });
    
    const cardsTable = WebImporter.DOMUtils.createTable(cells, document);
    const div = document.createElement('div');
    div.appendChild(cardsTable);
    div.appendChild(pTag());
    cardsBlock.replaceWith(div);
  });

  cardsBlocks = document.querySelectorAll('.twoColumnImageWithCaption');
  cardsBlocks.forEach((cardsBlock) => {    
    convertHrefs(cardsBlock);
    const cards = cardsBlock.querySelectorAll('.section .section__content .two-col-images .img-caption');
    const cells = [['Cards(two-column)']];
    cards.forEach((card) => {      
      const cardImg = card.querySelector('.img-caption__image > picture').outerHTML;
      const cardTexts = card.querySelectorAll('.caption-text > p');
      const div = document.createElement('div');
      cardTexts.forEach((cardText) => {
        const innerDiv = document.createElement('div');
        const h6 = document.createElement('h6');
        h6.appendChild(cardText);
        innerDiv.appendChild(h6);
        div.appendChild(innerDiv);
      });
      cells.push([`${cardImg} ${div.innerHTML}`]);
    });
    const cardsTable = WebImporter.DOMUtils.createTable(cells, document);
    const div = document.createElement('div');
    div.appendChild(cardsTable);
    div.appendChild(pTag());
    cardsBlock.replaceWith(div);
  });
}

export function createVideoBlock(document, main) {
  let videoBlocks = document.querySelectorAll('.video-banner');
  videoBlocks.forEach((videoBlock) => {
    const cells = [['Video']];
    let videoURL = videoBlock.getAttribute('data-video-url');
    const picture = videoBlock.querySelector('.video-banner__wrapper > picture').outerHTML;
    
    let videoID = videoURL.split('/').at(-1);
    videoID = videoID.split('?').at(0);
    
    if (videoURL.includes('youtube')) {
      videoURL = `https://youtu.be/${videoID}`;
    } else if (videoURL.includes('vimeo')) {
      videoURL = `https://vimeo.com/${videoID}`;
    }
    
    cells.push([`${picture} ${videoURL}`]);
    const videoTable = WebImporter.DOMUtils.createTable(cells, document);
    videoBlock.replaceWith(videoTable);
  });
}

export function createIngredientBlock(document, main, formulation = false) {
  
  const relatedIngredients = document.querySelector('.relatedIngredients');
  if (!relatedIngredients) return;
  const mainHeading = relatedIngredients.querySelector('.section-title-description-wrapper .heading > h2');
  const resultProdCards = document.querySelectorAll('.result-prod-card');
  if (!resultProdCards) {
    const cells = [['related ingredient']];
    const heading = relatedIngredients.querySelector('.heading > h2').textContent;
    const productURL = relatedIngredients.querySelector('.result-card__buttons secondary-cta-link').href;
    if (productURL) {
      const productName = productURL.split('name=').pop();
      cells.push(['Product Name', productName]);
    } else {
      cells.push(['Product Name', heading.trim()]);
    }
    const table = WebImporter.DOMUtils.createTable(cells, document);
    const ptag = document.createElement('p');
    ptag.textContent = '---';
    const div = document.createElement('div');
    div.appendChild(ptag);
    if (mainHeading) {
      div.appendChild(mainHeading);
    }
    div.appendChild(table);
    if (formulation) {
      const section = [['Section Metadata']];
      section.push(['Style', 'full-page']);
      const fullPage = WebImporter.DOMUtils.createTable(section, document);
      div.appendChild(fullPage);
    }
    relatedIngredients.replaceWith(div);
    
  } else {
    resultProdCards.forEach((resultProdCard, index) => {
      const cells = [['related ingredient']];
      const heading = resultProdCard.querySelector('.product-name').textContent;
      const productURL = resultProdCard.querySelector('.result-card__buttons .secondary-cta-link').href;
      if (productURL) {
        const productName = productURL.split('name=').pop();
        cells.push(['Product Name', productName]);
      } else {
        cells.push(['Product Name', heading.trim()]);
      }               
      
      const table = WebImporter.DOMUtils.createTable(cells, document);
      const ptag = document.createElement('p');
      ptag.textContent = '---';
      const div = document.createElement('div');
      if (index === 0) {
        div.appendChild(ptag);
        if (mainHeading) {
          div.appendChild(mainHeading);
        }
      } 
      div.appendChild(table);
      if (index === resultProdCards.length - 1){
        if (formulation) {
          const section = [['Section Metadata']];
          section.push(['Style', 'full-page']);
          const fullPage = WebImporter.DOMUtils.createTable(section, document);
          div.appendChild(fullPage);
        }
        div.appendChild(ptag);
      }
      resultProdCard.replaceWith(div);            
    });
  }
}

export function createContactUs(main, document) {
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

export function getSocialShare(document) {
  const socialShare = document.querySelector('.social-share');
  const socialMetaProp = [];
  if (!socialShare) return;
  const facebook = socialShare.querySelector('.icon-Facebook');
  if (facebook) {
    socialMetaProp.push('facebook');
  }
  
  const twitter = socialShare.querySelector('.icon-Twitter');
  if (twitter) {
    socialMetaProp.push('X');
  }
  
  if (socialMetaProp.length === 0) return;
  return socialMetaProp.join(', ');
}

export function createColorBlock(document) {
  const colorBlocks = document.querySelectorAll('.colorBlockQuote');
  colorBlocks.forEach((colorBlock) => {
    const colorBlockQuote = colorBlock.querySelector('.colorblock-quote');
    if (!colorBlockQuote) return;
    
    const color = toHex(colorBlockQuote.style.backgroundColor);
    const cells = colorMapping.has(color) ? [[`Quote(${colorMapping.get(color)}) `]] : [[`Quote(${color}) `]];
    
    const heading = colorBlockQuote.querySelector('.heading > h1').textContent;
    cells.push([`<p>${heading}</p>`]);
    
    const subHeading = colorBlockQuote.querySelector('.heading > h3');
    if (subHeading) cells.push([`<p>${subHeading.textContent}</p>`]);
    else cells.push(['']);

    const label = colorBlockQuote.querySelector('.label-text');
    if (label) cells.push([`<p>${label.textContent}</p>`]);
    else cells.push(['']);

    const table = WebImporter.DOMUtils.createTable(cells, document);
    colorBlock.append(table);
    colorBlockQuote.remove();
  });
}

export function toHex(rgb) {
  // Grab the numbers
  const match = rgb.match(/\d+/g);

  // `map` over each number and return its hex equivalent 
  // making sure to `join` the array up and attaching a `#` to the beginning
  return `#${match.map(color => {
    const hex = Number(color).toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
  }).join('')}`;
}

export function createAnchorBlock(document, main) {
  const contentTabs = document.querySelector('.content-tabs');
  if (!contentTabs) return;
  
  const cells = [['Anchor']];
  const tabs = contentTabs.querySelectorAll('.contentTab .content-tabs__section');
  const contentTabsNavWrapper = contentTabs.querySelector('.content-tabs__navigationWrapper');
  if (!contentTabsNavWrapper) return;
  tabs.forEach((tab) => {
    const anchor = document.createElement('a');
    anchor.textContent = tab.getAttribute('link-label');
    
    const tabContent = tab.querySelector('h2');
    if (tabContent) {
      let text = tabContent.textContent.replace(/\&nbsp;/g, '');
      text = text.trim();
      text = text.replace('(', '').replaceAll(')', '');
      text = text.replace('\'', '').toLowerCase();
      text = text.replace(/\s+/g, '-').toLowerCase();
      text = text.replaceAll(/[^a-z0-9-]/g, '');
      anchor.href = `#${text}`;
    } else {
      const ptag = document.createElement('p');
      ptag.textContent = '---';
      const h2 = document.createElement('h2');
      let text = tab.getAttribute('link-label');
      h2.textContent = text;
      text = text.trim();
      text = text.replace('(', '').replaceAll(')', '');
      text = text.replace('\'', '').toLowerCase();
      text = text.replace(/\s+/g, '-').toLowerCase();
      text = text.replaceAll(/[^a-z0-9-]/g, '');
      anchor.href = `#${text}`;     
      tab.prepend(h2);
      tab.prepend(ptag);
    }
    
    cells.push([`${anchor.outerHTML}`]);
  });
  
  const table = WebImporter.DOMUtils.createTable(cells, document);
  contentTabsNavWrapper.remove();
  return table;
}

export function createCarouselBlock(document, main) {
  const carousels = document.querySelectorAll('.carousel');
  if (!carousels) return;
  
  carousels.forEach((carousel) => {
    const cells = [['Carousel']];
    
    const carouselOverview = carousel.querySelector('.card-carousel__overview');
    const carouselHeading = carouselOverview.querySelector('.heading') ? 
      carouselOverview.querySelector('.heading').textContent : '';
    const carouselSubHeading = carouselOverview.querySelector('.rte-block') ? 
      carouselOverview.querySelector('.rte-block').innerHTML : '';
      
    cells.push([`<h3>${carouselHeading}</h3> ${carouselSubHeading}`]);
    
    const slides = carousel.querySelectorAll('.card-carousel__slider .card-carousel__card');
    slides.forEach((slide) => {
      const slideImgElement = slide.querySelector('.card-carousel__card--wrapper .card-carousel__card--image > picture');
      const slideImg = slideImgElement ? slideImgElement.outerHTML : '';
      
      const slideHeadingElement = slide.querySelector('.card-carousel__card--wrapper .card-carousel__card--text .heading > h3');
      const slideHeading = slideHeadingElement ? slideHeadingElement.outerHTML : '';
      
      const slideTextElement = slide.querySelector('.card-carousel__card--wrapper .card-carousel__card--text .rte-block');
      const slideText = slideTextElement ? slideTextElement.innerHTML : '';
      
      cells.push([`${slideImg}`, `${slideHeading} ${slideText}`]);
    });
    
    const carouselTable = WebImporter.DOMUtils.createTable(cells, document);
    const ptag = document.createElement('p');
    ptag.textContent = '---';
    carouselTable.append(ptag);
    carousel.replaceWith(carouselTable);
  });
}

export function addAuthorBio(document, main) {
  const authorBio = document.querySelectorAll('.author-bio');
  const imageWithDesc = document.querySelectorAll('.imageWithDescription .image-desc .image-desc__wrapper');
  
  if (!authorBio && !imageWithDesc) {
    console.log('No author bio found');
    return;
  }

  authorBio.forEach((author) => {
    const cells = [['Author']];
    const authorName = author.querySelector('.author-bio__text .heading').innerHTML;
    cells.push([`${authorName}`]);
    const authorBioTable = WebImporter.DOMUtils.createTable(cells, document);
    author.replaceWith(authorBioTable);
  })

  imageWithDesc.forEach((image) => {
    const cells = [['Author']];
    const authorName = image.querySelector('.image-desc__text .heading').innerText;
    cells.push([`${authorName}`]);
    const authorBioTable = WebImporter.DOMUtils.createTable(cells, document);
    image.replaceWith(authorBioTable);
  }) 
}

export function createForm(document, main) {
  const cells = [['Form']];
  let formURL = '';
  let formContainer = document.querySelector('.contactUsForm');
  let submissionURL = '';
  if (formContainer) {
    formURL = 'https://main--ingredion--aemsites.aem.live/na/en-us/forms/contact-supplier-form.json';
    submissionURL = 'https://go.ingredion.com/l/504221/2025-03-03/2b8msvs';
    cells.push([`Form URL`, `${formURL}`]);
    cells.push([`Submission Endpoint`, `${submissionURL}`]);
    const formTable = WebImporter.DOMUtils.createTable(cells, document);
    formContainer.replaceWith(formTable);
  } 
}

export function createTableBlock(document, main) {
  const tableParents = document.querySelectorAll('.ingredionTable .ingredion-table .ingredion-table');
  if (!tableParents) return;
  tableParents.forEach((tableParent) => {
    const cells = [['Table']];
    const th = tableParent.querySelectorAll('thead > tr > th');
    const tr = tableParent.querySelectorAll('tbody > tr');
    
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
    
    const table = WebImporter.DOMUtils.createTable(cells, document);
    tableParent.replaceWith(table);
});
}

function testURL(url) {
  const hasProtocol = /^(?:[a-z+]+:)?\/\//i.test(url);
  
  if (hasProtocol) {
    // First check if it's a PDP URL that needs conversion
    const pdpURL = convertPDPURLs(url);
    if (pdpURL) return pdpURL;
    
    // Handle email links
    if (url.includes('@')) return url;
    
    // Handle localhost and ingredion.com URLs
    if (url.includes('localhost:3001')) {
      return url.replace('http://localhost:3001', previewURL).split('.html')[0];
    }
    
    if (url.includes('ingredion.com')) {
      return url.replace('https://www.ingredion.com', previewURL).split('.html')[0];
    }
    
    // Default case for other absolute URLs
    return url;
  } 
  
  // Handle relative URLs
  return `${previewURL}${url}`.split('.html')[0];
}

export function convertHrefs(element) {
  const hrefs = element.querySelectorAll('a');
  hrefs.forEach((href) => {
    href.href = testURL(href.href);
  });
}

export function createCTAIconBlock(document, main) {
  const ctaIconBlocks = document.querySelectorAll('.section__content--columns-6, .section__content--columns-4');
  if (!ctaIconBlocks) return;  
  ctaIconBlocks.forEach((ctaIconBlock) => {    
    const cells = [['CTA Icons']];
    const ctaIcons = ctaIconBlock.querySelectorAll('.icon-card');
    let ctaIconString = '';
    ctaIcons.forEach((ctaIcon, index) => {
      let ctaIconURL = ctaIcon.href;
     if (ctaIcon.href.includes('localhost:3001') || ctaIcon.href.includes('ingredion.com')) {
        ctaIconURL = testURL(ctaIconURL);
      }
      const ctaIconImg = ctaIcon.querySelector('.icon-card__wrapper > img');
      const ctaIconText = ctaIcon.querySelector('.icon-card__wrapper > h3').textContent;
      const ctaIconImgURL = ctaIconImg.src ? ctaIconImg.src : 'https://main--ingredion--aemsites.aem.live/na/en-us/images/blank-cta-icon.jpg';
      ctaIconString += `<div><div><img src = '${ctaIconImgURL}'></div><div><a href = '${ctaIconURL}'>${ctaIconText}</a></div></div>`;
      if (index !== 0 && index % 5 === 0) {
        cells.push([ctaIconString]);
        ctaIconString = '';
      }
      else if (index === ctaIcons.length - 1) cells.push([ctaIconString]);
    });
    const ctaIconTable = WebImporter.DOMUtils.createTable(cells, document);
    ctaIconBlock.replaceWith(ctaIconTable);
  });
}

export function sanitizeMetaTags(tags) {
  const tagsArray = tags.split(',');
  const sanitizedTags = [];
  let faltTags = [];
  tagsArray.forEach(tag => {   
    if (tag.includes('Ingredion :')) {
      let temp = tag.replace('Ingredion :', '');
      temp = temp.split('/');
      temp.forEach(item => faltTags.push(item.trim()));      
    } else if (tag.includes('Ingredion-com :')) {   
      sanitizedTags.push(tag.replace('Ingredion-com :', ''));
    } else
      faltTags.push(tag);
  });  
  let tempArray = faltTags.filter((item, index) => faltTags.indexOf(item) === index);
  return [[...new Set(sanitizedTags)], [...new Set(tempArray)]];
}

export function createArticleList(document, main) {
  const element = document.querySelector('.news-blog-article-mount, .resource-listing-mount, .events-listing-mount');
  if (!element) return;
  
  const data_url = element.getAttribute('data-url');
  const pathBase = data_url.split('/jcr:content')[0];
  const sheetName = sheet.get(pathBase.split('/').pop());
  if (!sheetName) return;
  const perPageOptions = document.createElement('div');
  perPageOptions.innerHTML = `<div>6</div><div>12</div><div>18</div><div>24</div><div>30</div>`;
  const cells = [
    ['Article List'],
    ['Article Data', `/na/en-us/indexes/global-index.json?sheet=${sheetName}`],
    ['Articles per page options', perPageOptions.outerHTML],
    ['Pagination max buttons', '5']
  ];
  
  const articleListTable = WebImporter.DOMUtils.createTable(cells, document);
  const div = document.createElement('div');
  div.append(pTag());
  div.append(articleListTable);
  element.replaceWith(div);
}

export function addKeywords(url) {  
  const caseInsensitiveUrl = Array.from(urlCategoryMap.keys()).find(key => key.toLowerCase() === url.toLowerCase());
  if (caseInsensitiveUrl === undefined || caseInsensitiveUrl === null) return '';
  else if (undefined !== caseInsensitiveUrl && null !== caseInsensitiveUrl) {
    const sanitizedTags = sanitizeMetaTags(urlCategoryMap.get(caseInsensitiveUrl));console.log(sanitizedTags);
    if (sanitizedTags[0].length > 0) return sanitizedTags[0].join(', ');
    if (sanitizedTags[1].length > 0) return sanitizedTags[1].join(', ');
  }
}

export function alignCenter (document) {
  const sections = document.querySelectorAll('.section-title-description-wrapper');
  if (!sections) return;
  sections.forEach((section) => {
    const heading = section.querySelector('.heading--center');
    if (!heading) return;
    section.prepend(pTag());
    const sectionMetadata = [['Section Metadata']];
    sectionMetadata.push(['Style', 'center']);
    const sectionMetadataTable = WebImporter.DOMUtils.createTable(sectionMetadata, document);
    section.append(sectionMetadataTable);
    section.append(pTag());
  });
  const rteBlocks = document.querySelectorAll('.rte-block');
  rteBlocks.forEach((rteBlock) => {
    const centerAlignPTag = rteBlock.querySelectorAll('p');
    centerAlignPTag.forEach((p) => {
      if (p.style.textAlign === 'center') {
        p.prepend(pTag());
        const sectionMetadata = [['Section Metadata']];
        sectionMetadata.push(['Style', 'center']);
        const sectionMetadataTable = WebImporter.DOMUtils.createTable(sectionMetadata, document);
        p.append(sectionMetadataTable);
        p.append(pTag());
      }
    });
  });
}

function convertPDPURLs(url) {
  // Convert localhost URLs to production URLs
  let newURL = url.includes('localhost:3001') 
    ? url.replace('http://localhost:3001', 'https://www.ingredion.com') 
    : url;
  
  // Check if URL is an ingredient URL
  if (newURL.includes('/ingredient/') || newURL.includes('/ingredients/')) {
    const newPDPURL = PDPMap.get(newURL);
    return newPDPURL ? `${previewURL}${newPDPURL}` : false;
  }
  
  return false;
}