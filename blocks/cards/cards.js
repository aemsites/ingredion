import { createOptimizedPicture } from '../../scripts/aem.js';

const isDesktop = window.matchMedia('(width >= 1280px)');

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-card-image';
        const imageAnchor = document.createElement('a');
        const picture = div.querySelector('picture');
        imageAnchor.append(picture);
        div.append(imageAnchor);
      } else div.className = 'cards-card-body';
    });
    const btnContainers = li.querySelectorAll('.button-container');
    if (btnContainers) {
      btnContainers.forEach((btnContainer, index) => {
        if (btnContainers.length === 1 || index > 0) {
          const a = btnContainer.querySelector('a');
          const span = document.createElement('span');
          span.className = 'icon-green-arrow';
          a.append(span);
          const imageAnchor = li.querySelector('.cards-card-image a');
          imageAnchor.href = a.href;
          imageAnchor.setAttribute('aria-label', a.href);
          btnContainer.classList.add('secondary-cta');
        } else {
          btnContainer.classList.add('heading');
        }
        btnContainer.classList.remove('button-container');
      });
    }
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
  block.textContent = '';
  block.append(ul);
  if (block.classList.contains('slim')) {
  // Create dots navigation
    const dotsNav = document.createElement('div');
    dotsNav.className = 'dots-nav';
    [...ul.children].forEach((_, index) => {
      const dot = document.createElement('span');
      dot.className = 'dot';
      if (index === 0) dot.classList.add('active');
      dot.dataset.index = index;
      dotsNav.append(dot);
      dotsNav.addEventListener('click', (e) => {
        if (e.target.classList.contains('dot')) {
          let i;
          const n = parseInt(e.target.dataset.index, 10);
          const slides = ul.children;
          const dots = dotsNav.children;
          for (i = 0; i < slides.length; i += 1) {
            slides[i].style.display = 'none';
          }
          for (i = 0; i < dots.length; i += 1) {
            dots[i].className = dots[i].className.replace(' active', '');
          }
          slides[n].style.display = 'block';
          dots[n].className += ' active';
        }
      });
    });
    block.append(dotsNav);
  }
  isDesktop.addEventListener('change', () => {
    requestAnimationFrame(window.location.reload());
  });
}
