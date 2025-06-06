import { loadFragment } from '../fragment/fragment.js';
import { getRegionLocale } from '../../scripts/utils.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const [region, locale] = getRegionLocale();
  const footerPath = `/${region}/${locale}/footer/footer`;
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) {
    if (fragment.firstElementChild.classList.contains('footer-utility')) {
      const li = fragment.firstElementChild.querySelector('li:last-child');
      const a = document.createElement('a');
      a.href = `javascript:void(0)`;
      a.textContent = li.textContent;
      li.textContent = '';
      a.setAttribute('onclick', 'truste.eu.clickListener()');
      li.append(a);
    }

    footer.append(fragment.firstElementChild);
  }

  block.append(footer);
}
