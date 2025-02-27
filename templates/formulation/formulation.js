/* eslint-disable function-paren-newline, object-curly-newline */
import { div, h2, h1, p, a } from '../../scripts/dom-helpers.js';
import { getMetadata, createOptimizedPicture } from '../../scripts/aem.js';

function setPreview(selectedPic) {
  const previewPic = selectedPic.cloneNode(true);
  previewPic.classList.add('preview');
  return previewPic;
}

function updateModal(modal, pic) {
  modal.innerHTML = `<div class="gallery-modal">
    <div class="image-modal-container">
      ${pic.innerHTML}
    </div>
    <div class="zoom-buttons-container">
      <button class="zoom-in">+</button>
      <button class="zoom-out">-</button>
      <button class="close">X</button>
    </div>
  </div>`;
}

export default function decorate(doc) {
  const main = doc.querySelector('main');
  const title = getMetadata('og:title');
  const formulation = getMetadata('formulation');
  const description = getMetadata('description');
  const ingredientName = getMetadata('ingredient');
  const ingredientHref = getMetadata('ingredient-link');
  const image = getMetadata('og:image');
  const nutritionFacts = getMetadata('nutrition');
  const headingSection = main.querySelector('.heading-section');

  // --- HEADING SECTION
  const headingWrapper = div(
    { class: 'heading-wrapper' },
  );
  headingSection.append(headingWrapper);

  const headingTextSection = div(
    { class: 'heading-text' },
    h1({ tabIndex: 0 }, title),
    h2({ tabIndex: 0 }, formulation),
    p({ tabIndex: 0 }, description),
    a({ tabIndex: 0, href: ingredientHref }, ingredientName),
  );

  headingTextSection.insertAdjacentHTML(
    'beforeend',
    '<div class="button-container"><button class="button" title="Contact Us">Contact Us</button></div>',
  );
  headingTextSection.addEventListener('click', () => {
    // open modal for contact us form
  });
  headingWrapper.append(headingTextSection);

  const headingGallerySection = div(
    { class: 'heading-images' },
  );

  const mainImage = createOptimizedPicture(image, '', false, [{ width: '750' }]);
  const nutritionFactsImage = createOptimizedPicture(nutritionFacts, '', false, [{ width: '750' }]);

  const previewImage = mainImage.cloneNode(true);
  previewImage.classList.add('preview');

  headingGallerySection.prepend(previewImage);

  const thumbnails = document.createElement('div');
  thumbnails.classList.add('thumbnails');
  headingGallerySection.append(thumbnails);

  thumbnails.append(mainImage, nutritionFactsImage);

  const galleryModal = document.createElement('div');
  updateModal(galleryModal, mainImage);

  const modalImage = galleryModal.querySelector('.image-modal-container img');

  let zoomLevel = 1;
  const zoomStep = 0.1;
  const maxZoom = 3;
  const minZoom = 1;

  Array.from(thumbnails.children).forEach((img) => {
    img.addEventListener('click', () => {
      const newPreview = setPreview(img);
      headingGallerySection.querySelector('.preview').replaceWith(newPreview);

      newPreview.addEventListener('click', () => {
        zoomLevel = 1;
        updateModal(galleryModal, newPreview);

        const modalImg = galleryModal.querySelector('.image-modal-container img');
        modalImg.style.transform = `scale(${zoomLevel})`;

        main.append(galleryModal);

        const actionButtons = galleryModal.querySelector('.zoom-buttons-container');
        actionButtons.querySelector('.close').addEventListener('click', () => {
          galleryModal.remove();
          main.dataset.embedLoaded = false;
        });

        actionButtons.querySelector('.zoom-in').addEventListener('click', () => {
          if (zoomLevel < maxZoom) {
            zoomLevel += zoomStep;
            modalImg.style.transform = `scale(${zoomLevel})`;
          }
        });

        actionButtons.querySelector('.zoom-out').addEventListener('click', () => {
          if (zoomLevel > minZoom) {
            zoomLevel -= zoomStep;
            modalImg.style.transform = `scale(${zoomLevel})`;
          }
        });
      });
    });
  });

  previewImage.addEventListener('click', () => {
    zoomLevel = 1;
    modalImage.style.transform = `scale(${zoomLevel})`;
    main.append(galleryModal);
  });
  const actionButtons = galleryModal.querySelector('.zoom-buttons-container');
  actionButtons.querySelector('.close').addEventListener('click', () => {
    galleryModal.remove();
    main.dataset.embedLoaded = false;
  });
  actionButtons.querySelector('.zoom-in').addEventListener('click', () => {
    if (zoomLevel < maxZoom) {
      zoomLevel += zoomStep;
      modalImage.style.transform = `scale(${zoomLevel})`;
    }
  });
  actionButtons.querySelector('.zoom-out').addEventListener('click', () => {
    if (zoomLevel > minZoom) {
      zoomLevel -= zoomStep;
      modalImage.style.transform = `scale(${zoomLevel})`;
    }
  });

  headingWrapper.append(headingGallerySection);

  // --- FORMULATION INSTRUCTIONS
  const instructionsSection = main.querySelector('.instructions-section');
  const instructionsWrapper = document.createElement('div');
  instructionsWrapper.classList.add('instructions-wrapper');
  const leftColumnSection = main.querySelectorAll('.column-left');
  const rightColumnSection = main.querySelectorAll('.column-right');
  instructionsWrapper.append(...leftColumnSection, ...rightColumnSection);
  instructionsSection.append(instructionsWrapper);
}
