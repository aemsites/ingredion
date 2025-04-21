/* eslint-disable function-paren-newline, object-curly-newline */
import { div, ul, li } from "../../scripts/dom-helpers.js";
import { createOptimizedPicture } from "../../scripts/aem.js";

function buildSubMenu(block) {
  const $navList = ul({ class: "nav-list", "data-height": "" });
  const $navItems = div({ class: "nav-items" });

  const removeActiveItem = () => {
    [...$navItems.children].forEach((item) => item.classList.remove("active"));
    [...$navList.children].forEach((listItem) =>
      listItem.classList.remove("active"),
    );
  };

  const setActiveItem = (row, rowN) => {
    removeActiveItem();
    row.classList.add("active");
    const matchingItem = $navItems.querySelector(`.item[data-item="${rowN}"]`);
    if (matchingItem) matchingItem.classList.add("active");
  };

  [...block.children].forEach((row, rowN) => {
    const $item = div({ class: "item", "data-item": rowN });

    // set first item as active
    if (rowN === 0) $item.classList.add("active");

    [...row.children].forEach((col, colN) => {
      // replace image with optimized version
      const img = col.querySelector("img");
      if (img) {
        const newImg = createOptimizedPicture(
          img.src,
          img.alt || "image",
          false,
          [{ width: "400" }],
        );
        img.replaceWith(newImg);
      }

      if (colN === 0) {
        // build section list
        const $section = li({ "data-item": rowN }, col.textContent);
        $section.addEventListener("click", () => setActiveItem($section, rowN));
        // set first item as active
        if (rowN === 0) $section.classList.add("active");
        $navList.append($section);
      } else {
        col.setAttribute("data-height", "");
        $item.append(col);
      }
    });

    $navItems.append($item);
  });

  block.innerHTML = "";
  block.append($navList, $navItems);
}

function buldStaticDropdown(block) {
  block.classList.add("static");

  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      col.setAttribute("data-height", "");
      const img = col.querySelector("img");
      if (img) {
        const newImg = createOptimizedPicture(
          img.src,
          img.alt || "image",
          false,
          [{ width: "400" }],
        );
        img.replaceWith(newImg);
      }
    });
  });
}

function renderDesktop(block) {
  block.classList.add(
    `columns-${[...block.firstElementChild.children].length}`,
  );
  if (block.classList.contains("submenu")) buildSubMenu(block);
  else buldStaticDropdown(block);
}

function renderMobile(block) {
  block.classList.remove("submenu");
  block.classList.add("mobile");
  const dropdowns = block.querySelectorAll("div > div");

  dropdowns.forEach((dropdown) => {
    dropdown.querySelectorAll("img, picture").forEach((el) => el.remove());
    dropdown.querySelectorAll("p").forEach((p) => {
      if (p.querySelector("a")) {
        const div = document.createElement("div");
        div.innerHTML = p.innerHTML;
        div.className = p.className;
        [...p.attributes].forEach((attr) => {
          if (attr.name !== "class") div.setAttribute(attr.name, attr.value);
        });
        p.replaceWith(div);
      }
    });

    dropdown.querySelectorAll("p").forEach((p) => {
      const hasVisibleText = p.textContent.trim().length > 0;
      const hasOtherContent = [...p.children].length > 0;
      if (!hasVisibleText && !hasOtherContent) {
        p.remove();
      }
    });

    dropdown.querySelectorAll("div").forEach((div) => {
      const hasVisibleText = div.textContent.trim().length > 0;
      const hasOtherContent = [...div.children].length > 0;
      if (!hasVisibleText && !hasOtherContent) {
        div.remove();
      }
    });

    let title = null;
    dropdown.querySelectorAll("p").forEach((p) => {
      if (!title && p.textContent.trim().length > 0) {
        title = p;

        const parent = p.parentElement;
        const grandparent = parent.parentElement;

        const isWrapped =
          parent.tagName === "DIV" &&
          parent.children.length === 1 &&
          parent.contains(p);
        if (isWrapped && grandparent) {
          grandparent.insertBefore(p, parent);
          parent.remove();
        }
      }
    });

    if (!title) return;

    title.classList.add("dropdown-title");
    title.classList.remove("open");

    const dropdownItems = [...title.parentElement.children].filter(
      (el) => el !== title,
    );

    dropdownItems.forEach((dropdownItem) => {
      dropdownItem.classList.add("dropdown-content");
      dropdownItem.classList.remove("open");

      dropdownItem.addEventListener("click", (event) => {
        //event.stopPropagation();
        dropdownItem.classList.toggle("open");
      });
    });

    let isOpen = false;

    title.addEventListener("click", () => {
      isOpen = !isOpen;
      dropdownItems.forEach((sibling) => {
        sibling.classList.toggle("open", isOpen);
      });
    });
  });
}

export default function decorate(block) {
  const isMobile = window.matchMedia("(width < 1080px)");
  const getMode = () => (isMobile.matches ? "mobile" : "desktop");

  const originalHTML = block.innerHTML;
  const originalClasses = [...block.classList];
  let currentMode = getMode();

  function resetBlock(html, classes) {
    block.innerHTML = html;
    block.className = "";
    block.classList.add(...classes);
  }

  function applyLayout(mode) {
    resetBlock(originalHTML, originalClasses);

    if (mode === "mobile") {
      renderMobile(block);
    } else {
      renderDesktop(block);
    }

    block.dataset.mode = mode;
  }

  applyLayout(currentMode);

  if (!block._hasResizeListener) {
    isMobile.addEventListener("change", () => {
      const newMode = getMode();
      if (newMode !== currentMode) {
        currentMode = newMode;
        applyLayout(newMode);
      }
    });

    block._hasResizeListener = true;
  }
}
