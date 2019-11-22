class Temperature {
    constructor();
    
    constructor(id, value, datetime, city) {
        this.id = id;
        this.value = value;
        this.datetime = datetime;
        this.city = city;
    }

    get id(){
        return this.id;
    }

    get value(){
        return this.value;
    }

    set value(value){
        this.value = value;
    }

    get datetime(){
        return this.datetime;
    }

    set datetime(datetime){
        this.datetime = datetime;
    }

    get city(){
        return this.city;
    }

    set city(city){
        this.city = city;
    }
}

module.exports = Temperature