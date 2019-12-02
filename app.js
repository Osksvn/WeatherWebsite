const express = require("express")
const expressHandlebars = require("express-handlebars")
const request = require('request');
const app = express()
const db = require('./database')
const Weather = require('./models/weather')
var Chart = require('chart.js');
app.use(express.urlencoded())
app.use(express.json())


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

app.use(express.static('chart'))

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

  db.getAllCities(function (error, cities) {
    if (error) {
      console.log("error with get all cities")
    } else {

      var allInfos = []

      cities.forEach(el => {
        db.getWeatherByCityID(el.id, function (error, weather) {
          if (error) console.log(error)
          else allInfos.push(weather)
        })
      }
      )

      const model = {
        city: cities,
        allInfos: allInfos
      }

      res.render("compareForm.hbs", model)
    }
  })
})

app.get('/showCityInfo/:id', function (req, res) {

  const id = req.params.id
  var cityName
  db.getCityNameById(id, function (error, cityname) {
    if (error) {
      console.log(error)
    } else cityName = cityname
  })
  db.getWeatherByCityID(id, function (error, result) {
    if (error) {
      console.log(error)
    } else {

      result.forEach(el => {
        el.datetime = timeConverter(el.datetime)
      });
      const model = {

        data: result,
        cityname: cityName

      }

      res.render("databaseDetails.hbs", model)
    }
  })

})

app.post('/comparison', function (req, res) {

  var body = req.body
  var weatherInfo = []
  var tempArray1 = []
  var tempArray2 = []
  var tempArray3 = []

  db.getWeatherByCityID(body.cityOne, function (err, result) {
    if (err) {
      console.log(err)
    }
    else {
      weatherInfo.push(result)

      db.getWeatherByCityID(body.cityTwo, function (err, result) {
        if (err) {
          console.log(err)
        }
        else {
          weatherInfo.push(result)

          db.getWeatherByCityID(body.cityThree, function (err, result) {
            if (err) {
              console.log(err)
            }
            else {
              weatherInfo.push(result)
              weatherInfo[0].forEach( el => {
                tempArray1.push(el.temp)
              })

              weatherInfo[1].forEach( el => {
                tempArray2.push(el.temp)
              })
              weatherInfo[2].forEach( el => {
                tempArray3.push(el.temp)
              })

              console.log(tempArray1)

              var chart = `
              <script>
              console.log(${tempArray1})
              var ctx = document.getElementById('myChart').getContext('2d');
              var myChart = new Chart(ctx, {
                  type: 'line',
                  data: {
                      labels: ['time', 'time', 'time', 'time', 'time', 'time'],
                      datasets: [{
                          label: "city one",
                          data: [${tempArray1}],
                          borderColor: "Red",
                          backgroundColor: "Red",
                          borderWidth: 1,
                          fill: false
                      }, {
                          label: 'city two name',
                          data: [${tempArray2}],
                          backgroundColor: "Green",
                          borderColor: "Green",
                          borderWidth: 1,
                          fill: false
                      }, {
                          label: 'City three name',
                          data: [${tempArray3}],
                          backgroundColor: "Blue",
                          borderColor: "Blue",
                          borderWidth: 1,
                          fill: false
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
              </script> `
              

              const model = {
                chart: chart
              }

              res.render("compare.hbs", model)
            }
          })
        }
      })
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

function timeConverter(UNIX_timestamp) {
  var a = new Date(UNIX_timestamp * 1000);
  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  var sec = a.getSeconds();
  var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec;
  return time;
}
// CHART


// var myLineChart = new Chart(ctx, {
//   type: 'line',
//   data: data,
//   options: options
// });


