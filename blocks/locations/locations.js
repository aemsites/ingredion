/* eslint-disable no-use-before-define, no-undef, function-paren-newline, object-curly-newline */
import { script, div, aside, a, strong, p, h3, h4, h5, span, ul, li, button, img } from '../../scripts/dom-helpers.js';
import { createOptimizedPicture } from '../../scripts/aem.js';
import { readBlockConfig } from '../../scripts/aem.js';


let locations = [];
let map;
let bounds;
let markers = [];



// Sets the map on all markers in the array.
function setAllMarkers(m) {
  markers.forEach((marker) => {
    marker.setMap(m);
  });
}

// Removes the markers from the map, but keeps them in the array.
function hideMarkers() {
  setAllMarkers(null);
}

// Deletes all markers in the array by removing references to them.
function deleteMapMarkers() {
  hideMarkers();
  markers = [];
}

/**
 * Gets the marker class based on location type
 * @param {string} type - The location type
 * @returns {string} - The CSS class for the marker
 */
function getMarkerClass(type) {
  switch (type?.toLowerCase()) {
    case 'headquarters':
      return 'headquarters';
    case 'manufacturing':
      return 'manufacturing';
    case 'innovation center':
      return 'innovation-center';
    case 'sales':
      return 'sales';
    default:
      return 'sales';  // Using sales as default
  }
}

/**
 * Creates a marker pin element for a location.
 * @param {Object} location - The location object.
 * @param {number} i - The index of the pin.
 * @returns {HTMLElement} - The marker pin element.
 */
function markerPin(location, i) {
  const pin = div({ class: `pin pin-${i} ${getMarkerClass(location.type)}`, 'data-pin': i });
  const icon = div({ class: 'marker-icon' });
  pin.appendChild(icon);
  return pin;
}

/**
 * Checks marker position and if it's off the map moves it into view
 * @param {number} i - The index of the active home.
*/
function fitMarkerWithinBounds(i) {
  // padding around marker when moved into view
  const padding = {
    top: 40,
    right: 40,
    bottom: 60,
    left: 40,
  };

  const markerElement = document.querySelector(`[data-pin="${i}"]`);
  const markerRect = markerElement.getBoundingClientRect();
  const mapContainer = document.getElementById('google-map');
  const mapRect = mapContainer.getBoundingClientRect();
  const { top: markerTop, left: markerLeft, right: markerRight, bottom: markerBottom } = markerRect;
  const { top: mapTop, left: mapLeft, right: mapRight, bottom: mapBottom } = mapRect;

  // calculate distances
  const markerPXfromTop = markerTop - mapTop;
  const markerPXfromLeft = markerLeft - mapLeft;
  const markerPXfromRight = mapRight - markerRight;
  const markerPXfromBottom = mapBottom - markerBottom;

  let panX = 0;
  let panY = 0;

  // calculate pan amounts based on padding
  if (markerPXfromTop < padding.top) {
    panY = (padding.top - markerPXfromTop) * -1;
  } else if (markerPXfromBottom < padding.bottom) {
    panY = (padding.bottom - markerPXfromBottom);
  }

  if (markerPXfromLeft < padding.left) {
    panX = (padding.left - markerPXfromLeft) * -1;
  } else if (markerPXfromRight < padding.right) {
    panX = (padding.right - markerPXfromRight);
  }

  // pan the map if needed
  if (panX !== 0 || panY !== 0) {
    const currentCenter = map.getCenter();
    const projection = map.getProjection();
    const currentCenterPX = projection.fromLatLngToPoint(currentCenter);

    currentCenterPX.y += (panY / 2 ** map.getZoom());
    currentCenterPX.x += (panX / 2 ** map.getZoom());

    const newCenter = projection.fromPointToLatLng(currentCenterPX);
    map.panTo(newCenter);
  }
}

/**
 * Adds map markers for each location in the data.
 * @param {Array} locations - The array of locations to add as markers on the map.
 * @returns {Promise<void>} - A promise that resolves when the markers are added.
 */
async function addMapMarkers(locations) {
  const { AdvancedMarkerElement } = await google.maps.importLibrary('marker');
  bounds = new google.maps.LatLngBounds();

  deleteMapMarkers();

  // if locations data is empty reset map
  if (!locations || locations.length === 0) {
    buildMap();
    return;
  }

  locations.forEach((location, i) => {
    const lat = Number(location.lat);
    const lng = Number(location.long);
    const marker = new AdvancedMarkerElement({
      map,
      position: { lat, lng },
      content: markerPin(location, i),
    });

    markers.push(marker);
    bounds.extend(new google.maps.LatLng(lat, lng));

    // Note: this empty click listener must be added in order for any other events to work
    marker.addListener('click', () => { });

    marker.content.addEventListener('click', () => {
      highlightActiveLocation(i);
    });

    map.addListener('click', () => {
      resetActiveLocations();
    });
  });

  // add padding to bounds so markers aren't hidden when active
  map.fitBounds(bounds, { top: 0, right: 0, bottom: 0, left: 0 });
}

/**
 * Builds a map using the Google Maps API.
 * @returns {Promise<void>} A promise that resolves when the map is built.
 */
async function buildMap() {
  const { Map, StyledMapType } = await google.maps.importLibrary('maps');

  map = new Map(document.getElementById('google-map'), {
    center: { lat: 43.696, lng: -116.641 },
    zoom: 12,
    maxZoom: 15,
    // mapId: 'IM_IMPORTANT',
    disableDefaultUI: true, // remove all buttons
    zoomControl: true, // allow zoom buttons
    streetViewControl: true, // allow street view control
    fullscreenControl: true, // allow fullscreen
    gestureHandling: 'greedy', // allow map to pan when scrolling
  });

  // style map to remove unwanted points
  const mapStyle = [{
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }], // hide points of interest
  }];
  const mapType = new StyledMapType(mapStyle, { name: 'Grayscale' });
  map.mapTypes.set('grey', mapType);
  map.setMapTypeId('grey');
}

/**
 * Listener for 'filtersChanged' event and performs actions based on the chosen filters.
 */
function filterListeners() {
  window.addEventListener('filtersChanged', async (event) => {

    addMapMarkers(inventoryData);
  });
}

/**
 * Highlights the active location card and its corresponding pin on the map.
 * @param {number} i - The index of the active location.
 */
function highlightActiveLocation(i) {
  resetActiveLocations();
  // pin actions
  const $pin = document.querySelector(`[data-pin="${i}"]`);
  $pin.classList.add('active');
  $pin.parentNode.parentNode.style.zIndex = '999'; // must use javascript to set/unset
  // fitMarkerWithinBounds(i);
}

/**
 * Disables active locations by removing the 'active' class from pins.
 */
function resetActiveLocations() {
  const allPins = document.querySelectorAll('.pin');
  allPins.forEach((pin) => {
    pin.classList.remove('active');
    pin.parentNode.parentNode.style.zIndex = '';
  });
}

/**
 * Builds inventory cards for a list of homes.
 *
 * @param {Array} homes - The list of homes.
 * @returns {Array} - An array of inventory cards.
 */
function buildInventoryCards(homes) {
  return homes.map((home, i) => {
    const $home = div({ class: `item-listing listing-${i}`, 'data-card': i },
      a({ href: home.path }, createOptimizedPicture(home.image)),
      div({ class: 'listing-info' },
        h3(home.address),
        div(span(home.city), span(home['home style'])),
        div(span({ class: 'price' }, formatPrice(home.price)), span({ class: 'price' }, `${calculateMonthlyPayment(home.price)}/mo*`)),
        div(span(home.status)),
        ul({ class: 'specs' },
          li(p('Beds'), p(home.beds)),
          li(p('Baths'), p(home.baths)),
          li(p('Sq. Ft.'), p(home['square feet'])),
          li(p('Cars'), p(home.cars))),
        div(
          a({ class: 'btn yellow', href: home.path }, 'View Details'),
        ),
      ),
    );
    $home.addEventListener('mouseenter', () => {
      highlightActiveHome(i);
    });
    return $home;
  });
}


// key = AIzaSyBzkFWc7cMP0Ww_5cYqCcgxIEx-2YpNas4
export default async function decorate(block) {
  const { 'google-maps-api-key': mapKey, 'map-data': mapData } = readBlockConfig(block);

  const locationData = await fetch(mapData)
    .then((response) => response.json());


  const googleMapScript = script(`
    (g=>{var h,a,k,p="The Google Maps JavaScript API",c="google",l="importLibrary",q="__ib__",m=document,b=window;b=b[c]||(b[c]={});var d=b.maps||(b.maps={}),r=new Set,e=new URLSearchParams,u=()=>h||(h=new Promise(async(f,n)=>{await (a=m.createElement("script"));e.set("libraries",[...r]+"");for(k in g)e.set(k.replace(/[A-Z]/g,t=>"_"+t[0].toLowerCase()),g[k]);e.set("callback",c+".maps."+q);a.src=\`https://maps.googleapis.com/maps/api/js?\`+e;d[q]=f;a.onerror=()=>h=n(Error(p+" could not load."));a.nonce=m.querySelector("script[nonce]")?.nonce||"";m.head.append(a)}));d[l]?console.warn(p+" only loads once. Ignoring:",g):d[l]=(f,...n)=>r.add(f)&&u().then(()=>d[l](f,...n))})({
      key: "${mapKey}", 
      v: "weekly",
    });
  `);
  document.head.appendChild(googleMapScript);

  filterListeners();

  const $mapFilter = div({ class: 'map-filter-container' },
    div({ class: 'map' },
      div({ id: 'google-map' }),
    ),
    div({ class: 'locator-search' },
      div({ class: 'listings-wrapper' }),
    ),
  );
  block.innerHTML = '';
  block.append($mapFilter);

  buildMap();
  addMapMarkers(locationData.data);
}


