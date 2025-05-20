import { div, h2 } from '../../scripts/dom-helpers.js';

export default function decorate(block) {
  const newBlock = div();
  [...block.children].forEach(row => {
    const [rowTitle, content] = [...row.children];
    const cssClass = rowTitle.textContent.toLowerCase().replace(/\s+/g, '-');
    if (content.textContent.trim()) {
        if (cssClass === 'title') {
            newBlock.append(h2(content.firstElementChild || content));
        } else {
            newBlock.append(div({ class: cssClass }, content.firstElementChild || content));
        }
    }
  });
  block.replaceWith(newBlock);
}
