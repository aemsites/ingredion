export default function decorate(block) {
  const firstDiv = block.querySelectorAll("div")[0];
  const linkCount = firstDiv.querySelectorAll("a").length;

  // Determine the class based on link count
  let columnClass = "";
  if (linkCount === 2) {
    columnClass = "section-content-columns-2";
  } else if (linkCount === 3) {
    columnClass = "section-content-columns-3";
  } else if (linkCount === 4) {
    columnClass = "section-content-columns-4";
  } else if (linkCount === 6) {
    columnClass = "section-content-columns-6";
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

  const pictureParagraphs = block.querySelectorAll("p:has(picture)");

  pictureParagraphs.forEach((picP) => {
    let nextButtonP = picP.nextElementSibling;
    if (!nextButtonP || !nextButtonP.classList.contains("button-container")) {
      return;
    }

    let linkElement = nextButtonP.querySelector("a");
    let pictureElement = picP.querySelector("picture").querySelector("img");

    if (linkElement && pictureElement) {
      let linkHref = linkElement.getAttribute("href");
      let linkTitle = linkElement.getAttribute("title");
      let buttonText = linkElement.textContent.trim();

      let newWrapper = document.createElement("a");
      newWrapper.classList.add("icon-card");
      newWrapper.href = linkHref;
      newWrapper.title = linkTitle;

      newWrapper.innerHTML = `
        <div class="icon-card-wrapper">
          <img class="icon-card-icon" src=${pictureElement.getAttribute("src")}
          </img>
          <h3 class="label-text label-text-center" title="${linkTitle}">${buttonText}</h3>
        </div>
      `;

      nextButtonP.replaceWith(newWrapper);
      picP.remove();
    }
  });
}
