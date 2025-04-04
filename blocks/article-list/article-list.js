/* eslint-disable function-call-argument-newline, max-len, function-paren-newline, object-curly-newline */
import { div, h3, h4, p, a } from '../../scripts/dom-helpers.js';
import { createOptimizedPicture, readBlockConfig } from '../../scripts/aem.js';
import { formatDate } from '../../scripts/utils.js';
import ArticleRenderer from './article-renderer.js';

export default async function decorate(block) {
  const isCards = block.classList.contains('cards');

  const {
    'article-data': jsonPath,
    'articles-per-page-options': articlesPerPageOptions,
    'pagination-max-buttons': paginationMaxBtns,
  } = readBlockConfig(block);

  const $search = div();
  const $sort = div();
  const $count = h3({ class: 'count' });
  const $pagination = div({ class: 'pagination' });
  const $perPage = div();
  const $filters = div();
  const $filterYears = div();
  const $filterTypes = div();
  const $articles = div({ class: 'articles' });

  let $articlePage;
  let $articleCard;

  if (isCards) {
    $articleCard = (article) => a({ class: 'card', href: article.path },
      a({ class: 'thumb', href: article.path },
        createOptimizedPicture(article.image, article.title, true, [{ width: '235' }]),
      ),
      div({ class: 'info' },
        article.type && p({ class: 'type' }, JSON.parse(article.type)[0]),
        h4(article.title),
        p({ class: 'date' }, formatDate(article.publishDate)),
        p(article.description),
        a({ class: 'arrow', href: article.path }, 'Learn More'),
      ),
    );

    $articlePage = div({ class: 'article-list' },
      div({ class: 'filter-search-sort' },
        $search,
        $filterTypes,
        $filterYears,
        $sort,
      ),
      div({ class: 'filter-results-wrapper' },
        div({ class: 'results cards' },
          $count,
          $articles,
          div({ class: 'controls' },
            $pagination,
            $perPage,
          ),
        ),
      ),
    );

    await new ArticleRenderer({
      jsonPath,
      articlesPerPageOptions,
      paginationMaxBtns,
      articleDiv: $articles,
      articleCard: $articleCard,
      filterYearsDiv: $filterYears,
      filterTypesDiv: $filterTypes,
      searchDiv: $search,
      sortDiv: $sort,
      paginationDiv: $pagination,
      perPageDiv: $perPage,
      countDiv: $count,
    }).render();

  } else {
    $articleCard = (article) => div({ class: 'card' },
      a({ class: 'thumb', href: article.path },
        createOptimizedPicture(article.image, article.title, true, [{ width: '235' }]),
      ),
      div({ class: 'info' },
        h4(article.title),
        p(article.description),
        p({ class: 'date' }, formatDate(article.publishDate)),
        a({ class: 'button', href: article.path }, 'Learn More'),
      ),
    );

    $articlePage = div({ class: 'article-list' },
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



  block.replaceWith($articlePage);


}
