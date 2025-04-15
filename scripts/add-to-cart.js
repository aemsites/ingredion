/* eslint-disable function-paren-newline, object-curly-newline */
import { div, p, button } from '../../scripts/dom-helpers.js';
import { getCookie } from './utils.js';
import { loadCSS } from './aem.js';

let notificationTimeout;

function removeIngredientFromCart() {
    const cartCookies = getCookie('cartCookies');
    const cookies = cartCookies.split('cookie ');
    const lastCookie = cookies[cookies.length - 1];
    const lastCookieUrl = lastCookie.split('=')[1];
    if (lastCookieUrl === window.location.href) {
      const updatedCookies = cookies.slice(0, -1);
      document.cookie = `cartCookies=${updatedCookies.join(' cookie ').trim()}; path=/`;
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




