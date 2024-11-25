import { createOptimizedPicture } from '../../scripts/aem.js';

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
}
