class Pokemon{
    constructor(gl,programInfo,modelo,pos,escala,angulo,altura){
        this.modelo = modelo;
        this.pos = pos;
        this.velocity = {x:3,z:3};
        this.isMoving = {up:false,down:false,left:false,right:false};
        this.escala = escala;
        this.angulo = angulo;
        this.altura = altura;
        this.tempoAndando = 0;
        preparaModelo(gl,programInfo,modelo,twgl.m4.identity());
        this.atualizaModelo();
    }
    update(dt){
        const dx = Number(this.isMoving.right) - Number(this.isMoving.left);
        const dz = Number(this.isMoving.down) - Number(this.isMoving.up);
        const tamanho = Math.hypot(dx,dz);
        const x = this.pos.x,z = this.pos.z;
        if(tamanho){
            this.pos.x = Math.max(-10.7,Math.min(10.7,x + dx / tamanho * this.velocity.x * dt));
            this.pos.z = Math.max(-10.7,Math.min(10.7,z + dz / tamanho * this.velocity.z * dt));
            this.angulo = Math.atan2(dz,-dx);
        }
        if(this.pos.x !== x || this.pos.z !== z){
            this.tempoAndando += dt;
            this.modelo.atualizarPose((nome,matriz)=>this.andar(nome,matriz));
            this.atualizaModelo();
        } else if(this.tempoAndando){
            this.tempoAndando = 0;
            this.modelo.atualizarPose();
            this.atualizaModelo();
        } else if(tamanho){
            this.atualizaModelo();
        }
    }
    atualizaModelo(){
        const m4 = twgl.m4;
        const posicao = [this.pos.x,this.pos.y + this.altura,this.pos.z];
        const transformacao = m4.scale(m4.rotateY(m4.translation(posicao),this.angulo),[this.escala,this.escala,this.escala]);
        for(const parte of this.modelo){
            parte.model = m4.multiply(transformacao,parte.modelLocal);
            parte.normalMatrix = m4.transpose(m4.inverse(parte.model));
        }
    }
    andar(nome,matriz){
        return matriz;
    }
}

export class Cubone extends Pokemon{
    constructor(gl,programInfo,modelo){
        super(gl,programInfo,modelo,{x:-3,y:0,z:0},0.65,Math.PI / 4,1.73);
    }
    andar(nome,matriz){
        const m4 = twgl.m4;
        const passo = Math.sin(this.tempoAndando * 10);
        const lado = nome.endsWith(".R") ? -1 : 1;
        if(nome.startsWith("DEF-thigh.")) matriz = m4.rotateX(matriz,passo * lado * 0.4);
        if(nome.startsWith("DEF-shin.")) matriz = m4.rotateX(matriz,Math.max(0,-passo * lado) * 0.45);
        if(nome.startsWith("DEF-upper_arm.")) matriz = m4.rotateX(matriz,-passo * lado * 0.25);
        if(nome === "DEF-head") matriz = m4.rotateX(matriz,passo * 0.035);
        return matriz;
    }
}

export class Marowak extends Pokemon{
    constructor(gl,programInfo,modelo){
        super(gl,programInfo,modelo,{x:0,y:0,z:0},0.7,Math.PI / 4,1.856);
    }
    andar(nome,matriz){
        const m4 = twgl.m4;
        const passo = Math.sin(this.tempoAndando * 8);
        const lado = nome.endsWith(".R") ? -1 : 1;
        if(nome.startsWith("DEF-thigh.")) matriz = m4.rotateX(matriz,passo * lado * 0.3);
        if(nome.startsWith("DEF-shin.")) matriz = m4.rotateX(matriz,Math.max(0,-passo * lado) * 0.35);
        if(nome.startsWith("DEF-upper_arm.")) matriz = m4.rotateX(matriz,-passo * lado * 0.18);
        if(nome === "DEF-hand.R") matriz = m4.rotateZ(matriz,passo * 0.06);
        if(nome === "DEF-tail.01") matriz = m4.rotateX(matriz,passo * 0.04);
        return matriz;
    }
}

export class Jigglypuff extends Pokemon{
    constructor(gl,programInfo,modelo){
        super(gl,programInfo,modelo,{x:3,y:0,z:0},0.85,Math.PI / 2,0);
    }
    andar(nome,matriz){
        const m4 = twgl.m4;
        const passo = Math.sin(this.tempoAndando * 12);
        const lado = nome.endsWith(".R") ? -1 : 1;
        if(nome.startsWith("leg.")) matriz = m4.rotateX(matriz,passo * lado * 0.5);
        if(nome.startsWith("arm.")) matriz = m4.rotateX(matriz,-passo * lado * 0.3);
        if(nome.startsWith("ear.")) matriz = m4.rotateX(matriz,passo * lado * 0.06);
        if(nome === "hair") matriz = m4.rotateX(matriz,passo * 0.08);
        return matriz;
    }
}
