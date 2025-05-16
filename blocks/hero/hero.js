import { createOptimizedPicture } from '../../scripts/aem.js';

function findImageInfo(block, label) {
  // If label is not provided, return the first <picture> in the block
  if (!label) {
    const pic = block.querySelector('picture');
    const img = pic?.querySelector('img');
    return img ? { pic, src: img.src, alt: img.alt || '' } : null;
  }
  // Otherwise, look for a row with the label
  for (const row of block.children) {
    if (row.children.length >= 2) {
      const [firstCell, secondCell] = row.children;
      if (firstCell.textContent.trim().toLowerCase() === label.toLowerCase()) {
        const pic = secondCell.querySelector('picture');
        const img = pic?.querySelector('img');
        return img ? { row, pic, src: img.src, alt: img.alt || '' } : null;
      }
    }
  }
  return null;
}

export default function decorate(block) {
  const main = findImageInfo(block);
  if (!main) return;

  const mobile = findImageInfo(block, 'Mobile Image');

  // If a distinct mobile image exists, use art direction
  if (mobile && mobile.src !== main.src) {
    const picture = document.createElement('picture');
    // Desktop/Tablet sources
    const desktopBreakpoints = [
      { media: '(min-width: 1080px)', width: '2000' },
      { media: '(min-width: 768px)', width: '750' },
    ];
    const mainSources = createOptimizedPicture(main.src, main.alt, false, desktopBreakpoints);
    mainSources.querySelectorAll('source[media]').forEach(source =>
      picture.appendChild(source.cloneNode(true))
    );
    // Mobile source
    const mobileBreakpoints = [{ width: '767' }];
    const mobileSources = createOptimizedPicture(mobile.src, mobile.alt, false, mobileBreakpoints);
    const mobileSource = document.createElement('source');
    mobileSource.media = '(max-width: 767px)';
    const generatedMobileSource = mobileSources.querySelector('source:not([media])');
    mobileSource.srcset = generatedMobileSource
      ? generatedMobileSource.srcset
      : mobileSources.querySelector('img').src;
    if (generatedMobileSource?.type) mobileSource.type = generatedMobileSource.type;
    picture.appendChild(mobileSource);
    // Fallback img
    const fallbackImg = mobileSources.querySelector('img').cloneNode(true);
    fallbackImg.alt = mobile.alt;
    picture.appendChild(fallbackImg);

    // Replace and clean up
    main.pic.replaceWith(picture);
    if (mobile.row) mobile.row.remove();
  } else {
    // Fallback: just use main image with all breakpoints
    const breakpoints = [
      { media: '(min-width: 1080px)', width: '2000' },
      { media: '(min-width: 768px)', width: '750' },
      { width: '300' },
    ];
    const optimizedPicture = createOptimizedPicture(main.src, main.alt, false, breakpoints);
    main.pic.replaceWith(optimizedPicture);
  }
}
