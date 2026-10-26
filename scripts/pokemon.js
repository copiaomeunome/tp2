function apontaOsso(matriz,pai,direcao){
    const m4 = twgl.m4,v3 = twgl.v3;
    const atual = v3.normalize([matriz[4],matriz[5],matriz[6]]);
    const alvo = v3.normalize(m4.transformDirection(m4.inverse(pai),direcao));
    const eixo = v3.cross(atual,alvo);
    if(v3.length(eixo) < 0.00001) return matriz;
    const angulo = Math.acos(Math.max(-1,Math.min(1,v3.dot(atual,alvo))));
    const resultado = m4.multiply(m4.axisRotation(v3.normalize(eixo),angulo),matriz);
    resultado.set(matriz.slice(12,15),12);
    return resultado;
}

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
        return this.mover(dx,dz,dt);
    }
    mover(dx,dz,dt){
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
        return this.pos.x !== x || this.pos.z !== z;
    }
    atualizaModelo(){
        const m4 = twgl.m4;
        const posicao = [this.pos.x,this.pos.y + this.altura,this.pos.z];
        let transformacao = m4.rotateY(m4.translation(posicao),this.angulo);
        transformacao = m4.rotateZ(transformacao,this.inclinacao || 0);
        transformacao = m4.scale(transformacao,[this.escala,this.escala,this.escala]);
        this.transformacao = transformacao;
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
    constructor(gl,programInfo,modelo,evolucao){
        super(gl,programInfo,modelo,{x:-3,y:0,z:0},0.65,Math.PI / 4,1.73);
        this.modeloEvolucao = preparaModelo(gl,programInfo,evolucao,twgl.m4.identity());
        this.velocity = {x:1.1,z:1.1};
        this.estado = "parado";
        this.espera = 2;
        this.destino = null;
        this.evoluido = false;
    }
    escolherDestino(obstaculos){
        for(let i = 0;i < 20;i++){
            const ponto = {x:Math.random() * 19 - 9.5,z:Math.random() * 19 - 9.5};
            if(Math.hypot(ponto.x - this.pos.x,ponto.z - this.pos.z) < 2) continue;
            if(obstaculos.some(p=>Math.hypot(ponto.x - p.pos.x,ponto.z - p.pos.z) < 2)) continue;
            this.destino = ponto;
            this.estado = "andando";
            return;
        }
        this.espera = 1;
    }
    update(dt,periodo,obstaculos){
        if(this.estado === "sentado" || this.estado === "deitado"){
            const pose = periodo === "noite" ? "deitado" : "sentado";
            if(this.estado !== pose){this.estado = pose;this.aplicaPose();}
            return;
        }
        if(!this.destino){
            this.mover(0,0,dt);
            this.espera -= dt;
            if(this.espera <= 0) this.escolherDestino(obstaculos);
            return;
        }
        const dx = this.destino.x - this.pos.x,dz = this.destino.z - this.pos.z;
        const distancia = Math.hypot(dx,dz);
        const passo = Math.min(dt,distancia / this.velocity.x);
        const x = this.pos.x + dx / (distancia || 1) * this.velocity.x * passo;
        const z = this.pos.z + dz / (distancia || 1) * this.velocity.z * passo;
        if(obstaculos.some(p=>Math.hypot(x - p.pos.x,z - p.pos.z) < 1.8) || distancia < 0.03){
            this.destino = null;
            this.estado = "parado";
            this.espera = 1.5 + Math.random() * 2.5;
            this.mover(0,0,dt);
            return;
        }
        this.mover(dx,dz,passo);
    }
    alternarPose(periodo){
        const descansando = this.estado === "sentado" || this.estado === "deitado";
        this.estado = descansando ? "parado" : periodo === "noite" ? "deitado" : "sentado";
        this.destino = null;
        this.espera = 2;
        this.aplicaPose();
    }
    aplicaPose(){
        this.tempoAndando = 0;
        this.inclinacao = this.estado === "deitado" ? -Math.PI / 2 : 0;
        const descansando = this.estado === "sentado" || this.estado === "deitado";
        this.modelo.atualizarPose(descansando ? (nome,matriz,pai)=>{
            if(nome.startsWith("DEF-thigh.") || nome.startsWith("DEF-shin.") || nome.startsWith("DEF-foot.")) return apontaOsso(matriz,pai,this.estado === "sentado" ? [-1,-0.04,0] : [0,-1,0]);
            if(nome.startsWith("DEF-upper_arm.") || nome.startsWith("DEF-forearm.") || nome.startsWith("DEF-hand.")) return apontaOsso(matriz,pai,this.estado === "sentado" ? [-1,-0.15,nome.endsWith(".R") ? -0.12 : 0.12] : [0,-1,0]);
            return matriz;
        } : undefined);
        // ajusta pela malha para nao enterrar o corpo no chao
        this.altura = 0;
        this.atualizaModelo();
        this.altura = -this.modelo.limites(this.transformacao).min[1];
        this.atualizaModelo();
    }
    evoluir(){
        if(this.evoluido) return;
        this.evoluido = true;
        this.modelo = this.modeloEvolucao;
        this.escala = 0.7;
        this.aplicaPose();
    }
    andar(nome,matriz){
        if(this.evoluido) return Marowak.prototype.andar.call(this,nome,matriz);
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
