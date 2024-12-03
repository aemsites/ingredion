import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const pic = block.querySelector('picture');
  if (pic) {
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
