import { createOptimizedPicture } from '../../scripts/aem.js';
import { openVideoModal } from '../video/video-modal.js';

const isDesktop = window.matchMedia('(width >= 1280px)');

function showCard(block, cardIndex = 0) {
  block.dataset.activeCard = cardIndex;
  const cards = block.querySelectorAll('li');
  const realCardIndex = Math.max(0, Math.min(cardIndex, cards.length - 1));
  const activeCard = block.querySelector(`li[card-index="${realCardIndex}"]`);
  const indicators = block.querySelectorAll('.dots-nav span');

  indicators.forEach((indicator, i) => {
    if (i !== realCardIndex) indicator.removeAttribute('active');
    else indicator.setAttribute('active', 'true');
  });

  const cardWidth = activeCard.offsetWidth + 25;
  const scrollPosition = cardWidth * realCardIndex;

  block.querySelector('ul').scrollTo({
    left: scrollPosition,
    behavior: 'smooth',
  });
}

function snapToSlide(block) {
  const cardsContainer = block.querySelector('ul');
  const cards = [...block.querySelectorAll('li')];
  const cardWidth = cards[0].offsetWidth;
  const closestCardIndex = Math.round(cardsContainer.scrollLeft / cardWidth);

  showCard(block, closestCardIndex);
}

function enableDragging(block) {
  const cardsContainer = block.querySelector('ul');
  let isDragging = false;
  let startX = 0;
  let lastScrollLeft = 0;

  function onMove(x) {
    if (!isDragging) return;
    const deltaX = startX - x;
    cardsContainer.scrollLeft = lastScrollLeft + deltaX; // Move smoothly with the mouse
    snapToSlide(block);
  }

  function onEnd() {
    if (!isDragging) return;
    isDragging = false;
    cardsContainer.classList.remove('dragging');
    snapToSlide(block);
  }

  cardsContainer.addEventListener('mousedown', (e) => {
    isDragging = true;
    cardsContainer.classList.add('dragging');
    startX = e.pageX;
    lastScrollLeft = cardsContainer.scrollLeft;
  });

  cardsContainer.addEventListener('mousemove', (e) => {
    if (isDragging) {
      e.preventDefault();
      onMove(e.pageX);
    }
  });

  cardsContainer.addEventListener('mouseup', onEnd);
  cardsContainer.addEventListener('mouseleave', onEnd);

  // Touch support for mobile
  cardsContainer.addEventListener('touchstart', (e) => {
    isDragging = true;
    cardsContainer.classList.add('dragging');
    startX = e.touches[0].pageX;
    lastScrollLeft = cardsContainer.scrollLeft;
  });

  cardsContainer.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    onMove(e.touches[0].pageX);
  });

  cardsContainer.addEventListener('touchend', onEnd);

  // Prevent images from being dragged
  block.querySelectorAll('.carousel-slide img').forEach((img) => {
    img.addEventListener('dragstart', (e) => e.preventDefault());
  });
}

function bindEvents(block) {
  block.querySelectorAll('.dots-nav').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const cardIndex = parseInt(e.target.dataset.index, 10);
      showCard(block, cardIndex);
    });
  });
}

export default async function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row, i) => {
    const li = document.createElement('li');
    li.setAttribute('card-index', i);
    while (row.firstElementChild) li.append(row.firstElementChild);
    if (block.classList.contains('video')) {
      const placeholder = li.querySelector('picture');
      const link = li.querySelector('a');
      li.dataset.embedLoaded = false;
      const autoplay = li.classList.contains('autoplay');
      if (placeholder) {
        li.classList.add('placeholder');
        const wrapper = document.createElement('div');
        wrapper.className = 'video-placeholder';
        wrapper.append(placeholder);

        if (!autoplay) {
          wrapper.insertAdjacentHTML(
            'beforeend',
            '<div class="video-placeholder-play"><button type="button" class="button play" title="Play"></button></div>',
          );
          wrapper.addEventListener('click', () => {
            openVideoModal(link.href, true, false);
          });
          link.addEventListener('click', (e) => {
            e.preventDefault();
            openVideoModal(link.href, true, false);
          });
        }
        li.prepend(wrapper);
        ul.append(li);
      }
    } else {
      [...li.children].forEach((div) => {
        if (div.children.length === 1 && div.querySelector('picture')) {
          div.className = 'cards-card-image';
          const imageAnchor = document.createElement('a');
          const picture = div.querySelector('picture');
          imageAnchor.append(picture);
          div.append(imageAnchor);
        } else div.className = 'cards-card-body';
      });
      if (block.classList.contains('four-column')) {
        const existingWrapper = document.querySelector('.section-title-description-wrapper');
        if (!existingWrapper) {
          const wrapper = document.createElement('div');
          wrapper.className = 'section-title-description-wrapper';
          block.insertAdjacentElement('beforebegin', wrapper);
        }

        const imageContainer = li.querySelector('.cards-card-image');
        const bodyContainer = li.querySelector('.cards-card-body');
        const textLink = bodyContainer.querySelector('a');

        if (textLink && imageContainer && bodyContainer) {
          const linkHref = textLink.href;
          const h3 = document.createElement('h3');
          h3.textContent = textLink.textContent;
          h3.title = textLink.title || '';
          textLink.parentNode.replaceWith(h3);

          const wrapperLink = document.createElement('a');
          wrapperLink.href = linkHref;
          wrapperLink.title = textLink.title || '';

          li.prepend(wrapperLink);
          wrapperLink.appendChild(imageContainer);
          wrapperLink.appendChild(bodyContainer);
        }
      }
      ul.append(li);
    }
    const btnContainers = li.querySelectorAll('.button-container');
    if (btnContainers) {
      btnContainers.forEach((btnContainer, index) => {
        if (btnContainers.length === 1 || index > 0) {
          const a = btnContainer.querySelector('a');
          const span = document.createElement('span');
          span.className = 'icon-green-arrow';
          a.append(span);
          const imageAnchor = li.querySelector('.cards-card-image a');
          if (imageAnchor) {
            imageAnchor.href = a.href;
            imageAnchor.setAttribute('aria-label', a.href);
            btnContainer.classList.add('secondary-cta');
          }
        } else {
          btnContainer.classList.add('heading');
        }
        btnContainer.classList.remove('button-container');
      });
    }
  });
  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
  block.textContent = '';
  block.append(ul);
  if (block.classList.contains('slim')) {
    const dotsNav = document.createElement('div');
    dotsNav.className = 'dots-nav';
    [...ul.children].forEach((_, index) => {
      const dot = document.createElement('span');
      if (index === 0) {
        if (index === 0) dot.setAttribute('active', 'true');
      }
      dot.className = 'dot';
      dot.dataset.index = index;
      dotsNav.append(dot);
    });
    block.append(dotsNav);

    if (!isDesktop.matches) {
      bindEvents(block);
      enableDragging(block);
      showCard(block, 0);
    }
  }
  isDesktop.addEventListener('change', () => {
    requestAnimationFrame(window.location.reload());
  });
}
