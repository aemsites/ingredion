// eslint-disable-next-line func-names
/*  -- Google Tag Manager --  */
/* eslint-disable */
(function (w, d, s, l, i) {
  // Convert existing dataLayer object to array format for GTM
  if (w.dataLayer && typeof w.dataLayer === 'object' && !Array.isArray(w.dataLayer)) {
    // Convert object to array format
    const convertedDataLayer = [];
    
    // Add page, user, and event data
    if (w.dataLayer.page || w.dataLayer.user || w.dataLayer.event) {
      convertedDataLayer.push({
        page: w.dataLayer.page,
        user: w.dataLayer.user,
        event: w.dataLayer.event,
      });
    }
    
    // Add product data if it exists
    if (w.dataLayer.product) {
      convertedDataLayer.push({
        product: w.dataLayer.product,
      });
    }
    
    // Set the converted array as the dataLayer for GTM
    w[l] = convertedDataLayer;
  } else {
    // Fallback: initialize as empty array if dataLayer doesn't exist or is already an array
    w[l] = w[l] || [];
  }
  
  w[l].push({
    'gtm.start':
      new Date().getTime(), event: 'gtm.js'
  }); var f = d.getElementsByTagName(s)[0],
    j = d.createElement(s), dl = l != 'dataLayer' ? '&l=' + l : ''; j.async = true; j.src =
      'https://www.googletagmanager.com/gtm.js?id=' + i + dl; f.parentNode.insertBefore(j, f);
})(window, document, 'script', 'dataLayer', 'GTM-M4QF75K9');
/*  -- End Google Tag Manager --  */