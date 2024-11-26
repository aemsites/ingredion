import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const pic = block.querySelector('picture');
  const title = block.querySelector('h3');
  const description = block.querySelector('p');
  const link = block.querySelector('a');

  console.log(title);
  console.log(description);
  console.log(pic);
  console.log(link);

  const textWrapper = title.closest('div');
  textWrapper.classList.add('callout-content');

  const picWrapper = pic.closest('div');
  picWrapper.classList.add('callout-image');

   // Optimize the picture
  const img = pic.querySelector('img'); // Get the image inside the picture
  const optimizedPicture = createOptimizedPicture(
    img.src,  // Image source
    img.alt,  // Image alt text
    false,    // Use default lazy-loading behavior
    [{ width: '750' }] // Specify widths for optimization (adjust as needed)
  );
  pic.replaceWith(optimizedPicture); // Replace the original picture with the optimized one 

  // flexContainer.appendChild(textWrapper);
  console.log(block);
  console.log(block.innerHTML)
  // block.appendChild(picWrapper);
}