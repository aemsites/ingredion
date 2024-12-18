// add delayed functionality here
function initBackToTop() {
  const scrollThreshold = 1600;

  const footerWrapper = document.querySelector('footer.footer-wrapper');
  const footerBlock = footerWrapper.querySelector('.footer.block');

  const createElement = (tag, classNames, textContent = '') => {
    const element = document.createElement(tag);
    if (classNames) element.className = classNames;
    if (textContent) element.textContent = textContent;
    return element;
  };

  const scrollTopBtn = createElement('div', 'scroll-top-btn');
  const wrapper = createElement('div', 'scroll-top-btn-wrapper');
  const label = createElement('span', 'scroll-top-btn-label', 'back to top');
  const button = createElement('button', 'scroll-top-btn-button icon-arrow-blk');

  wrapper.append(label, button);
  scrollTopBtn.appendChild(wrapper);
  footerBlock.prepend(scrollTopBtn);

  const toggleVisibility = () => {
    // eslint-disable-next-line prefer-destructuring
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    if (scrollY > scrollThreshold && documentHeight > windowHeight + scrollThreshold) {
      scrollTopBtn.classList.add('is-visible');
    } else {
      scrollTopBtn.classList.remove('is-visible');
    }
  };

  window.addEventListener('scroll', toggleVisibility);

  button.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBackToTop);
} else {
  initBackToTop();
}
