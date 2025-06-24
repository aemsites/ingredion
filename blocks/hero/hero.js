import { createOptimizedPicture } from '../../scripts/aem.js';

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
  const picContainer = block.querySelector(':scope > div');
  const desktopPic = picContainer.querySelector('picture');
  const desktopImg = desktopPic.querySelector('img');
  const alt = block.querySelector(':scope > div:nth-child(2)').textContent.trim().slice(0, 125);
  const mobilePic = block.querySelectorAll('picture')[1];
  const mobileBreakpoint = window.matchMedia('(max-width: 768px)');
  const classListArray = Array.from(block.classList);
  const circleColor = circleColors.find((color) => classListArray.includes(color));

  // remove mobile row from DOM
  Array.from(block.children).forEach((row) => {
    if (row.children.length >= 2) {
      const firstCell = row.children[0];
      if (firstCell.textContent.trim().toLowerCase() === 'mobile image') {
        row.remove();
      }
    }
  });

  if(circleColor) {
    const circleAssetContainer = document.createElement('div');
    circleAssetContainer.classList.add('circle-asset');
    circleAssetContainer.classList.add(circleColor);
    const heroWrapper = document.querySelector('.hero-wrapper .hero');
    heroWrapper.append(circleAssetContainer);
    block.classList.remove(circleColor);
  }

  function onResize(e) {
    const currentPic = picContainer.querySelector('picture');
    let newPic;
    if (e.matches && mobilePic) {
      // mobile view with mobile image
      const mobileImg = mobilePic.querySelector('img');
      newPic = createOptimizedPicture(mobileImg.src, mobileImg.alt || alt, false, [{ width: '800' }]);
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
