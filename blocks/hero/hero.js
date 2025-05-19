import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const picContainer = block.querySelector(':scope > div');
  const desktopPic = picContainer.querySelector('picture');
  const desktopImg = desktopPic.querySelector('img');
  const alt = block.querySelector(':scope > div:nth-child(2)').textContent.trim().slice(0, 125);

  // get mobilePic and its img/src
  const mobilePic = block.querySelectorAll('picture')[1];
  const mobileImg = mobilePic ? mobilePic.querySelector('img') : null;

  // Remove the mobile row from DOM if it exists
  Array.from(block.children).forEach((row) => {
    if (row.children.length >= 2) {
      const firstCell = row.children[0];
      if (firstCell.textContent.trim().toLowerCase() === 'mobile image') {
        row.remove();
      }
    }
  });

  const mobileBreakpoint = window.matchMedia('(max-width: 768px)');

  function onResize(e) {
    const currentPic = picContainer.querySelector('picture');
    let newPic;
    if (e.matches && mobileImg) {
      // mobile view with mobile image
      newPic = createOptimizedPicture(mobileImg.src, mobileImg.alt || alt, false, [{ width: '800' }]);
    } else if (e.matches) {
      // desktop view with desktop image
      newPic = createOptimizedPicture(desktopImg.src, desktopImg.alt || alt, false, [{ width: '800' }]);
    } else {
      // desktop image for both
      newPic = createOptimizedPicture(desktopImg.src, desktopImg.alt || alt, false, [
        { media: '(min-width: 1080px)', width: '2000' },
        { media: '(min-width: 768px)', width: '1000' },
      ]);
    }
    currentPic.replaceWith(newPic);
  }

  mobileBreakpoint.addEventListener('change', onResize);
  onResize(mobileBreakpoint);
}
