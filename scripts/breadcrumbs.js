import { nav } from './dom-helpers.js';
import { loadCSS } from './aem.js';

// eslint-disable-next-line import/prefer-default-export
export function breadcrumbs() {
  loadCSS(`${window.hlx.codeBasePath}/styles/breadcrumbs.css`);
  const $breadcrumbs = nav({ class: 'breadcrumbs' });
  // todo: update breadcrumbs - just static HTML for now
  $breadcrumbs.innerHTML = `
    <ul>
      <li>
        <a href="/na/en-us.html">Ingredion</a>
      </li>
      <li>
        <a href="/na/en-us/news-events.html">News and events</a>
      </li>
      <li>
        <a href="/na/en-us/news-events/news.html">News</a>
      </li>
      <li>
        <b>Ingredion Launches VITESSENCE Pea 200 D, Shaking Up Drinking Experiences in Nutritional Beverages</b>
      </li>
    </ul>
  `;

  return $breadcrumbs;
}
