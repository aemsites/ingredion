import { div } from '../../scripts/dom-helpers.js';
import { unwrapNestedDivs } from '../../scripts/scripts.js';

const widthConstant = [
  'tiny',
  'small',
  'medium',
  '',
];

export default function decorate(block) {
  unwrapNestedDivs(block);

  const classListArray = Array.from(block.classList);
  const imageWidth = widthConstant.find((width) => classListArray.includes(width));
  const centerAlign = classListArray.includes('center') ? 'center-align' : '';
  const children = Array.from(block.children);
  const imageContainer = div({ class: `section-width ${imageWidth} ${centerAlign}` });

  children.forEach((child) => {
    imageContainer.append(child);
  });

  block.insertBefore(imageContainer, block.firstElementChild);
}
