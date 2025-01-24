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
  ['#ffffff', 'transparent'],
  ['#68e0a1', 'teal']
]);

export function createHeroBlock(document, main) {
  const hero = document.querySelector('.hero__wrapper');
  if (hero) {
    const cells = hero.classList.contains('hero--text-left') ? [['Hero(align-left)']] : [['Hero']];
    const image = hero.querySelector('.hero__image > picture').outerHTML;
    const heading = hero.querySelector('.hero__text .heading > h1') ? hero.querySelector('.hero__text .heading > h1').outerHTML : '';
    const subHeading = hero.querySelector('.hero__text .body-text') ? hero.querySelector('.hero__text .body-text').outerHTML : '';
    const cta = hero.querySelector('.hero__text .primary-cta') ? hero.querySelector('.hero__text .primary-cta').outerHTML : '';
    cells.push([image]);
    cells.push([`${heading} ${subHeading} ${cta}` ]);
    const heroTable = WebImporter.DOMUtils.createTable(cells, document);
    hero.replaceWith(heroTable);    
  } 
  return;
}

export function createCalloutBlock(document, main) {
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

export function createCardsBlock(document, main) {
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
      const cardText = card.querySelector('.content-card__text .rte-block') ? card.querySelector('.content-card__text .rte-block').innerHTML : '';
      cardText.replace('&nbsp;', '');
      const cardLink = card.querySelector('.content-card__text > a') ? card.querySelector('.content-card__text > a').outerHTML : '';
      cells.push([`${cardImg} <h3>${cardHeading}</h3> ${cardText} ${cardLink}`]);
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
      const cardText = card.querySelector('.card__text .rte-block').innerHTML;
      cardText.replace('&nbsp;', '');
      const cardLinkText = card.querySelector('.card__text .secondary-cta');
      let cardLink = document.createElement('a');
      if (cardLinkText !== null) {
        cardLink.href = cardLinkText.parentElement.href;
        cardLink.textContent = cardLinkText.textContent;
      } else cardLink.href = card.querySelector('.card__text > a').href;

      cells.push([`${cardImg} <h4>${cardHeading}</h4> ${cardText} ${cardLink.outerHTML}`]);
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
      const cardText = card.querySelector('.content-card__text .rte-block') ? card.querySelector('.content-card__text .rte-block').innerHTML : '';
      const cardLink = card.querySelector('.content-card__text > a') ? card.querySelector('.content-card__text > a').outerHTML : '';
      cells.push([`${cardImg} <h3>${cardHeading}<h3> ${cardText} ${cardLink}`]);
    });
    const cardsTable = WebImporter.DOMUtils.createTable(cells, document);
    cardsBlock.replaceWith(cardsTable);
  });

  cardsBlocks = document.querySelectorAll('.fourColumnTeaserGrid .section__content');
  cardsBlocks.forEach((cardsBlock) => {
    const cells = [['Cards(four-column)']];
    const cards = cardsBlock.querySelectorAll('.link-card');
    let cardsList = [];
    cards.forEach((card, index) => {
      let cardImg = card.querySelector('picture');
      card.removeChild(cardImg.parentElement);
      if (cardImg) cardImg = cardImg.outerHTML;
      else cardImg = '';
      cells.push([`${cardImg} <a href='${card.href}'>${card.textContent}</a>`]);
    });
    const cardsTable = WebImporter.DOMUtils.createTable(cells, document);
    cardsBlock.replaceWith(cardsTable);
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
    videoURL = `https://vimeo.com/${videoID}`;
    cells.push([`${picture} ${videoURL}`]);
    const videoTable = WebImporter.DOMUtils.createTable(cells, document);
    videoBlock.replaceWith(videoTable);
  });
}

export function createIngredientBlock(document, main) {
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

export function createColorBlock(document) {
  const colorBlocks = document.querySelectorAll('.colorBlockQuote');
  colorBlocks.forEach((colorBlock) => {
    const colorBlockQuote = colorBlock.querySelector('.colorblock-quote');
    if (!colorBlockQuote) return;
    const color = toHex(colorBlockQuote.style.backgroundColor);
    const cells = colorMapping.has(color) ? [[`colorblock(${colorMapping.get(color)}) `]] : [[`colorblock(${color}) `]];
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

export function toHex(rgb) {

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

export function createAnchorBlock(document, main) {  
  const contentTabs = document.querySelector('.content-tabs');
  if (!contentTabs) return;
  const cells = [['Anchor']];
  const tabs = document.querySelectorAll('.contentTab .content-tabs__section');
  tabs.forEach((tab) => {   
    const anchor = document.createElement('a');
    anchor.textContent = tab.getAttribute('link-label');
    const tabContent = tab.querySelector('.richText .rte-block  > h2');
    if (tabContent) {
      let text = tabContent.textContent.replace(/\&nbsp;/g, '');
      text = text.replace('(', '').replaceAll(')', '');
      text = text.replace(/\s+/g, '-').toLowerCase();
      anchor.href = `#${text}`;
    }
    cells.push([`${anchor.outerHTML}`]);
  });
  const table = WebImporter.DOMUtils.createTable(cells, document);
  contentTabs.prepend(table);
  
}

export function createCarouselBlock(document, main) {
  const carousels = document.querySelectorAll('.carousel');
  if (!carousels) return;
  carousels.forEach((carousel) => {    
    const cells = [['Carousel']];
    const carouselOverview = carousel.querySelector('.card-carousel__overview');
    const carouselHeading = carouselOverview.querySelector('.heading') ? carouselOverview.querySelector('.heading').textContent : '';
    const carouselSubHeading = carouselOverview.querySelector('.rte-block') ? carouselOverview.querySelector('.rte-block').innerHTML : '';
    cells.push([`<h3>${carouselHeading}</h3> ${carouselSubHeading}`]);
    const slides = carousel.querySelectorAll('.card-carousel__slider .card-carousel__card');
    slides.forEach((slide) => {
      const slideImg = slide.querySelector('.card-carousel__card--wrapper .card-carousel__card--image > picture').outerHTML;
      const slideHeading = slide.querySelector('.card-carousel__card--wrapper .card-carousel__card--text .heading > h3').outerHTML;
      const slideText = slide.querySelector('.card-carousel__card--wrapper .card-carousel__card--text .rte-block').innerHTML;      
      cells.push([`${slideImg}`, `${slideHeading} ${slideText}`]);
    });
    const carouselTable = WebImporter.DOMUtils.createTable(cells, document);
    carousel.replaceWith(carouselTable);
  });
}

export function addAuthorBio(document, main){
  const authorBio = document.querySelector('.author-bio');
  if (!authorBio) return;
  const cells = [['Author']];
  const authorName = authorBio.querySelector('.author-bio__text .heading').innerHTML;
  const authorImage = authorBio.querySelector('.author-bio__image > picture').outerHTML;
  const authorBioText = authorBio.querySelector('.author-bio__text .body-text').innerHTML;
  cells.push([`${authorImage}`, `${authorName} ${authorBioText}`]);
  const authorBioTable = WebImporter.DOMUtils.createTable(cells, document);
  authorBio.replaceWith(authorBioTable);  
}