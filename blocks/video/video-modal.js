/* eslint-disable function-paren-newline, object-curly-newline */
import { div, a } from '../../scripts/dom-helpers.js';
import { decorateBlock, loadBlock, loadCSS } from '../../scripts/aem.js';

/**
 * Opens a video modal using the /blocks/video block.
 * @param {string} videoUrl - The URL of the video to display.
 * @param {boolean} [autoplay=false] - Whether the video should autoplay.
 * @param {boolean} [background=false] - Whether the video should play in the background.
 */
// eslint-disable-next-line import/prefer-default-export
export async function openVideoModal(videoUrl, autoplay = false, background = false) {
  await loadCSS(`${window.hlx.codeBasePath}/blocks/video/video.css`);

  const blockClasses = ['video', 'block'];
  if (autoplay) {
    blockClasses.push('autoplay');
  }
  if (background) {
    blockClasses.push('background');
  }

  const videoBlock = div({ class: blockClasses.join(' '), 'data-block-name': 'video' },
    div(
      a({ href: videoUrl }, videoUrl),
    ),
  );

  const main = document.querySelector('main') || document.body;
  main.appendChild(videoBlock);

  decorateBlock(videoBlock);
  await loadBlock(videoBlock);
}
