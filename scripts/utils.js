// valid regions and locales
const VALID_REGIONS = ['na', 'sa', 'emea', 'apac'];
const VALID_LOCALES = ['en-us', 'es-mx', 'pt-br', 'es-co', 'es-ar', 'en-uk', 'en-sg', 'ja-jp', 'sc-cn', 'en-au'];

/**
 * Retrieves the region and locale from the URL path.
 * If the region or locale is not valid, it defaults to 'na' and 'en-us'
 * @returns {Array} An array containing the region and locale.
 */
export function getRegionLocale() {
  const segments = window.location.pathname
    .replace(/\.html$/, '')
    .split('/')
    .filter((segment) => segment);
  // fallback values 'na' and 'en-us'
  let [region = 'na', locale = 'en-us'] = segments;
  // validate region and locale
  if (!VALID_REGIONS.includes(region)) region = 'na';
  if (!VALID_LOCALES.includes(locale)) locale = 'en-us';
  return [region, locale];
}

/**
 * Prevent rapid firing, throttles a function so that it is only
 * called once every specified number of milliseconds.
 * @param {Function} fn - The function to throttle.
 * @param {number} wait - Number of milliseconds to wait before calling again.
 * @returns {Function} A throttled version of the input function.
 */
export function throttle(fn, wait) {
  let lastCall = 0;
  return function throttled(...args) {
    const now = Date.now();
    if (now - lastCall >= wait) {
      lastCall = now;
      fn.apply(this, args);
    }
  };
}

/**
 * Loads translations from a given URL and locale, and stores them in a lookup object.
 * @param {string} url - The URL to fetch translations from.
 * @param {string} locale - The locale to use for translations.
 * @returns {Promise<Object>} A promise that resolves to the translations object.
 */
let translations = {};
export async function loadTranslations(url, locale) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch translations');
    const data = await response.json();

    // Create a lookup object for translations
    translations = data.data.reduce((acc, item) => {
      acc[item.key] = item[locale] || item.en;
      return acc;
    }, {});
    return translations;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error loading translations:', error);
    return {};
  }
}

/**
 * Retrieves the translated text for a given key.
 * @param {string} key - The key for the translation.
 * @returns {string} The translated text, or the key if no translation is found.
 */
export function translate(key) {
  return translations[key] || key;
}
