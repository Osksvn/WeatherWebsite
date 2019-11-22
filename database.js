const sqlite3 = require('sqlite3');

const db = new sqlite3.Database('weatherforecast.db');

// db.run('CREATE DATABASE IF NOT EXISTS weatherforecast')

db.run('CREATE TABLE IF NOT EXISTS city(id integer primary key autoincrement, name text)', function(err){
    if(err) {
        console.log('error creating city table' + " " +  err);
    }
    else{
        console.log('city table created successfully !');
    }   
})


db.run('CREATE TABLE IF NOT EXISTS temperature(id integer primary key autoincrement, value float, datetime integer, city_id integer foreingn key references city(id) )', function(err){
    if(err) {
        console.log('error creating city table' + " " + err);
    }
    else{
        console.log('city table created successfully !');
    }   
})


exports.getAllCities = function (callback){
    const query = 'SELECT * from city'
    db.all(query, function(err, city){
        callback(err, city)
    })
}

exports.getCityById = function(id, callback) {
    const query = 'SELECT name FROM city where id = ?'
    db.get(query, [id], function(error, name){
        if (error) {
            callback(error)
        } else {
            callback(name)
        }
    })


}




