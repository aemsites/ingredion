import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const pic = block.querySelector('picture');
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

  const galleryWrapper = pic.closest('div');
  galleryWrapper.classList.add('gallery-images-container');

  const img = pic.querySelector('img');
  const optimizedPicture = createOptimizedPicture(
    img.src,
    img.alt,
    false,
    [{ width: '750' }],
  );
  optimizedPicture.classList.add('gallery-preview');
  pic.replaceWith(optimizedPicture);

  const imageModal = document.createElement('div');
  imageModal.innerHTML = `<div class="gallery-modal">
    <div class="image-modal-container">
      ${optimizedPicture.innerHTML}
    </div>
    <div class="zoom-buttons-container">
      <button class="zoom-in">+</button>
      <button class="zoom-out">-</button>
      <button class="close">X</button>
    </div>
  </div>`;

  optimizedPicture.addEventListener('click', () => {
    block.append(imageModal);
  });
  const actionButtons = imageModal.querySelector('.zoom-buttons-container');
  actionButtons.querySelector('.close').addEventListener('click', () => {
    imageModal.remove();
    block.dataset.embedLoaded = false;
  });
}
