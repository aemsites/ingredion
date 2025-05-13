/* eslint-disable function-paren-newline, object-curly-newline */
import { div, p, button } from './dom-helpers.js';
import { getCookie } from './utils.js';
import { loadCSS } from './aem.js';

let notificationTimeout;

function removeIngredientFromCart() {
  const cartCookies = getCookie('cartCookies');
  if (cartCookies) {
    const items = cartCookies.split('cookie ').filter(Boolean);
    // Remove the last item from the array
    items.pop();

    if (items.length > 0) {
      document.cookie = `cartCookies=cookie ${items.join(' cookie ')}; path=/`;
    } else {
      document.cookie = 'cartCookies=; path=/';
    }
  }

  const cartCount = document.querySelector('.icon-cart > .count');
  if (cartCount) {
    const currentCount = parseInt(cartCount.textContent || '0', 10);
    cartCount.textContent = currentCount - 1;
    cartCount.style.display = 'block';

    if (cartCount.textContent === '0') {
      cartCount.style.display = 'none';
    }
  }
}

// eslint-disable-next-line import/prefer-default-export
export function addIngredientToCart(ingredientName, ingredientUrl) {
  const cartCookies = getCookie('cartCookies');
  if (cartCookies) {
    document.cookie = `cartCookies=${cartCookies} cookie ${ingredientName},url=${ingredientUrl}; path=/`;
  } else {
    document.cookie = `cartCookies=cookie ${ingredientName},url=${ingredientUrl}; path=/`;
  }

  const cartCount = document.querySelector('.icon-cart > .count');
  if (cartCount) {
    const currentCount = parseInt(cartCount.textContent || '0', 10);
    cartCount.textContent = currentCount + 1;
    cartCount.style.display = 'block';

    if (cartCount.textContent === '0') {
      cartCount.style.display = 'none';
    }
  }

  // Cart Notification
  let cartNotification = document.querySelector('.cart-notification');

  if (!cartNotification) {
    loadCSS('/styles/cart-notifications.css');
    const undoBtn = button({ class: 'undo' }, 'Undo');
    undoBtn.addEventListener('click', () => {
      removeIngredientFromCart();
      cartNotification.classList.remove('active');
    });

    const closeBtn = button({ class: 'close' });
    closeBtn.addEventListener('click', () => {
      cartNotification.classList.remove('active');
    });

    cartNotification = div({ class: 'cart-notification active' },
      p('Product successfully added to cart!'),
      undoBtn,
      closeBtn,
    );

    document.body.appendChild(cartNotification);
  } else {
    cartNotification.classList.add('active');
  }

  // clear existing timeout
  if (notificationTimeout) clearTimeout(notificationTimeout);

  // wet timeout
  notificationTimeout = setTimeout(() => {
    if (cartNotification) cartNotification.classList.remove('active');
  }, 5000);
}
