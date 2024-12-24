import { fetchPlaceholders } from '../../scripts/aem.js';

function bindEvents(block) {
  const slidesContainer = block.querySelector('.carousel-slides');
  const slides = Array.from(slidesContainer.children);

  let isDragging = false;
  let startX = 0;
  let scrollLeft = 0;

  slidesContainer.addEventListener('wheel', (e) => e.preventDefault(), { passive: false });

  // Helper function to calculate the slide width
  const getSlideWidth = () => slides[0]?.getBoundingClientRect().width || 0;

  // Snap to the nearest slide
  const snapToSlide = () => {
    const slideWidth = getSlideWidth();
    const scrollPosition = slidesContainer.scrollLeft;
    const closestSlideIndex = Math.round(scrollPosition / slideWidth);
    slidesContainer.scrollTo({
      left: closestSlideIndex * slideWidth,
      behavior: 'smooth',
    });
  };

  // Mouse down to start dragging
  slidesContainer.addEventListener('mousedown', (e) => {
    isDragging = true;
    slidesContainer.classList.add('dragging');
    startX = e.clientX;
    scrollLeft = slidesContainer.scrollLeft;
  });

  // Mouse move for smooth scrolling
  slidesContainer.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.clientX;
    const distance = x - startX;
    slidesContainer.scrollLeft = scrollLeft - distance;
  });

  // Mouse up to stop dragging and snap to slide
  slidesContainer.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    slidesContainer.classList.remove('dragging');
    snapToSlide();
  });

  // Ensure snap when the mouse leaves the container
  slidesContainer.addEventListener('mouseleave', () => {
    if (!isDragging) return;
    isDragging = false;
    slidesContainer.classList.remove('dragging');
    snapToSlide();
  });

  // Prevent dragstart for images
  slidesContainer.addEventListener('dragstart', (e) => e.preventDefault());
}

function adjustIndicators(retries = 10) {
  const indicators = document.querySelector('.carousel-slides-container > nav > .carousel-slide-indicators');
  const slides = document.querySelector('.carousel-slides');

  if (window.innerWidth < 1080) {
    const slideHeight = slides.offsetHeight;
    if (slideHeight > 0) {
      // Height is valid, apply styles
      indicators.style.top = `${slideHeight + 40}px`; // Adjust position dynamically
      indicators.style.justifyContent = 'center';
    } else if (retries > 0) {
      // Retry after a short delay if height is not yet computed
      console.warn(`Retrying... Remaining attempts: ${retries}`);
      setTimeout(() => adjustIndicators(retries - 1), 1); // Retry after 1ms
    } else {
      console.error('Failed to compute slide height after multiple retries.');
    }
  } else {
    indicators.style.position = '';
    indicators.style.top = '';
    indicators.style.justifyContent = '';
  }
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

  let slideIndicators;
  if (!isSingleSlide) {
    const slideIndicatorsNav = document.createElement('nav');
    slideIndicators = document.createElement('ul');
    slideIndicators.classList.add('carousel-slide-indicators');
    slideIndicatorsNav.append(slideIndicators);
    slidesContainer.prepend(slideIndicatorsNav);

    const slideNavButtons = document.createElement('div');
    slideNavButtons.classList.add('carousel-navigation-buttons');
    slideNavButtons.innerHTML = `
      <button type="button" class= "slide-prev" aria-label="${placeholders.previousSlide || 'Previous Slide'}"></button>
      <button type="button" class="slide-next" aria-label="${placeholders.nextSlide || 'Next Slide'}"></button>
    `;

    slidesContainer.prepend(slideNavButtons);
  }

  carouselContainer.append(overview);
  carouselContainer.append(slidesContainer);
  block.append(slidesWrapper);

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

  adjustIndicators();
  window.addEventListener('resize', adjustIndicators);
}
