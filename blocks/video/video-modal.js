import { div, a } from '../../scripts/dom-helpers.js';
import { decorateBlock, loadBlock, loadCSS } from '../../scripts/aem.js';

/**
 * Opens a video modal using the /blocks/video block.
 * @param {string} videoUrl - The URL of the video to display.
 */
// eslint-disable-next-line import/prefer-default-export
export async function openVideoModal(videoUrl) {
  await loadCSS(`${window.hlx.codeBasePath}/blocks/video/video.css`);

  const videoBlock = div({ class: 'video block autoplay', 'data-block-name': 'video' },
    div(
      a({ href: videoUrl }, videoUrl),
    )
  );

  const main = document.querySelector('main') || document.body;
  main.appendChild(videoBlock);

  decorateBlock(videoBlock);
  await loadBlock(videoBlock);
}
