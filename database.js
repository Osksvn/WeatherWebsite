const sqlite3 = require('sqlite3');

const db = new sqlite3.Database('weatherforecast.db');

// db.run('CREATE DATABASE IF NOT EXISTS weatherforecast')

db.run('CREATE TABLE IF NOT EXISTS city(id integer primary key autoincrement, name text unique)', function(err){
    if(err) {
        console.log('error creating city table' + " " +  err);
    }
    else{
        console.log('city table created successfully !');
    }   
})

db.run('CREATE TABLE IF NOT EXISTS weather(id integer primary key autoincrement, main text, temp float, desc text, icon text, datetime integer, city_id integer foreingn key references city(id) )', function(err){
    if(err) {
        console.log('error creating weather table' + " " +  err);
    }
    else{
        console.log('weather table created successfully !');
    }   
})


db.run('CREATE TABLE IF NOT EXISTS temperature(id integer primary key autoincrement, value float, datetime integer, city_id integer foreingn key references city(id) )', function(err){
    if(err) {
        console.log('error creating temperature table' + " " + err);
    }
    else{
        console.log('temperature table created successfully !');
    }   
})

//QUERIES FOR CITY
exports.getAllCities = function (callback){
    const query = 'SELECT * from city'
    db.all(query, function(err, city){
        callback(err, city)
    })
}

exports.getCityIDByName = function(name, callback){
    const query = "SELECT id FROM city WHERE name = ?"
    db.get(query, [name], function(error, result) {
        callback(error, result)
    })
}

exports.getCityNameById = function(id, callback) {
    const query = 'SELECT name FROM city where id = ?'
    db.get(query, [id], function(error, name){
        callback(error, name)
    })
}

exports.insertCity = function(name, callback){
    const query = "INSERT INTO city (name) VALUES(?)"
    db.run(query, [name], function(error){
        callback(error)
    })
}

//QUERIES FOR TEMPERATURE
exports.addTemperature = function(temperature, callback){
    const query = 'INSERT INTO temperature(value, datetime, city_id) VALUES(?,?,?)'
    db.run(query, [temperature.value, temperature.datetime, temperature.city_id], function(error){
        callback(error)
    })

}

exports.getTempAndWeatherByCityID = function(city_id, callback){
    const query = "SELECT * FROM temperature as t INNER JOIN weather as w where t.city_id = ? AND w.city_id = ?"
    db.get(query, [city_id, city_id], function(err, res){
        callback(err, res)
    })
}

//QUERIES FOR WEATHER
exports.getWeatherByCityID = function(city_id, callback) {
    const query = "SELECT * FROM weather where city_id = ?"
    db.all(query, [city_id], function(error, result){
        callback(error, result)
    })
}

exports.insertWeather = function(main, temp, desc, icon, datetime, city_id, callback){
    const query = "INSERT INTO weather(main, temp, desc, icon, datetime, city_id) VALUES (?, ?, ?, ?, ?, ?)"
    db.run(query, [main, temp, desc, icon, datetime, city_id], function(error){
        callback(error)
    })
}




