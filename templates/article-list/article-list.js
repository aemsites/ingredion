/* eslint-disable function-call-argument-newline */
/* eslint-disable max-len */
/* eslint-disable function-paren-newline, object-curly-newline */
import { div, h3, h4, p, a } from '../../scripts/dom-helpers.js';
import { createOptimizedPicture, getMetadata } from '../../scripts/aem.js';
import { formatDate } from '../../scripts/utils.js';
import { breadcrumbs } from '../../scripts/breadcrumbs.js';
import ArticleRenderer from './article-renderer.js';

export default async function decorate(doc) {
  const $page = doc.querySelector('main .section');
  const theme = getMetadata('theme');
  const articlesPerPage = getMetadata('articles-per-page');
  const paginationMaxBtns = Number(getMetadata('pagination-max-buttons'));
  const $breadcrumbs = breadcrumbs();
  const $search = div();
  const $sort = div();
  const $count = h3({ class: 'count' });
  const $pagination = div({ class: 'pagination' });
  const $perPage = div();
  const $filters = div();
  const $newsArticles = div({ class: 'articles' });
  const $newsCard = (article) => div({ class: 'card' },
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

  const $newsPage = div({ class: 'article-list' },
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
        $newsArticles,
        div({ class: 'controls' },
          $pagination,
          $perPage,
        ),
      ),
    ),
  );

  $page.append($newsPage);

  await new ArticleRenderer({
    jsonPath: '/na/en-us/indexes/news-index-dummy.json',
    articlesPerPage,
    paginationMaxBtns,
    articleDiv: $newsArticles,
    articleCard: $newsCard,
    filterDiv: $filters,
    searchDiv: $search,
    sortDiv: $sort,
    paginationDiv: $pagination,
    perPageDiv: $perPage,
    countDiv: $count,
  }).render();
}
