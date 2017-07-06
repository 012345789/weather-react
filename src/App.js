import React, { Component } from 'react';
import logo from './images/logo.svg';
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
      errorText: '',
      offset: 0,
      loadingWeather: 'spinner'
    };
  }

  componentDidMount() {
    let locationPromise = locateUser();
    let app = this;
    locationPromise.then(data => app._loadWeatherForLocation(data));
  }

  _updateCityInput(evt) {
    this.setState({customLocation: evt.target.value});
  }

  _lookUp(e) {
    e.preventDefault();
    let app = this;
    app.setState({
      loadingWeather: 'spinner'
    });
    getCoordinates(this.state.customLocation)
      .then(coordinatesData => {
        if (coordinatesData.error) {
          this._showError(coordinatesData.error);
          return;
        }

        app._loadWeatherForLocation({
          city: app.state.customLocation,
          lat: coordinatesData.lat,
          lon: coordinatesData.lon,
          // reset the saved offset since location is changing
          newLocation: true
        });
      });
  }

  _loadWeatherForLocation(data) {
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
        <div className="col-1 grid-column-margin" key="left-margin">
        </div>
      );
      dates.forEach((day, dateIndex) => {
        let oneDay = [];
        let dayWithoutTime = new Date(day.split(' ')[0]);
        oneDay.push(
          <div className="date-header" key={`header-${data.city}-${day}`}>
            {dayWithoutTime.toDateString()}
          </div>
        );
        weatherData[day].forEach(time => {
          let dateTime = new Date(time.dt_txt);
          let offsetDateTime = new Date(dateTime.setHours(
            dateTime.getHours() + app.state.offset)
          ).toLocaleTimeString();
          let hour = offsetDateTime.split(':')[0];
          let amOrPm = offsetDateTime.split(' ')[1];
          let iconUrl = 'http://openweathermap.org/img/w/'
          oneDay.push(
            <div className="time" key={`time-${data.city}-${offsetDateTime}`}>
              <div>
                {hour + ' ' + amOrPm}
              </div>
              <div>
                <img src={iconUrl + time.weather[0].icon + '.png'}
                  alt={time.weather[0].main}/>
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
          <div className="col-2 one-day" key={`full-${day}-${data.city}`}>
            {oneDay}
          </div>
        );
      });
      allDays.push(
        <div className="col-1 grid-column-margin" key="rightMargin">
        </div>
      );
      app._clearError();
      app.setState({weatherDataDisplay:
        <div className="row" id="weather-for-all-days">
          {allDays}
        </div>,
        loadingWeather: ''});
    });
  }

  _showError(message) {
    this.setState({errorText: message, loadingWeather: ''});
  }

  _clearError() {
    this.setState({errorText: ''});
  }

  render() {
    return (
      <div className="App">
        <div id="App-header">
          <div id="logo-container">
            <img src={logo} className="App-logo" alt="logo" />
          </div>
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
          <div className="row">
            <div className={'large col-12 ' + this.state.loadingWeather}>
            </div>
          </div>
          {this.state.loadingWeather ? '' : this.state.weatherDataDisplay}
        </div>

        <div id="elsewhere-text">Looking for the weather elsewhere?</div>
        <form onSubmit={this._lookUp.bind(this)}>
          <div id="custom-location">
            <input
              id="location-input"
              name="location-input"
              ref="locationInput"
              type="text"
              placeholder="Enter City"
              value={this.state.customLocation}
              onChange={evt => this._updateCityInput(evt)}
            />
            {
              /* TODO (enhancement): disable if loading*/
            }
            <button
              className="button"
              id="lookup-button"
              ref="lookUpButton"
              type="submit">
                <span ref="buttonText">
                  Look up
                </span>
            </button>
            <div id="error-text">
              {this.state.errorText}
            </div>
          </div>
        </form>

      </div>
    );
  }
}

export default App;
