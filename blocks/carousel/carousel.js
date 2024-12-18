import { fetchPlaceholders } from '../../scripts/aem.js';

function bindEvents(block) {
    const slidesContainer = block.querySelector('.carousel-slides');

    let isDragging = false;
    let startX = 0;
    let scrollLeft = 0;

    slidesContainer.addEventListener('wheel', (e) => e.preventDefault(), { passive: false });

    slidesContainer.addEventListener('mousedown', (e) => {
        isDragging = true;
        e.preventDefault();
        slidesContainer.classList.add('active');
        startX = e.clientX;
        scrollLeft = slidesContainer.scrollLeft;
    });

    slidesContainer.addEventListener('mouseup', () => {
        isDragging = false;
        slidesContainer.classList.remove('active');
    });

    slidesContainer.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.clientX;
        const walk = x - startX;
        slidesContainer.scrollLeft = scrollLeft - walk;
    });

    slidesContainer.addEventListener('dragstart', (e) => e.preventDefault());
}

function createSlide(row, slideIndex, carouselId) {
  const slide = document.createElement('li');
  slide.dataset.slideIndex = slideIndex;
  slide.setAttribute('id', `carousel-${carouselId}-slide-${slideIndex}`);
  slide.classList.add('carousel-slide');

  row.querySelectorAll(':scope > div').forEach((column) => {
    if (column.querySelector('picture')) {
      column.className = 'slide-image';
      const imageAnchor = document.createElement('a');
      const picture = column.querySelector('picture');
      imageAnchor.append(picture);
      column.append(imageAnchor);
    } else column.className = 'slide-body';
    slide.append(column);
  });

  const labeledBy = slide.querySelector('h1, h2, h3, h4, h5, h6');
  if (labeledBy) {
    slide.setAttribute('aria-labelledby', labeledBy.getAttribute('id'));
  }

  return slide;
}

let carouselId = 0;
export default async function decorate(block) {
  carouselId += 1;
  const rows = block.querySelectorAll(':scope > div');
  const isSingleSlide = rows.length < 2;

  const placeholders = await fetchPlaceholders(); 

  const carouselContainer = document.createElement('div');
  carouselContainer.classList.add('carousel-container');

  const slidesContainer = document.createElement('div');
  slidesContainer.classList.add('carousel-slides-container');

  const overview = document.createElement('div');
  overview.classList.add('carousel-overview');

  carouselContainer.append(overview);
  carouselContainer.append(slidesContainer);

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.classList.add('carousel-slides');
  block.prepend(slidesWrapper);

  let slideIndicators;
  if (!isSingleSlide) {
    const slideIndicatorsNav = document.createElement('nav');
    slideIndicatorsNav.setAttribute('aria-label', placeholders.carouselSlideControls || 'Carousel Slide Controls');
    slideIndicators = document.createElement('ol');
    slideIndicators.classList.add('carousel-slide-indicators');
    slideIndicatorsNav.append(slideIndicators);
    block.append(slideIndicatorsNav);

    const slideNavButtons = document.createElement('div');
    slideNavButtons.classList.add('carousel-navigation-buttons');
    slideNavButtons.innerHTML = `
      <button type="button" class= "slide-prev" aria-label="${placeholders.previousSlide || 'Previous Slide'}"></button>
      <button type="button" class="slide-next" aria-label="${placeholders.nextSlide || 'Next Slide'}"></button>
    `;

    slidesContainer.append(slideNavButtons);
  }

  rows.forEach((row, idx) => {
    if (idx === 0) {
      overview.append(row);
    } else {
      const slide = createSlide(row, idx, carouselId);
      slidesWrapper.append(slide);

      if (slideIndicators) {
        const indicator = document.createElement('li');
        indicator.classList.add('carousel-slide-indicator');
        indicator.dataset.targetSlide = idx;
        indicator.innerHTML = `<button type="button" aria-label="${placeholders.showSlide || 'Show Slide'} ${idx + 1} ${placeholders.of || 'of'} ${rows.length}"></button>`;
        slideIndicators.append(indicator);
      }
      row.remove();
    }
  });

  slidesContainer.append(slidesWrapper);
  block.prepend(carouselContainer);

  if (!isSingleSlide) {
    bindEvents(block);
  }
}
