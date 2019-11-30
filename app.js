const express = require("express")
const expressHandlebars = require("express-handlebars")
const https = require("https")
const request = require('request');
const app = express()
const db = require('./database')
const Temperature = require('./models/temperature')
const Weather = require('./models/weather')
var d3 = require("d3");
var Chart = require('chart.js');

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
    getDefaultWeather()
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

      db.getCityIDByName(searchedWeatherObject.city, function (error, result) {
        if (error) {
          console.log("error with getCityIDByName")
        }
        else if (result == undefined) {
          // insert city into database
          console.log("no city entry, insert city")
          if (runOnce) {
            runOnce = false

            db.insertCity(searchedWeatherObject.city, function (error) {
              if (error) {
                console.log("error")
              }
            })
            db.getCityIDByName(searchedWeatherObject.city, function (error, result) {
              if (error) {
                console.log(error)
              } else {
                db.insertWeather(
                  searchedWeatherObject.weather,
                  searchedWeatherObject.temp,
                  searchedWeatherObject.description,
                  searchedWeatherObject.icon,
                  searchedWeatherObject.dt,
                  result.id, function (error) {
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
              result.id, function (error) {
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

app.get('/compare', function (req, res) {

  db.getAllCities(function (error, city) {
    if (error) {
      console.log("error with get all cities")
    } else {

      const model = {

        city: city

      }

      res.render("compare.hbs", model)
    }
  })
})

app.get('/showCityInfo/:id', function (req, res) {

  const id = req.params.id
  var cityName
  var datetimeArray = []
  var datetime
  db.getCityNameById(id, function(error, cityname){
    if (error) {
      console.log(error)
    }else cityName = cityname
  })
  db.getWeatherByCityID(id, function (error, result) {
    if (error) {
      console.log(error)
    } else {
      const model = {

        data: result,
        cityname: cityName

      }

      res.render("databaseDetails.hbs", model)
    }
  })
 
})

app.listen(8080, function () {
  console.log("server listening on port 8080")
});


// --- FUNCTIONS --- 
async function getDefaultWeather() {

  defaultLocations.forEach(element => {
    request(`http://api.openweathermap.org/data/2.5/weather?q=${element}&APPID=9fd9e6e3123d143241acf644b95671cd`, { json: true }, (err, res, body) => {
      if (err) { return console.log("error:" + err); }
      else {
        defaultWeatherObjects.unshift(new Weather(
          body.name,
          body.weather[0].main,
          (body.main.temp - 273.15).toFixed(1),
          body.weather[0].description,
          body.weather[0].icon,
          1
        ))

        defaultWeatherObjects.splice(4, defaultWeatherObjects.length)
      }
    })
  });

}


function getWeatherByCity(searchedCity, callback) {

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

function timeConverter(UNIX_timestamp){
  var a = new Date(UNIX_timestamp * 1000);
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  var sec = a.getSeconds();
  var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
  return time;
}
// CHART 
// var myLineChart = new Chart(ctx, {
//   type: 'line',
//   data: data,
//   options: options
// });

var charthtml =
  `<canvas id="myChart" width="400" height="400"></canvas>
<script>
var ctx = document.getElementById('myChart').getContext('2d');
var myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [{
            label: '# of Votes',
            data: [12, 19, 3, 5, 2, 3],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        }
    }
});
</script>`

