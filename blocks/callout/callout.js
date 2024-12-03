import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const pic = block.querySelector('picture');
  const h3 = block.querySelector('h3');
  const h1 = block.querySelector('h1');
  const link = block.querySelector('a');

  let textWrapper;

  if (h1) {
    textWrapper = h1.closest('div');
  } else if (h3) {
    textWrapper = h3.closest('div');
  }

  textWrapper.classList.add('callout-content');

  if (!block.classList.contains('transparent')) {
    link.classList.add('transparent');
  }

  if (pic) {
    const picWrapper = pic.closest('div');
    picWrapper.classList.add('callout-image');

    const img = pic.querySelector('img');
    const optimizedPicture = createOptimizedPicture(
      img.src,
      img.alt,
      false,
      [{ width: '750' }],
    );
    pic.replaceWith(optimizedPicture);
  } else {
    block.classList.add('text-only');
  }
}
