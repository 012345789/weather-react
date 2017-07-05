import fetch from 'isomorphic-fetch';
import _ from 'underscore';

// Returns an estimate of the user's location based on visiting IP address
// Requires ad-blockers to be disabled
export default function locateUser() {
  const ipLocatorUrl = 'http://ip-api.com/json/';
  // return 'Los Angeles';
  // let locator = this;
  return fetch(ipLocatorUrl)
    .then(function(response) {
      let res = response.json();
      return res;
    })
    .then(function(data) {
      // console.log('d: ', data);
      return _.pick(data, 'city', 'country', 'countryCode');
    });
}
