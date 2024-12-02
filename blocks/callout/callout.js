import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const pic = block.querySelector('picture');
  const title = block.querySelector('h3');
  const link = block.querySelector('a');

  const textWrapper = title.closest('div');
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
