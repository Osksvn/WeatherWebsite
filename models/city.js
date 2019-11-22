class City {
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }

    get id(){
        return this.id;
    }

    get name(){
        return this.name;
    }

    set name(name){
        this.name = name;
    }
}