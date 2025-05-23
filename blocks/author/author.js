/* eslint-disable function-paren-newline, object-curly-newline */
import { div, p, h1, h4, picture, img } from '../../scripts/dom-helpers.js';
import { unwrapNestedDivs } from '../../scripts/scripts.js';

const authorSpreadsheetPath = '/author/author-info.json';

export default async function decorate(block) {
  unwrapNestedDivs(block);

  const resp = await fetch(authorSpreadsheetPath);
  const authorsJson = await resp.json();
  const authorName = block.innerText.trim();
  const authorInformation = authorsJson.data.find(
    (item) => item.name === authorName,
  );

  const authorNameInBlock = block.querySelector('h4');
  const isAuthorNameH4 = authorNameInBlock !== null;
  block.innerHTML = '';
  if (isAuthorNameH4) {
    block.classList.add('static-author-block');
  }

  if (authorInformation) {
    const authorImageContainer = div(
      { class: 'author-bio-image' },
      picture(img({
        src: authorInformation.image,
        alt: `${authorInformation.name}`,
      })),
    );
    const authorTextContainer = div(
      { class: 'author-bio-text' },
      div({ class: 'heading', tabIndex: 0 }, isAuthorNameH4 ? h4(authorInformation.name) : h1(authorInformation.name)),
      authorInformation.designation && p({ class: 'designation', taxIndex: 0 }, authorInformation.designation),
      p({ class: 'body-text', taxIndex: 0 }, authorInformation.description),
    );

    block.appendChild(authorImageContainer);
    block.appendChild(authorTextContainer);
  }
}
