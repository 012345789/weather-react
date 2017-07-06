import fetch from 'isomorphic-fetch';
import getOffset from './offset.js';
import _ from 'underscore';

let previousCity;

// Returns a 5 day weather forecast for the input city
export default function getWeather(city, countryCode) {
  const apiKey = '3d3c42b9c508782e9479920452a82fed';
  const customLocation = `${city},${countryCode}`;
  const weatherEndpoint = 'http://api.openweathermap.org/data/2.5/forecast?q='
    +  `${customLocation}&appid=${apiKey}`;

  return fetch(weatherEndpoint)
    .then(function(response) {
      let res = response.json();
      return res;
    })
    .then(function(data) {
      console.log('getWeather service data: ', data);
      if (data.cod !== "200") {
        throw new Error('Weather could not be fetched. Please try again later');
      }
      // TODO: handle case where city is invalid
      return getOffset(data.city.coord.lat, data.city.coord.lon, data.city.name !== previousCity)
        .then(function(offset) {
          previousCity = data.city.name;
          return _synthesizeAndFormatWeather(data, offset);
        });
    });
}

function _synthesizeAndFormatWeather(data, offset) {
  let weatherByDay = _.groupBy(data.list, function(item) {
    let currentDate = new Date(item.dt_txt);
    let hour = currentDate.getHours();
    let res = new Date(currentDate.setHours(hour + offset)).toLocaleDateString();
    return res;
  });
  console.log('weatherByDay: ', weatherByDay)
  return weatherByDay;
}
