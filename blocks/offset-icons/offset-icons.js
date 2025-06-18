import { div } from '../../scripts/dom-helpers.js';

export default function decorate(block) {
  const rows = block.querySelectorAll(':scope > div > div');

  const offsetIconContainer = div(
    { class: 'offset-icons-list-wrapper' },
    div({ class: 'offset-icons-overview' }, rows[0]),
    div(
      { class: 'offset-icons-list' },
      ...Array.from(rows).slice(1).map((row) => {
        const children = Array.from(row.children);
        return div({class: 'offset-icons-card' }, ...children);
      }),
    ),
  );
  block.replaceChildren(offsetIconContainer);
}
