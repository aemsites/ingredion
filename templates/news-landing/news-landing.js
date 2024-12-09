/* eslint-disable function-call-argument-newline */
/* eslint-disable max-len */
/* eslint-disable function-paren-newline, object-curly-newline */
import { div, h4, p, a } from '../../scripts/dom-helpers.js';
import { createOptimizedPicture, getMetadata } from '../../scripts/aem.js';
import ArticleList from '../../scripts/article-list.js';

export default async function decorate(doc) {
  const $page = doc.querySelector('main .section');

  const articlesPerPage = Number(getMetadata('articles-per-page'));
  const paginationMaxBtns = Number(getMetadata('pagination-max-buttons'));
  const $pagination = div({ class: 'pagination' });
  const $count = div({ class: 'count' }, '# of articles');
  const $filters = div();
  const $newsArticles = div({ class: 'articles' });

  const $newsCard = (article) => div({ class: 'card' },
    a({ class: 'thumb', href: article.path },
      createOptimizedPicture(article.image, article.title, true, [{ width: '235' }]),
    ),
    div({ class: 'info' },
      h4(article.title),
      p(article.description),
      p(article.publisheddate),
      a({ class: 'button', href: article.path }, 'Learn More'),
    ),
  );

  const $filter = div({ class: 'filter' },
    h4('Filter Options'),
    $filters,
  );

  const $newsPage = div({ class: 'news-page' },
    div({ class: 'article-list' },
      $filter,
      div({ class: 'articles' },
        $count,
        $newsArticles,
        $pagination,
      ),
    ),
  );

  $page.append(
    $newsPage,
  );

  await new ArticleList({
    jsonPath: '/na/en-us/index-news-temp.json',
    articleContainer: $newsArticles,
    articleCard: $newsCard,
    articlesPerPage,
    paginationContainer: $pagination,
    paginationMaxBtns,
    categoryContainer: $filters,
    categoryPath: '/news/category/',
  }).render();
}
