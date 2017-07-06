import fetch from 'isomorphic-fetch';
import _ from 'underscore';

export default function getCoordinates(city) {
  const geocoderApiKey = '399e7c0319f043649277fc49a1b62629';
  const geocoderEndpoint = city => `http://api.opencagedata.com/geocode/v1/json`
    + `?q=${city}&key=${geocoderApiKey}`;
  return fetch(geocoderEndpoint(city))
    .then(response => response.json())
    .then(data => {
      if (data.results && data.results.length === 0) {
        return {error: `The city ${city} could not be found.`};
      }

      // For simplicity, we are selecting the most probable result.
      // If need be, we can extend functionality to allow the user
      // to choose from cities that are homonymous
      let mostProbableResult = _.pick(data, 'results').results[0].geometry;
      return {lat: mostProbableResult.lat, lon: mostProbableResult.lng};
    });
}
