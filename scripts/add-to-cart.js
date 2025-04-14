import { getCookie } from './utils.js';

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
}

export function removeIngredientFromCart() {
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