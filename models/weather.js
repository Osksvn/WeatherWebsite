class City {
    constructor(id, main, description, icon, city_id) {
        this.id = id
        this.main = main
        this.description = description
        this.icon = icon
        this.city_id = city_id
    }

    get id(){
        return this.id
    }

    get main(){
        return this.main
    }

    set main(main){
        this.main = main
    }

    get description(){
        return this.description
    }
    
    set description(description){
        this.description = description
    }

    get icon(){
        return this.icon
    }

    set icon(icon){
        this.icon = icon
    }

    get city_id(){
        return this.city_id
    }

    set city_id(city_id){
        this.city_id = city_id
    }
}