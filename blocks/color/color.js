import { div, h1, h3 } from '../../scripts/dom-helpers.js';

export default async function decorate(block) {
  // Function to recursively unwrap nested divs
  function unwrapNestedDivs(element) {
    const children = Array.from(element.children);
    children.forEach((child) => {
      if (child.tagName === 'DIV') {
        unwrapNestedDivs(child);
        while (child.firstChild) {
          element.insertBefore(child.firstChild, child);
        }
        element.removeChild(child);
      }
    });
  }
  unwrapNestedDivs(block);

  const quoteWrapper = div(
    { class: 'colorblock-quote-wrapper' },
    div({ class: 'heading heading-center' }, h1({ tabIndex: 0 })),
    div({ class: 'heading heading-center' }, h3({ tabIndex: 0 })),
    h3({ class: 'label-text label-text-center', tabIndex: 0 }),
  );

  block.insertBefore(quoteWrapper, block.firstElementChild);

  const mainHeading = document.querySelector('.colorblock-quote-wrapper .heading.heading-center h1');
  const firstSubheading = document.querySelector('.colorblock-quote-wrapper .heading.heading-center h3');
  const secondSubheading = document.querySelector('.colorblock-quote-wrapper .label-text.label-text-center');
  const paragraphs = document.querySelectorAll('.colorblock-quote-wrapper ~ p');

  if (paragraphs.length >= 3) {
    mainHeading.appendChild(paragraphs[0]);
    firstSubheading.appendChild(paragraphs[1]);
    secondSubheading.appendChild(paragraphs[2]);
  }
}
