import { createOptimizedPicture } from '../../scripts/aem.js';

function setPreview(selectedPic) {
  const previewPic = selectedPic.cloneNode(true);
  const img = previewPic.querySelector('img');
  const optimized = createOptimizedPicture(
    img.src,
    img.alt,
    false,
    [{ width: '750' }],
  );
  previewPic.replaceWith(optimized);
  optimized.classList.add('gallery-preview');
  return optimized;
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

export default function decorate(block) {
  const allPics = block.querySelectorAll('picture');
  const h1 = block.querySelector('h1');
  const link = block.querySelector('a');

  const textWrapper = h1.closest('div');
  textWrapper.classList.add('gallery-content');

  textWrapper.insertAdjacentHTML(
    'beforeend',
    '<div class="button-container"><button class="button" title="Contact Us">Contact Us</button></div>',
  );
  textWrapper.addEventListener('click', () => {
    // open modal for contact us form
  });

  if (link) {
    const parentDiv = link.parentElement;
    const grandParent = parentDiv.parentElement;
    grandParent.insertBefore(link, parentDiv);
    parentDiv.remove();
    link.classList.remove('button');
    link.classList.add('text-link');
  }

  const firstPic = allPics[0];

  const optimizedPicture = setPreview(firstPic);
  const galleryWrapper = firstPic.closest('div');
  galleryWrapper.classList.add('gallery-images-container');
  galleryWrapper.prepend(optimizedPicture);

  const thumbnails = document.createElement('div');
  thumbnails.classList.add('gallery-thumbnails');
  galleryWrapper.append(thumbnails);

  allPics.forEach((image) => {
    thumbnails.append(image);
  });

  let galleryModal = document.createElement('div');
  updateModal(galleryModal, optimizedPicture);

  const modalImg = galleryModal.querySelector('.image-modal-container img');

  let zoomLevel = 1;
  const zoomStep = 0.1;
  const maxZoom = 3;
  const minZoom = 1;

  let preview = galleryWrapper.querySelector('.gallery-preview');
  allPics.forEach((image) => {
    image.addEventListener('click', () => {
      const newPreview = setPreview(image);
      galleryWrapper.querySelector('.gallery-preview').replaceWith(newPreview);
      newPreview.addEventListener('click', () => {
        zoomLevel = 1;
        const modalImg = galleryModal.querySelector('.image-modal-container img');
        modalImg.style.transform = `scale(${zoomLevel})`;
        updateModal(galleryModal, newPreview);
        block.append(galleryModal);
        const actionButtons = galleryModal.querySelector('.zoom-buttons-container');
        actionButtons.querySelector('.close').addEventListener('click', () => {
          galleryModal.remove();
          block.dataset.embedLoaded = false;
        });
        actionButtons.querySelector('.zoom-in').addEventListener('click', () => {
          console.log("aaaaa");
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
  preview.addEventListener('click', () => {
    zoomLevel = 1;
    modalImg.style.transform = `scale(${zoomLevel})`;
    block.append(galleryModal);
  });
  const actionButtons = galleryModal.querySelector('.zoom-buttons-container');
  actionButtons.querySelector('.close').addEventListener('click', () => {
    galleryModal.remove();
    block.dataset.embedLoaded = false;
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
}
