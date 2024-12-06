/* eslint-disable function-paren-newline, object-curly-newline */
import { nav, div, h2, a, img } from '../../scripts/dom-helpers.js';
import { getMetadata } from '../../scripts/aem.js';

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

  const $breadcrumbs = nav({ class: 'breadcrumbs' });
  // todo: update breadcrumbs - static HTML for now
  $breadcrumbs.innerHTML = `
    <ul>
      <li>
        <a href="/na/en-us.html">Ingredion <span class="icon-arrow-blk"></span></a>
      </li>
      <li>
        <a href="/na/en-us/news-events.html">News and events <span class="icon-arrow-blk"></span></a>
      </li>
      <li>
        <a href="/na/en-us/news-events/news.html">News <span class="icon-arrow-blk"></span></a>
      </li>
      <li>
        <b>Ingredion Launches VITESSENCE Pea 200 D, Shaking Up Drinking Experiences in Nutritional Beverages</b>
      </li>
    </ul>
  `;

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
        class: 'icon-linkedin',
        href: 'https://www.linkedin.com/cws/share?url=https://www.ingredion.com/content/ingredion-com/na/en-us/news-events/news/Pea-protein-improved-dispersibility-RTM-beverages.html',
        'aria-label': 'LinkedIn' },
      img({ src: '/icons/linkedin.svg', alt: 'LinkedIn' }),
      ),
    ),
    div({ class: 'line-break' }),
  );

  $main.prepend($hero);
  $content.prepend($header);
}
