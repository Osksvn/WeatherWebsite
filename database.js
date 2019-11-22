const sqlite3 = require('sqlite3');

const db = new sqlite3.Database('DB/database.db');

db.run('CREATE DATABASE IF NOT EXISTS weatherforecast')

db.run('CREATE TABLE IF NOT EXISTS city(id interger primary key autoincrement, name text)', function(err){
    if(err) {
        console.log('error creating city table');
    }
    else{
        console.log('city table created successfully !');
    }   
})


db.run('CREATE TABLE IF NOT EXISTS temperature(id interger primary key autoincrement, value float, datetime integer, city_id integer foreingn key references city(id) )', function(err){
    if(err) {
        console.log('error creating city table');
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

