/* eslint-disable function-paren-newline, object-curly-newline */
import { div, ul, li, a } from '../../scripts/dom-helpers.js';
import { createOptimizedPicture } from '../../scripts/aem.js';

const isMobile = window.matchMedia('(width < 1080px)');

export default function decorate(block) {
  const $list = ul({ class: 'list' });
  const $items = div({ class: 'items' });

  [...block.children].forEach((row, rowI) => {
    const $item = div({ class: 'item' });

    // set first as active
    if (rowI === 0) $item.classList.add('active');

    [...row.children].forEach((col, colI) => {
      // optimized image
      const img = col.querySelector('img');
      if (img) {
        const newImg = createOptimizedPicture(img.src, 'alt', true, [{ width: '400px' }]);
        img.replaceWith(newImg);
      }

      if (colI === 0) {
        const $section = li({ 'data-item': rowI }, col.textContent);

        // Add "active" class to the first <li>
        if (rowI === 0) $section.classList.add('active');

        // Add click event to $section
        $section.addEventListener('click', () => {
          // remove "active" item
          [...$items.children].forEach((item) => item.classList.remove('active'));
          [...$list.children].forEach((listItem) => listItem.classList.remove('active'));

          // add "active" item
          const matchingItem = $items.querySelector(`.item[data-item="${rowI}"]`);
          matchingItem.classList.add('active');
          $section.classList.add('active');
        });

        $list.append($section);
      } else {
        $item.append(col);
      }

      // Set item attribute to row index
      $item.setAttribute('data-item', rowI);
    });

    $items.append($item);
  });

  block.innerHTML = '';
  block.append($list, $items);
}
