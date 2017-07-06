import React, { Component } from 'react';
import logo from './logo.svg';
import './libraries/simple-grid.css';
import './App.css';
import locateUser from './services/locator.js';
import getWeather from './services/getWeather.js';
import kelvinToFahrenheit from './formatters/temperature.js';
import getOffset from './services/offset.js';
import getCoordinates from './services/coordinates.js';
import _ from 'underscore';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      city: '',
      country: '',
      countryCode: '',
      customLocation: '',
      weatherDataDisplay: '',
      offset: 0
    };
  }

  componentDidMount() {
    let locationPromise = locateUser();
    let app = this;
    locationPromise.then(data => app.loadWeatherForLocation(data));
  }

  updateCityInput(evt) {
    this.setState({customLocation: evt.target.value});
  }

  lookUp(e) {
    e.preventDefault();
    // show loading spinner
    let app = this;
    console.log(`Looking up weather for... ${this.state.customLocation}`);
    getCoordinates(this.state.customLocation)
      .then(coordinatesData => {
        app.loadWeatherForLocation({
          city: app.state.customLocation,
          lat: coordinatesData.lat,
          lon: coordinatesData.lon,
          // reset the saved offset since location is changing
          newLocation: true
        });
      });
  }

  loadWeatherForLocation(data) {
    let app = this;
    getOffset(data.lat, data.lon, data.newLocation)
      .then(function(offset) {
        app.setState({offset: offset});
      });
    app.setState({city: data.city, country: data.country});
    let weatherDataPromise = getWeather(data.city, data.country);
    weatherDataPromise.then(function(weatherData) {
      let dates = (_.keys(weatherData)).slice(0,5);
      let allDays = [];
      allDays.push(
        <div className="col-1 grid-column-margin">
        </div>
      );
      dates.forEach(day => {
        let oneDay = [];
        let dayWithoutTime = new Date(day.split(' ')[0]);
        oneDay.push(
          <div className="date-header">
            {dayWithoutTime.toDateString()}
          </div>
        );
        weatherData[day].forEach(time => {
          let dateTime = new Date(time.dt_txt);
          let dateTimeLocale = dateTime.toLocaleTimeString();
          let offsetDateTime = new Date(dateTime.setHours(dateTime.getHours() + app.state.offset)).toLocaleTimeString();
          let hour = offsetDateTime.split(':')[0];
          let amOrPm = offsetDateTime.split(' ')[1];
          let iconUrl = 'http://openweathermap.org/img/w/'
          oneDay.push(
            <div className="time">
              <div>
                {hour + ' ' + amOrPm}
              </div>
              <div>
                <img src={iconUrl + time.weather[0].icon + '.png'} alt={time.weather[0].main}/>
              </div>
              <div>
                {time.weather[0].description}
              </div>
              <div>
                {kelvinToFahrenheit(time.main.temp) + ' °F'}
              </div>
            </div>
          );
        });
        allDays.push(
          <div className="col-2 one-day">
            {oneDay}
          </div>
        );
      });
      allDays.push(
        <div className="col-1 grid-column-margin">
        </div>
      );
      app.setState({weatherDataDisplay:
        <div className="row" id="weather-for-all-days">
          {allDays}
        </div>
      });
      // hide loading spinner
    });
  }

  render() {
    return (
      <div className="App">
        <div id="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>
            Weather {this.state.city ? ' in ' : 'Loading'}
            {this.state.city.split(' ').map(word => {
              return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            }).join(' ')}
          </h2>
        </div>
        <p className="App-intro">

        </p>

        <div id="forecast-container">
          {this.state.weatherDataDisplay}
        </div>

        <div>Looking for the weather elsewhere?</div>
        <form onSubmit={this.lookUp.bind(this)}>
          <div id="custom-location">
            <input
              id="location-input"
              name="location-input"
              type="text"
              placeholder="Enter City"
              value={this.state.customLocation}
              onChange={evt => this.updateCityInput(evt)}
            />
            <button
              className="button"
              id="lookup-button"
              type="submit">
                Look up
            </button>
          </div>
        </form>
        <div className="hidden" id="location-not-found-text">
          That location could not be found.
        </div>
      </div>
    );
  }
}

export default App;
