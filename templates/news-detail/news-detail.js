/* eslint-disable function-paren-newline, object-curly-newline */
import { div, h2, a, img } from '../../scripts/dom-helpers.js';
import { getMetadata } from '../../scripts/aem.js';
import { breadcrumbs } from '../../scripts/breadcrumbs.js';

export default function decorate(doc) {
  const $main = doc.querySelector('main');
  const $picture = $main.querySelector('picture');
  const $hero = div({ class: 'hero' },
    $picture,
  );
  // const $content = Array.from(main.querySelectorAll('.default-content-wrapper *'));
  const $content = $main.querySelector('.default-content-wrapper');
  const teaserTitle = getMetadata('teaser-title');
  const teaserDescription = getMetadata('teaser-description');
  const type = getMetadata('type');
  const publishedDate = getMetadata('published-date');
  const categories = getMetadata('categories');
  const $breadcrumbs = breadcrumbs();

  const $header = div({ class: 'header' },
    $breadcrumbs,
    div({ class: 'type' }, type),
    h2(teaserTitle),
    div({ class: 'category-tags' },
      publishedDate,
      ' | ',
      categories,
    ),
    div({ class: 'description' }, teaserDescription),
    div({ class: 'social-share' },
      a({
        class: 'icon icon-linkedin',
        href: 'https://www.linkedin.com/cws/share?url=https://www.ingredion.com/content/ingredion-com/na/en-us/news-events/news/Pea-protein-improved-dispersibility-RTM-beverages.html',
        'aria-label': 'LinkedIn' },
      img({ src: '/icons/linkedin.svg', alt: 'LinkedIn' }),
      ),
    ),
    div({ class: 'line-break' }),
  );

  // center align ### paragraphs
  $content.querySelectorAll('p').forEach((p) => {
    if (p.textContent.trim() === '###') {
      p.classList.add('centered');
    }
  });

  $main.prepend($hero);
  $content.prepend($header);
}
