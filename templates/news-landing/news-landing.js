/* eslint-disable function-call-argument-newline */
/* eslint-disable max-len */
/* eslint-disable function-paren-newline, object-curly-newline */
import { div, h3, h4, p, a } from '../../scripts/dom-helpers.js';
import { createOptimizedPicture, getMetadata } from '../../scripts/aem.js';
import { breadcrumbs } from '../../scripts/breadcrumbs.js';
import ArticleList from '../../scripts/article-list.js';

export default async function decorate(doc) {
  const $page = doc.querySelector('main .section');
  const theme = getMetadata('theme');
  const articlesPerPage = getMetadata('articles-per-page');
  const paginationMaxBtns = Number(getMetadata('pagination-max-buttons'));
  const $breadcrumbs = breadcrumbs();
  const $pagination = div({ class: 'pagination' });
  const $count = h3({ class: 'count' });
  const $perPage = div({ class: 'per-page select-dropdown' });
  const $filters = div();
  const $newsArticles = div({ class: 'articles' });


  const $newsCard = (article) => div({ class: 'card' },
    a({ class: 'thumb', href: article.path },
      createOptimizedPicture(article.image, article.title, true, [{ width: '235' }]),
    ),
    div({ class: 'info' },
      h4(article.publishDate + article.title),
      p(article.description),
      p(article.publisheddate),
      a({ class: theme === 'list-style' ? 'button' : 'link', href: article.path }, 'Learn More'),
    ),
  );

  const $newsPage = div({ class: 'article-list' },
    $breadcrumbs,
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

  await new ArticleList({
    jsonPath: '/na/en-us/indexes/news-index-dummy.json',
    articleContainer: $newsArticles,
    articleCard: $newsCard,
    articlesPerPage,
    paginationContainer: $pagination,
    paginationMaxBtns,
    filterContainer: $filters,
    countContainer: $count,
    perPageContainer: $perPage,
  }).render();
}
