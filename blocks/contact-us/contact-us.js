import { div } from '../../scripts/dom-helpers.js';

export default async function decorate(block) {
  const rows = block.querySelectorAll(':scope > div > div');

  const contactBannerContainer = div(
    { class: 'contact-container-block' },
    div({ class: 'heading' }, rows[0]),
    div(
      { class: 'contact-banner-content' },
      div({ class: 'contact-banner-primary' }, rows[1]),
      div(
        { class: 'contact-banner-secondary' },
        ...Array.from(rows).slice(2),
      ),
    ),
  );
  block.replaceChildren(contactBannerContainer);
}
