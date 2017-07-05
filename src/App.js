import React, { Component } from 'react';
import logo from './logo.svg';
import './libraries/simple-grid.css';
import './App.css';
import locateUser from './services/locator.js';
import getWeather from './services/getWeather.js';
import kelvinToFahrenheit from './formatters/temperature.js';
import _ from 'underscore';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      city: '',
      country: '',
      countryCode: '',
      customLocation: '',
      weatherDataDisplay: ''
    };
  }

  componentDidMount() {
    let locationPromise = locateUser();
    locationPromise.then(data => {
      let app = this;
      app.setState({city: data.city, country: data.country});
      let weatherDataPromise = getWeather(data.city, data.country);
      weatherDataPromise.then(function(weatherData) {
        console.log('weatherData: ', weatherData)
        let dates = _.keys(weatherData);
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
            let dateTime = (new Date(time.dt_txt)).toLocaleTimeString();
            let hour = dateTime.split(':')[0];
            let amOrPm = dateTime.split(' ')[1];
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
        console.log('allDays: ', allDays)
        app.setState({weatherDataDisplay:
          <div className="row" id="weather-for-all-days">
            {allDays}
          </div>
        });
      });
    });
  }

  updateCityInput(evt) {
    this.setState({customLocation: evt.target.value});
  }

  lookUp() {
    console.log(`Looking up weather for... ${this.state.customLocation}`);
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>
            Weather {this.state.city ? 'in' : 'Loading'}
            {this.state.city}, {this.state.country}
          </h2>
        </div>
        <p className="App-intro">

        </p>

        <div id="forecast-container">
          {this.state.weatherDataDisplay}
        </div>

        <div>Looking for the weather elsewhere?</div>
        <div id="custom-location">
          <input
            className="location-input"
            ref="customLocation"
            type="text"
            placeholder="Enter City or Zip Code"
            value={this.state.customLocation}
            onChange={evt => this.updateCityInput(evt)}
          />
          <button className="button" id="lookup-button"
            onClick={this.lookUp.bind(this)}>
              Look up
          </button>
        </div>
        <div className="hidden">That location could not be found.</div>
      </div>
    );
  }
}

export default App;
