/* eslint-disable function-paren-newline, object-curly-newline */
import { div, ul, li } from '../../scripts/dom-helpers.js';
import { createOptimizedPicture } from '../../scripts/aem.js';

const isMobile = window.matchMedia('(width < 1080px)');

function buildSubMenu(block) {
  const $navList = ul({ class: 'nav-list', 'data-height': '' });
  const $navItems = div({ class: 'nav-items' });

  const removeActiveItem = () => {
    [...$navItems.children].forEach((item) => item.classList.remove('active'));
    [...$navList.children].forEach((listItem) => listItem.classList.remove('active'));
  };

  const setActiveItem = (row, rowN) => {
    removeActiveItem();
    row.classList.add('active');
    const matchingItem = $navItems.querySelector(`.item[data-item="${rowN}"]`);
    if (matchingItem) matchingItem.classList.add('active');
  };

  [...block.children].forEach((row, rowN) => {
    const $item = div({ class: 'item', 'data-item': rowN });

    // set first item as active
    if (rowN === 0) $item.classList.add('active');

    [...row.children].forEach((col, colN) => {
      // replace image with optimized version
      const img = col.querySelector('img');
      if (img) {
        const newImg = createOptimizedPicture(img.src, img.alt || 'image', false, [{ width: '400' }]);
        img.replaceWith(newImg);
      }

      if (colN === 0) {
        // build section list
        const $section = li({ 'data-item': rowN }, col.textContent);
        $section.addEventListener('click', () => setActiveItem($section, rowN));
        // set first item as active
        if (rowN === 0) $section.classList.add('active');
        $navList.append($section);
      } else {
        col.setAttribute('data-height', '');
        $item.append(col);
      }
    });

    $navItems.append($item);
  });

  block.innerHTML = '';
  block.append($navList, $navItems);
}
export default function decorate(block) {
  // set height
  // const heightClass = [...block.classList].find((c) => c.startsWith('height-'));
  // if (heightClass) block.style.height = heightClass.slice(7);

  if (block.classList.contains('submenu')) buildSubMenu(block);
}
