/* eslint-disable function-paren-newline, object-curly-newline */
import { breadcrumbs } from '../../scripts/breadcrumbs.js';

export default async function decorate(block) {
  const isHide = block.classList.contains('hide');
  const $breadcrumbs = await breadcrumbs(isHide);
  block.replaceWith($breadcrumbs);
}
