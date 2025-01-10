/* eslint-disable function-call-argument-newline, max-len, function-paren-newline, object-curly-newline */
import { div, h3, h4, p, a } from '../../scripts/dom-helpers.js';
import { createOptimizedPicture, getMetadata } from '../../scripts/aem.js';
import { formatDate } from '../../scripts/utils.js';
import { breadcrumbs } from '../../scripts/breadcrumbs.js';
import ArticleRenderer from './article-renderer.js';

export default async function decorate(doc) {
  const $mainSection = doc.querySelector('main .section');
  const jsonPath = getMetadata('article-data');
  const articlesPerPageOptions = getMetadata('articles-per-page-options');
  const paginationMaxBtns = Number(getMetadata('pagination-max-buttons'));
  const $breadcrumbs = breadcrumbs();
  const $search = div();
  const $sort = div();
  const $count = h3({ class: 'count' });
  const $pagination = div({ class: 'pagination' });
  const $perPage = div();
  const $filters = div();
  const $articles = div({ class: 'articles' });
  const $articleCard = (article) => div({ class: 'card' },
    a({ class: 'thumb', href: article.path },
      createOptimizedPicture(article.image, article.title, true, [{ width: '235' }]),
    ),
    div({ class: 'info' },
      h4(article.title),
      p(article.description),
      p(formatDate(article.publishDate)),
      a({ class: 'button', href: article.path }, 'Learn More'),
    ),
  );

  const $articlePage = div({ class: 'article-list' },
    $breadcrumbs,
    div({ class: 'filter-search-sort' },
      $search,
      $sort,
    ),
    div({ class: 'filter-results-wrapper' },
      div({ class: 'filter' },
        $filters,
      ),
      div({ class: 'results' },
        $count,
        $articles,
        div({ class: 'controls' },
          $pagination,
          $perPage,
        ),
      ),
    ),
  );

  $mainSection.append($articlePage);

  await new ArticleRenderer({
    jsonPath,
    articlesPerPageOptions,
    paginationMaxBtns,
    articleDiv: $articles,
    articleCard: $articleCard,
    filterDiv: $filters,
    searchDiv: $search,
    sortDiv: $sort,
    paginationDiv: $pagination,
    perPageDiv: $perPage,
    countDiv: $count,
  }).render();
}
