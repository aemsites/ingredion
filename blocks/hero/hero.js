import { getMetadata } from '../../scripts/aem.js';

export default async function decorate(block) {
  const templateType = getMetadata('template');
  /* if (templateType === 'homepage') {
    block.classList.add('homepage');
  } else */ if (templateType === 'category') {
    block.classList.add('category');
  } else if (templateType === 'news') {
    block.classList.add('news');
  }
}
