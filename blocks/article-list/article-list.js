/* eslint-disable function-call-argument-newline, max-len, function-paren-newline, object-curly-newline */
import { div, h3, h4, p, a, strong, span, button, img } from '../../scripts/dom-helpers.js';
import { createOptimizedPicture, readBlockConfig, loadCSS } from '../../scripts/aem.js';
import { formatDate } from '../../scripts/utils.js';
import { parseEventDate } from '../../scripts/product-utils.js';
import ArticleRenderer from './article-renderer.js';
import { openVideoModal } from '../video/video-modal.js';

loadCSS(`${window.hlx.codeBasePath}/blocks/video/video.css`);

export default async function decorate(block) {
  const {
    'article-data': jsonPath,
    'articles-per-page-options': articlesPerPageOptions,
    'pagination-max-buttons': paginationMaxBtns,
    filters: documentFilters,
  } = readBlockConfig(block);

  const $search = div();
  const $sortDropdown = div();
  const $count = h3({ class: 'count' });
  const $pagination = div({ class: 'pagination' });
  const $perPageDropdown = div();
  const $articles = div({ class: 'articles' });

  let $articlePage;

  if (block.classList.contains('cards')) {
    // cards view
    const $filterYearsDropdown = div();
    const $filterTypesDropdown = div();
    const $filterMarketsDropdown = div({ 'data-tag': 'Markets' }); // pass the tag
    const $clearFilters = a({ class: 'clear-all' }, 'Clear All');

    const $articleCard = (article) => a({ class: 'card', href: article.path },
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
        $filterTypesDropdown,
        $filterYearsDropdown,
        $filterMarketsDropdown,
        $sortDropdown,
      ),
      div({ class: 'clear-all-wrapper' }, $clearFilters),
      div({ class: 'filter-results-wrapper' },
        div({ class: 'results cards' },
          $count,
          $articles,
          div({ class: 'controls' },
            $pagination,
            $perPageDropdown,
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
      clearFilters: $clearFilters,
      filterYearsDropdown: $filterYearsDropdown,
      filterTypesDropdown: $filterTypesDropdown,
      filterByTagDropdown: $filterMarketsDropdown,
      searchDiv: $search,
      sortDropdown: $sortDropdown,
      paginationDiv: $pagination,
      perPageDropdown: $perPageDropdown,
      countDiv: $count,
      documentFilters,
    }).render();
  } else if (block.classList.contains('events')) {
    // Events view
    const $filterYearsDropdown = div();
    const $filterTypesDropdown = div();
    const $clearFilters = a({ class: 'clear-all' }, 'Clear All');

    const $articleCard = (article) => div({ class: 'card events' },
      div({ class: 'image-wrapper' },
        div({ class: 'thumb' },
          p({ class: 'type' }, JSON.parse(article.eventType)),
          createOptimizedPicture(article.image, article.title, true, [{ width: '235' }]),
        ),
      ),
      div({ class: 'info' },
        p({ class: 'date' }, parseEventDate(article.eventDate, true)),
        h4(article.title),
        article.eventType && JSON.parse(article.eventType).length ? p({ class: 'details' }, strong('Event Type: '), JSON.parse(article.eventType)) : null,
        article.location && JSON.parse(article.location).length ? p({ class: 'details' }, strong('Location: '), JSON.parse(article.location)) : null,
        article.boothNumber && JSON.parse(article.boothNumber).length ? p({ class: 'details' }, strong('Booth Number: '), JSON.parse(article.boothNumber)) : null,
        div({ class: 'description' }, JSON.parse(article.content)),
      ),
      div({ class: 'buttons' },
        (() => {
          if (article.watchNow && JSON.parse(article.watchNow).length) {
            return a({ class: 'button', href: JSON.parse(article.watchNow) }, 'Watch Now');
          } if (article.registrationEventSite && JSON.parse(article.registrationEventSite).length) {
            return a({ class: 'button', href: JSON.parse(article.registrationEventSite) }, 'Register');
          }
          return null;
        })(),
        a({ class: 'button secondary', href: article.path }, 'Go To Event Site'),
      ),
    );

    $articlePage = div({ class: 'article-list' },
      div({ class: 'filter-search-sort' },
        $search,
        $filterYearsDropdown,
        $filterTypesDropdown,
        $sortDropdown,
      ),
      div({ class: 'clear-all-wrapper' }, $clearFilters),
      div({ class: 'filter-results-wrapper' },
        div({ class: 'results events' },
          $count,
          $articles,
          div({ class: 'controls' },
            $pagination,
            $perPageDropdown,
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
      clearFilters: $clearFilters,
      filterYearsDropdown: $filterYearsDropdown,
      filterTypesDropdown: $filterTypesDropdown,
      searchDiv: $search,
      sortDropdown: $sortDropdown,
      paginationDiv: $pagination,
      perPageDropdown: $perPageDropdown,
      countDiv: $count,
    }).render();
  } else {
    // regular list view
    const $filtersList = div();

    const $articleCard = (article) => {
      const cardClasses = ['card'];
      let thumb = a({ class: 'thumb', href: article.path },
        createOptimizedPicture(article.image, article.title, true, [{ width: '235' }]),
      );
      let watchVideoBtn = '';
      let featuredTag = '';
      let externalLink = '';
      let ctaButton = a({ class: 'button', href: article.path }, 'Learn More');

      // If this is a video, override the click to open a modal on click
      const isVideo = article.tags && article.tags.includes('Resource Type / Video');

      if (isVideo && article['video-url']) {
        thumb = a({ class: 'thumb video', href: article.path },
          createOptimizedPicture(article['video-thumbnail'], article.title, true, [{ width: '235' }]),
          button({ class: 'play-button', 'aria-label': 'Play video' }, span({ class: 'icon-play-button' })),
        );
        // Open modal on click of thumb or play button
        const openVideoModalHandler = (e) => {
          e.preventDefault();
          openVideoModal(article['video-url'], true, false);
        };
        thumb.addEventListener('click', openVideoModalHandler);
        watchVideoBtn = a({ class: 'button secondary watch-video-btn', href: article.path }, 'Watch Video');
        watchVideoBtn.addEventListener('click', openVideoModalHandler);
      }

      // if redirect is not empty, card is a featured card
      const isFeatured = article.redirect && article.redirect.length > 0;
      if (isFeatured) {
        externalLink = img({ class: 'external-link-icon', src: '/icons/external-link.svg', alt: 'External Link' });
        featuredTag = p({ class: 'featured-tag' }, 'Featured Content');
        ctaButton = a({ class: 'button featured', href: article.redirect }, 'Access Insights');
        cardClasses.push('featured');
      }

      return div({ class: cardClasses.join(' ') },
        externalLink,
        thumb,
        div({ class: 'info' },
          featuredTag,
          h4(article.title),
          (() => {
            const descDiv = div({ class: 'description' });
            descDiv.innerHTML = article.description;
            return descDiv;
          })(),
          p({ class: 'date' }, formatDate(article.publishDate)),
          ctaButton,
          watchVideoBtn,
        ),
      );
    };

    $articlePage = div({ class: 'article-list' },
      div({ class: 'filter-search-sort' },
        $search,
        $sortDropdown,
      ),
      div({ class: 'filter-results-wrapper' },
        div({ class: 'filter' },
          $filtersList,
        ),
        div({ class: 'results' },
          $count,
          $articles,
          div({ class: 'controls' },
            $pagination,
            $perPageDropdown,
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
      filterTagsList: $filtersList,
      searchDiv: $search,
      sortDropdown: $sortDropdown,
      paginationDiv: $pagination,
      perPageDropdown: $perPageDropdown,
      countDiv: $count,
      documentFilters,
    }).render();
  }

  block.replaceWith($articlePage);
}
