import { div } from '../../scripts/dom-helpers.js';

function createCard(element) {
  const imageBlock = element[0];
  const cardHeading = element[1];
  const cardDescription = element[2];

  const offsetIconCard = document.createElement('div');
  offsetIconCard.classList.add('offset-icons-card');

  const imageContainer = document.createElement('div');
  imageContainer.classList.add('image-container');
  if (imageBlock) {
    imageContainer.append(imageBlock);
  }

  const contentBlock = document.createElement('div');
  contentBlock.classList.add('content-block');
  if (cardHeading) {
    contentBlock.append(cardHeading);
  }
  if (cardDescription) {
    contentBlock.append(cardDescription);
  }

  offsetIconCard.append(imageContainer);
  offsetIconCard.append(contentBlock);

  return offsetIconCard;
}

export default function decorate(block) {
  const rows = block.querySelectorAll(':scope > div > div');

  const offsetIconContainer = div(
    { class: 'offset-icons-list-wrapper' },
    div({ class: 'offset-icons-overview' }, rows[0]),
    div(
      { class: 'offset-icons-list' },
      ...Array.from(rows).slice(1).map((row) => {
        const children = Array.from(row.children);
        return createCard(children);
      }),
    ),
  );
  block.replaceChildren(offsetIconContainer);
}