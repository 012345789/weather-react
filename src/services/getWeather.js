import fetch from 'isomorphic-fetch';
import _ from 'underscore';

// Returns a 5 day weather forecast for the input city
export default function getWeather(city, countryCode) {
  // const ipLocatorUrl = 'http://ip-api.com/json/';
  const apiKey = '3d3c42b9c508782e9479920452a82fed';
  let customLocation = `${city},${countryCode}`;
  let weatherEndpoint = 'http://api.openweathermap.org/data/2.5/forecast?q='
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
      let weatherByDay = _.groupBy(data.list, function(item) {
        return item.dt_txt.split(' ')[0];
      });
      return weatherByDay;
    });
}
