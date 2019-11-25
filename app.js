const express = require("express")
const expressHandlebars = require("express-handlebars")
const https = require("https")
const request = require('request');
const app = express()
const db = require('./database')
const Temperature = require('./models/temperature')
const Weather = require('./models/weather')

const defaultLocations = ["New York", "Bangkok", "Stockholm", "Paris"]

const defaultWeatherObjects = []
var searchedWeatherObject = {
  weather: "",
  city: "",
  description: "",
  temp: "",
  icon: "",
  dt: ""
}

var runOnce = true

app.engine('hbs', expressHandlebars({
  defaultLayout: 'main',
  extname: '.hbs'
}))

app.use(express.static('images'))

getDefaultWeather()


// --- ROUTERS ---
app.route('/')
  .put(function (req, res) {

  })
  .get(function (req, res) {
    runOnce = true
    const model = {
      weather: defaultWeatherObjects
    }
    res.render("home.hbs", model)
    
  })

app.get('/searchedLocation', function (req, res) {
  var model = {}
  const search = req.query.search
  searchedWeatherObject.weather = ""

  getWeatherByCity(search, function () {

    if (searchedWeatherObject.weather.length > 0) {

      model = {
        weather: searchedWeatherObject.weather,
        description: searchedWeatherObject.description,
        city: searchedWeatherObject.city,
        temp: searchedWeatherObject.temp,
        icon: searchedWeatherObject.icon
      }

      db.getCityIDByName(search, function(error, result){
          if (error) {
            console.log("error with getCityIDByName")
          }
          else if (result == undefined) {
            // insert city into database
            console.log("no city entry, insert city")
            if (runOnce) {
              runOnce = false
            
            db.insertCity(search, function(error){
              if(error) {
                console.log("error")
              }
            })
            db.getCityIDByName(search,function(error, result){
              if (error) {
                console.log(error)
              } else {
                db.insertWeather(
                  searchedWeatherObject.weather,
                  searchedWeatherObject.temp,
                  searchedWeatherObject.description,
                  searchedWeatherObject.icon,
                  searchedWeatherObject.dt,
                  result.id, function(error){
                    if (error) console.log(error)
                  })
              }
            })
          }
          } else {
            // only insert weather data
            if (runOnce) {
              runOnce = false
            
            db.insertWeather(
              searchedWeatherObject.weather,
              searchedWeatherObject.temp,
              searchedWeatherObject.description,
              searchedWeatherObject.icon,
              searchedWeatherObject.dt,
              result.id, function(error){
                if (error) {
                  console.log(error)
                }
            })
            console.log("result from app.js: " + result.id)
          }
          }

      })

      

      res.render("searchedLocation.hbs", model)


    }
    else {

      res.render("errorSearchPage.hbs", {})
    }
  })

});

app.get('/database', function (req, res) {

  db.getAllCities(function (error, city) {
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

app.get('/showCityInfo/:id', function (req, res) {

  const id = req.params.id
  console.log(id)
  db.getCityNameById(id, function (city, error) {
    if (error) {
      console.log(error)
    } else {

    }
  })
})

app.listen(8080, function () {
  console.log("server listening on port 8080")
});


// --- FUNCTIONS --- 
async function getDefaultWeather() {

  defaultWeatherObjects.splice(0, defaultWeatherObjects.length)
  defaultLocations.forEach(element => {
    request(`http://api.openweathermap.org/data/2.5/weather?q=${element}&APPID=9fd9e6e3123d143241acf644b95671cd`, { json: true }, (err, res, body) => {
      if (err) { return console.log("error:" + err); }
      else {
        defaultWeatherObjects.push(new Weather(
          body.name,
          body.weather[0].main,
          (body.main.temp - 273.15).toFixed(1),
          body.weather[0].description,
          body.weather[0].icon,
          1
        ))
      }
    })
  });

}

function getWeatherByCity(searchedCity, callback) {

  // const temp = new Temperature

  request(`http://api.openweathermap.org/data/2.5/weather?q=${searchedCity}&APPID=9fd9e6e3123d143241acf644b95671cd`, { json: true }, (err, res, body) => {
    if (err) {
      console.log("error:" + err);
    }
    else {
      try {

        searchedWeatherObject.weather = body.weather[0].main
        searchedWeatherObject.description = body.weather[0].description
        searchedWeatherObject.city = body.name
        searchedWeatherObject.temp = (body.main.temp - 273.15).toFixed(1)
        searchedWeatherObject.icon = body.weather[0].icon
        searchedWeatherObject.dt = body.dt
        callback();

      } catch (error) {
        callback()
      }

    }

  });

}


