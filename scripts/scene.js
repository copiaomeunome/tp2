import {Cubone,Marowak,Jigglypuff} from "./pokemon.js";

export class Scene{
    constructor(gl,programInfo,modelos){
        this.cubone = new Cubone(gl,programInfo,modelos.cubone);
        this.marowak = new Marowak(gl,programInfo,modelos.marowak);
        this.protagonista = new Jigglypuff(gl,programInfo,modelos.jigglypuff);
        this.pokemons = [this.cubone,this.marowak,this.protagonista];
    }
    update(dt){
        this.protagonista.isMoving.up = keys.w;
        this.protagonista.isMoving.down = keys.s;
        this.protagonista.isMoving.left = keys.a;
        this.protagonista.isMoving.right = keys.d;
        for(const pokemon of this.pokemons) pokemon.update(dt);
        return {pokemons:this.pokemons};
    }
}
