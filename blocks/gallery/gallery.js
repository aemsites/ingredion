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

  if (pic) {
    const picWrapper = pic.closest('div');
    picWrapper.classList.add('gallery-image');

    const img = pic.querySelector('img');
    const optimizedPicture = createOptimizedPicture(
      img.src,
      img.alt,
      false,
      [{ width: '750' }],
    );
    pic.replaceWith(optimizedPicture);
  }
}
