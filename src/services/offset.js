import fetch from 'isomorphic-fetch';

let offset;
const offsetEndpoint = (lat, long) => {
  let latRounded = Math.round(lat);
  let lonRounded = Math.round(long);
  return `http://api.geonames.org/timezoneJSON?lat=${latRounded}`
    + `&lng=${lonRounded}&username=gorlanyuen`;
};

// Returns the offset of an geographical location given the lat and lon coordinates
function fetchOffset(lat, lon) {
  console.log('fetching offset');
  return fetch(offsetEndpoint(lat, lon))
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      offset = data.rawOffset;
      return offset;
    });
}

export default function getOffset(lat, lon, newLocation=false) {
  console.log('newLocation: ', newLocation)
  // newLocation = newLocation || false;
  if (offset && !newLocation) {
    return Promise.resolve(offset);
  }
  return fetchOffset(lat, lon);
}
