import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const pic = block.querySelector('picture');
  const title = block.querySelector('h3');

  const textWrapper = title.closest('div');
  textWrapper.classList.add('callout-content');

  if (pic) {
    const picWrapper = pic.closest('div');
    picWrapper.classList.add('callout-image');

    const img = pic.querySelector('img');
    const optimizedPicture = createOptimizedPicture(
      img.src,
      img.alt, 
      false,
      [{ width: '750' }]
    );
    pic.replaceWith(optimizedPicture);
  }
}