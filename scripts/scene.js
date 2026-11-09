import {Cubone,Jigglypuff} from "./pokemon.js";
import {OBSTACULOS} from "./terreno.js";

export class Scene{
    constructor(gl,programInfo,modelos){
        this.cubone = new Cubone(gl,programInfo,modelos.cubone,modelos.evolucao);
        this.protagonista = new Jigglypuff(gl,programInfo,modelos.jigglypuff);
        this.pokemons = [this.cubone,this.protagonista];
        this.periodo = "dia";
        this.noitesDormidas = 0;
        this.noitesPassadas = 0;
        this.dormiuNestaNoite = false;
        document.addEventListener("keydown",(event)=>{
            if(event.target instanceof HTMLInputElement || event.repeat) return;
            if(event.key.toLowerCase() === "p"){
                this.cubone.alternarPose(this.periodo);
                if(this.periodo === "noite" && this.cubone.estado === "deitado") this.dormiuNestaNoite = true;
            }
        });
    }
    update(dt,ciclo){
        if(ciclo.noites > this.noitesPassadas){
            if(this.dormiuNestaNoite && !this.cubone.evoluido) this.noitesDormidas++;
            this.dormiuNestaNoite = false;
            this.noitesPassadas = ciclo.noites;
        }
        this.periodo = ciclo.periodo;
        if(this.noitesDormidas >= 10) this.cubone.evoluir();
        this.protagonista.isMoving.up = keys.w;
        this.protagonista.isMoving.down = keys.s;
        this.protagonista.isMoving.left = keys.a;
        this.protagonista.isMoving.right = keys.d;
        const obstaculoPokemon = pokemon => ({x:pokemon.pos.x,z:pokemon.pos.z,raio:1});
        this.protagonista.update(dt,[...OBSTACULOS,obstaculoPokemon(this.cubone)]);
        this.cubone.update(dt,this.periodo,[...OBSTACULOS,obstaculoPokemon(this.protagonista)]);
        if(this.periodo === "noite" && this.cubone.estado === "deitado" && !this.cubone.evoluido) this.dormiuNestaNoite = true;
        return {pokemons:this.pokemons};
    }
}
