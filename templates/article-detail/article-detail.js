/* eslint-disable function-paren-newline, object-curly-newline */
import { div, a, img } from '../../scripts/dom-helpers.js';
import { getMetadata, createOptimizedPicture } from '../../scripts/aem.js';
import { breadcrumbs } from '../../scripts/breadcrumbs.js';

export default async function decorate(doc) {
  const $main = doc.querySelector('main');
  const $content = $main.querySelector('.default-content-wrapper');
  const title = getMetadata('title');
  const heroImg = getMetadata('og:image');
  const socialShare = getMetadata('social-share');
  const $breadcrumbs = await breadcrumbs();
  const picBreakpoints = [
    { media: '(min-width: 1080px)', width: '2000' },
    { media: '(min-width: 600px)', width: '800' },
    { width: '600' },
  ];

  // Create hero section
  const $hero = div({ class: 'hero' });
  const $picture = $main.querySelector('picture');

  if ($picture) {
    const pic = $picture.querySelector('img');
    const picOpt = createOptimizedPicture(pic.src, pic.alt, true, picBreakpoints);
    pic.replaceWith(picOpt);
    $hero.append($picture);
  } else if (heroImg) {
    $hero.append(createOptimizedPicture(heroImg, title, true, picBreakpoints));
  }

  // Create social share links
  const platformConfig = {
    facebook: {
      url: 'https://www.facebook.com/sharer/sharer.php',
      icon: '/icons/facebook.svg',
    },
    linkedin: {
      url: 'https://www.linkedin.com/cws/share',
      icon: '/icons/linkedin.svg',
    },
    x: {
      url: 'https://x.com/intent/tweet',
      icon: '/icons/x.svg',
    },
  };

  const socialShareLinks = socialShare.split(',')
    .map((platform) => {
      const platformKey = platform.trim().toLowerCase();
      const config = platformConfig[platformKey];

      if (!config) return null;

      return a({
        class: `icon icon-${platformKey}`,
        href: `${config.url}?url=${window.location.href}`,
        'aria-label': platformKey.charAt(0).toUpperCase() + platformKey.slice(1),
      },
      img({ src: config.icon, alt: platformKey.charAt(0).toUpperCase() + platformKey.slice(1) }));
    })
    .filter(Boolean);

  const $socialShare = div({ class: 'social-share' }, ...socialShareLinks);
  const $lineBreak = div({ class: 'line-break' });

  // Handle sections
  const $sections = Array.from($main.querySelectorAll('.section'));
  if ($sections.length) {
    $sections.forEach((section) => section.remove());
    const $container = div({ class: 'section-container' },
      $breadcrumbs,
      ...$sections,
    );
    $main.insertBefore($container, $hero.nextSibling);
  }

  // Add social share to article header
  const $articleHeader = $main.querySelector('.article-header-wrapper');
  if ($articleHeader) {
    $articleHeader.append($socialShare, $lineBreak);
  }

  // Center align paragraphs with ###
  $content.querySelectorAll('p').forEach((paragraph) => {
    if (paragraph.textContent.trim() === '###') {
      paragraph.classList.add('centered');
    }
  });

  $main.prepend($hero);

  // Add green line before author container
  const $authorContainer = $main.querySelector('.author-wrapper');
  if ($authorContainer) {
    const $lineBrekEnd = div({ class: 'line-break-end' });
    $authorContainer.prepend($lineBrekEnd);
  }

  //Move section with class name "outside-blog" outside of article blog section
  const $outsideBlog = Array.from($main.querySelectorAll('.outside-blog'));
  if ($outsideBlog.length) {
    $outsideBlog.forEach((section) => {
      $main.querySelector('.outside-blog').remove();
      $main.append(section);
    });
    // $main.querySelector('.outside-blog').remove();
    // $main.append($outsideBlog);
  }
}
