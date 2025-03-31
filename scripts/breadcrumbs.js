import { nav, a, li, ul, strong } from './dom-helpers.js';
import { loadCSS } from './aem.js';
import { getRegionLocale } from '../../scripts/utils.js';

// eslint-disable-next-line import/prefer-default-export
export async function breadcrumbs() {
  loadCSS(`${window.hlx.codeBasePath}/styles/breadcrumbs.css`);
  const $breadcrumbs = nav({ class: 'breadcrumbs' });
  // todo: update breadcrumbs - just static HTML for now
  const [region, locale] = getRegionLocale();
  const homePath = `/${region}/${locale}`;
  const data = await fetchIndex(homePath);
  const { pathname } = window.location;
  const pathParts = pathname.split('/').filter((part) => part);
  let currentPath = '';
  const breadcrumbItems = [];
  function getPageNamesByPath(path) {
    return data.filter((page) => page.path === path).map((page) => page['title']);
  }

  const homeLink = a({ href: `${homePath}/` }, 'Ingredion');
  const homeCrumb = li(homeLink);
  const crumbList = ul(homeCrumb);
  
  pathParts.forEach((part, index) => {
    currentPath += `/${part}`;
    const pageNames = getPageNamesByPath(currentPath);
    if (pageNames.length === 0) return;

    const lastBreadcrumb = breadcrumbItems[breadcrumbItems.length - 1];
    const isParentSameAsChild = lastBreadcrumb && lastBreadcrumb.textContent === pageNames[0];

    if (isParentSameAsChild) {
      breadcrumbItems.pop();
    }

    pageNames.forEach((pageName, idx) => {
      const liEl = li();
      let link = a();

      // Set the href for all but the last part
      if (index < pathParts.length - 1 || idx < pageNames.length - 1) {
        link.setAttribute('href', currentPath);
      } else {
        link = strong();
      }

      link.textContent = pageName;
      liEl.appendChild(link);
      breadcrumbItems.push(liEl);
    });
  });

  // TODO: add more cases where breadcrumbs are not displayed
  if (breadcrumbItems.length > 0) {
    // Append all breadcrumb items to the container if there are more than one
    breadcrumbItems.forEach((item) => {
      crumbList.appendChild(item);
    });
  } else {
    $breadcrumbs.style.display = 'none';
  }

  $breadcrumbs.appendChild(crumbList);
  return $breadcrumbs;
}

async function fetchIndex(homePath) {
  // if (hh.breadcrumbs) {
  //   return hh.breadcrumbs;
  // }

  const indexPath = `${homePath}/indexes/global-index.json`;
  const request = await fetch(indexPath);
  if (request.ok) {
    const result = await request.json();
    const { data } = result;
    // hh.breadcrumbs = data;
    return data;
  }
  throw new Error('Failed to fetch workbook');
}