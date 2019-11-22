const express = require("express")
const expressHandlebars = require("express-handlebars")
const https = require("https")
const request = require('request');
const app = express()
const db = require('./database')
const Temperature = require('./models/temperature')


const defaultLocations = {
  0: "New York",
  1: "Bangkok",
  2: "Stockholm",
  3: "Tokyo"
}

const defaultWeatherObjects = []
var searchedWeatherObject = {
  weather: "",
  city: "",
  description: "",
  temp: "",
  icon: ""
}

app.engine('hbs', expressHandlebars({
  defaultLayout: 'main',
  extname: '.hbs'
}))

app.use(express.static('images'))

getDefaultWeather()

app.get('/', function (req, res) {

  getDefaultWeather()

  const model = {

    weatherOne: defaultWeatherObjects[0].weather,
    descriptionOne: defaultWeatherObjects[0].description,
    cityOne: defaultWeatherObjects[0].city,
    tempOne: defaultWeatherObjects[0].temp,
    iconOne: defaultWeatherObjects[0].icon,
    weatherTwo: defaultWeatherObjects[1].weather,
    descriptionTwo: defaultWeatherObjects[1].description,
    cityTwo: defaultWeatherObjects[1].city,
    tempTwo: defaultWeatherObjects[1].temp,
    iconTwo: defaultWeatherObjects[1].icon,
    weatherThree: defaultWeatherObjects[2].weather,
    descriptionThree: defaultWeatherObjects[2].description,
    cityThree: defaultWeatherObjects[2].city,
    tempThree: defaultWeatherObjects[2].temp,
    iconThree: defaultWeatherObjects[2].icon,
    weatherFour: defaultWeatherObjects[3].weather,
    descriptionFour: defaultWeatherObjects[3].description,
    cityFour: defaultWeatherObjects[3].city,
    tempFour: defaultWeatherObjects[3].temp,
    iconFour: defaultWeatherObjects[3].icon

  }
  res.render("home.hbs", model)

  defaultWeatherObjects.splice(0, defaultWeatherObjects.length)

});

app.get('/searchedLocation', function (req, res) {

  var model = {}
  const search = req.query.search
  getWeatherByCity(search, function () {

    if (searchedWeatherObject.weather.length > 0) {

      model = {
        weather: searchedWeatherObject.weather,
        description: searchedWeatherObject.description,
        city: searchedWeatherObject.city,
        temp: searchedWeatherObject.temp,
        icon: searchedWeatherObject.icon
      }

      searchedWeatherObject.weather = ""

      res.render("searchedLocation.hbs", model)

    }
    else {
      res.render("errorSearchPage.hbs", {})
    }
  })

});

app.get('/database', function(req, res){

  db.getAllCities(function(error, city){ 
    if (error) {
      console.log("error with get all cities")
    } else {

      const model = {

        city: city
    
      }

      res.render("databaseItems.hbs", model)
    }
  });

})

app.get('/showCityInfo/:id', function(req, res){

  const id = req.params.id
  console.log(id)
  db.getCityById(id, function(city, error){
    if (error) {
      console.log(error)
    } else {
      console.log(city.name)

      getWeatherByCity(city.name, function(){

        res.render("searchedLocation.hbs")
      })
    }
  })
})

app.listen(8080, function () {
  console.log("server listening on port 8080")
});


function getDefaultWeather() {
  for (n in defaultLocations) {

    request(`http://api.openweathermap.org/data/2.5/weather?q=${defaultLocations[n]}&APPID=9fd9e6e3123d143241acf644b95671cd`, { json: true }, (err, res, body) => {
      if (err) { return console.log("error:" + err); }

      var weatherStatus = {
        weather: "",
        city: "",
        description: "",
        temp: "",
        icon: ""
      }

      weatherStatus.weather = body.weather[0].main
      weatherStatus.description = body.weather[0].description
      weatherStatus.city = body.name
      weatherStatus.temp = (body.main.temp - 273.15).toFixed(1)
      weatherStatus.icon = body.weather[0].icon

      defaultWeatherObjects.push(weatherStatus)

    });

  }
}

function getWeatherByCity(searchedCity, callback) {

  const temp = new Temperature

  request(`http://api.openweathermap.org/data/2.5/weather?q=${searchedCity}&APPID=9fd9e6e3123d143241acf644b95671cd`, { json: true }, (err, res, body) => {
    if (err) {
      console.log("error:" + err);
    }
    else {
      try {
        
        //if statement to check if the city already exists in the database.

        temp.value = (body.main.temp - 273.15).toFixed(1)
        temp.city = body.name
        temp.datetime = body.dt
        
        db.addTemperature(temp)
        // searchedWeatherObject.weather = body.weather[0].main
        // searchedWeatherObject.description = body.weather[0].description
        // searchedWeatherObject.city = body.name
        // searchedWeatherObject.temp = (body.main.temp - 273.15).toFixed(1)
        // searchedWeatherObject.icon = body.weather[0].icon
        callback();

      } catch (error) {
        callback()
      }

    }

  });

}

