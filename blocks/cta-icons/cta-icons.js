export default function decorate(block) {
  const firstDiv = block.querySelectorAll('div')[0];
  const linkCount = firstDiv.querySelectorAll('a').length;

  // Determine the class based on link count
  let columnClass = '';
  if (linkCount === 4) {
    columnClass = 'section-content-columns-4';
  } else {
    columnClass = 'section-content-columns-6';
  }

  block.classList.add(columnClass);

  // Function to recursively unwrap nested divs
  function unwrapNestedDivs(element) {
    const children = Array.from(element.children);
    children.forEach((child) => {
      if (child.tagName === 'DIV') {
        unwrapNestedDivs(child);
        while (child.firstChild) {
          element.insertBefore(child.firstChild, child);
        }
        element.removeChild(child);
      }
    });
  }
  unwrapNestedDivs(block);

  const pictureParagraphs = block.querySelectorAll('p:has(picture)');

  pictureParagraphs.forEach((pictureParagraph) => {
    const buttonContainer = pictureParagraph.nextElementSibling;
    if (!buttonContainer || !buttonContainer.classList.contains('button-container')) {
      return;
    }

    const linkElement = buttonContainer.querySelector('a');
    const pictureElement = pictureParagraph.querySelector('picture').querySelector('img');

    if (linkElement && pictureElement) {
      const linkHref = linkElement.getAttribute('href');
      const linkTitle = linkElement.getAttribute('title');
      const buttonText = linkElement.textContent.trim();

      const iconWrapper = document.createElement('a');
      iconWrapper.classList.add('icon-card');
      iconWrapper.href = linkHref;
      iconWrapper.title = linkTitle;

      iconWrapper.innerHTML = `
        <div class='icon-card-wrapper'>
          <img class='icon-card-icon' src=${pictureElement.getAttribute('src')}
          </img>
          <h3 class='label-text label-text-center' title='${linkTitle}'>${buttonText}</h3>
        </div>
      `;

      buttonContainer.replaceWith(iconWrapper);
      pictureParagraph.remove();
    }
  });
}
