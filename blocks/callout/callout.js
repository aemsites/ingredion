import { createOptimizedPicture } from '../../scripts/aem.js';
import { openVideoModal } from '../video/video-modal.js';
import { setAriaLabelForSM } from '../../scripts/scripts.js';

const themeColors = [
  'blue',
  'teal',
  'green',
  'orange',
  'red',
  'lilac',
  'purple',
  'dark-purple',
  'dark-blue',
  'yellow',
  'pastel-green',
];

const circleColors = [
  'circle-blue',
  'circle-teal',
  'circle-green',
  'circle-orange',
  'circle-red',
  'circle-lilac',
  'circle-purple',
  'circle-dark-purple',
  'circle-dark-blue',
  'circle-yellow',
  'circle-pastel-green',
  'circle-white',
];

export default function decorate(block) {
  const pic = block.querySelector('picture');
  const h3 = block.querySelector('h3');
  const h2 = block.querySelector('h2');
  const h1 = block.querySelector('h1');
  const linkElement = block.querySelector('a[href*="youtube.com"], a[href*="youtu.be"], a[href*="vimeo.com"]');
  const videoLink = linkElement ? linkElement.href : null;

  // This line selects the first paragraph or unordered list element within the block
  // It uses a CSS selector with the :first-of-type pseudo-class to get the first paragraph
  // or alternatively selects a ul element if it exists instead
  // This element will be used as the text content for the callout when no header is present
  const textElement = block.querySelector('p:first-of-type, ul');

  if (block.classList.contains('full-width')) {
    block.parentElement.classList.add('full-width');
  }

  const header = h1 ?? h2 ?? h3;

  // Add aria-label to super scripted SM text
  const textSM = header.querySelector('sup');
  if (textSM) setAriaLabelForSM(textSM);

  const textWrapper = header ? header.closest('div') : textElement.closest('div');
  textWrapper.classList.add('callout-content');

  const classListArray = Array.from(block.classList);

  const themeColor = themeColors.find((color) => classListArray.includes(color));
  const hasThemeColor = !!themeColor;
  if (!hasThemeColor) {
    block.classList.add('default');
  } else if (linkElement) {
    linkElement.classList.add('transparent'); // apply transparent button style
  }

  if (themeColor === 'green') {
    block.querySelectorAll('a').forEach((a) => {
      a.style.color = 'var(--white)';
    });
  }

  if (pic) {
    const picWrapper = pic.closest('div');
    picWrapper.classList.add('callout-image');

    const circleColor = circleColors.find((color) => classListArray.includes(color));

    if (circleColor) {
      const circleAssetContainer = document.createElement('div');
      circleAssetContainer.classList.add('circle-asset');
      circleAssetContainer.classList.add(circleColor);
      textWrapper.append(circleAssetContainer);
      block.classList.remove(circleColor);
    }

    const img = pic.querySelector('img');
    const optimizedPicture = createOptimizedPicture(
      img.src,
      img.alt,
      false,
      [{ width: '750' }],
    );
    pic.replaceWith(optimizedPicture);

    if (block.classList.contains('video')) {
      block.dataset.embedLoaded = false;
      const autoplay = block.classList.contains('autoplay');
      picWrapper.classList.add('placeholder');

      if (!autoplay) {
        picWrapper.insertAdjacentHTML(
          'beforeend',
          '<div class="video-placeholder-play"><button type="button" class="button play" title="Play"></button></div>',
        );
        picWrapper.addEventListener('click', () => {
          if (videoLink) {
            openVideoModal(videoLink, true, false);
          }
        });
      }
      if (linkElement) {
        linkElement.remove();
      }
    }
  } else {
    block.classList.add('text-only');
  }
}
