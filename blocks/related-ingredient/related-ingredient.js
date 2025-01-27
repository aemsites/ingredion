import {
  div,
  span,
  p,
  button,
} from '../../scripts/dom-helpers.js';

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

  const contentContainer = div(
    { class: 'related-ingredient-content', tabIndex: 0 },
    div({ class: 'related-ingredient-text' }),
  );

  const buttonContainer = div({ class: 'related-ingredient-buttons' });
  const cartListNotificationContainer = div(
    { class: 'cart-list-notification' },
    div(
      { class: 'cart-list-notification-wrapper' },
      p('Product successfully added to cart!'),
      button({ class: 'cart-list-notification-undo icon-close' }, 'Undo'),
      button({ class: 'cart-list-notification-close icon-close' }),
    ),
  );

  block.appendChild(contentContainer);
  block.appendChild(buttonContainer);
  block.appendChild(cartListNotificationContainer);

  const textContainer = block.querySelector('.related-ingredient-text');
  const productName = block.querySelector('.related-ingredient.block h4');
  productName.classList.add('product-name');
  productName.setAttribute('tabIndex', 0);
  contentContainer.insertBefore(productName, textContainer);

  const children = Array.from(block.children);

  if (children[0].tagName === 'P' && children[1].tagName !== 'H3') {
    textContainer.appendChild(children[0]);
  } else {
    let currentChild = block.firstElementChild;
    let foundH3 = false;

    while (currentChild) {
      if (currentChild.classList.contains('button-container')) {
        break;
      }
      if (currentChild.tagName === 'H3') {
        foundH3 = true;
      }
      if (foundH3) {
        const nextSibling = currentChild.nextElementSibling;
        textContainer.appendChild(currentChild);
        currentChild = nextSibling;
      } else if (currentChild.tagName === 'P') {
        currentChild.classList.add('product-type');
        contentContainer.insertBefore(currentChild, textContainer);
        currentChild = block.firstElementChild;
      } else {
        currentChild = currentChild.nextElementSibling;
      }
    }
  }

  const buttons = block.querySelectorAll('.button-container');

  for (let i = 0; i < buttons.length; i += 1) {
    const link = buttons[i].querySelector(':scope > a');
    if (i < 2) {
      link.classList.add('icon');
      const spanClass = i === 1 ? 'icon-download' : 'icon-eye';
      const spanElement = span({ class: spanClass });
      if (i === 1) {
        link.download = '';
      }
      link.prepend(spanElement);
      contentContainer.appendChild(link);
    } else {
      if (i === 3) {
        link.classList.add('secondary');
      }
      buttonContainer.appendChild(link);
    }
    buttons[i].remove();
  }

  if (!document.querySelector('.section-related-ingredient-wrapper')) {
    const section = document.querySelector(
      '.section.related-ingredient-container',
    );
    const sectionWrapper = div({ class: 'section-related-ingredient-wrapper' });
    section.parentNode.insertBefore(sectionWrapper, section);
    sectionWrapper.appendChild(section);
  }
}
