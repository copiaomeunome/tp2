export class Camera{
    constructor(canvas){
        this.canvas = canvas;
        this.modo = 1;
        this.automatica = {angulo:0,elevacao:Math.PI / 4,distancia:14};
        this.orbital = {angulo:0,elevacao:Math.PI / 4,distancia:14};
        this.seguir = {angulo:0,elevacao:0.38,distancia:7};
        this.arrastando = null;
        document.addEventListener("keydown",(event)=>{
            if(event.target instanceof HTMLInputElement) return;
            if(["1","2","3"].includes(event.key)){
                this.modo = Number(event.key);
                this.soltaMouse();
            }
        });
        canvas.addEventListener("pointerdown",(event)=>{
            if(this.modo !== 2 || event.button !== 0) return;
            this.arrastando = {id:event.pointerId,x:event.clientX,y:event.clientY};
            canvas.setPointerCapture(event.pointerId);
        });
        canvas.addEventListener("pointermove",(event)=>{
            if(!this.arrastando || event.pointerId !== this.arrastando.id) return;
            this.orbital.angulo -= (event.clientX - this.arrastando.x) * 0.006;
            this.orbital.elevacao += (event.clientY - this.arrastando.y) * 0.006;
            this.orbital.elevacao = Math.max(0.1,Math.min(Math.PI / 2 - 0.1,this.orbital.elevacao));
            this.arrastando.x = event.clientX;
            this.arrastando.y = event.clientY;
        });
        canvas.addEventListener("pointerup",()=>this.soltaMouse());
        canvas.addEventListener("pointercancel",()=>this.soltaMouse());
        canvas.addEventListener("lostpointercapture",()=>{this.arrastando = null;});
        window.addEventListener("blur",()=>this.soltaMouse());
        canvas.addEventListener("wheel",(event)=>{
            event.preventDefault();
            const camera = this.configuracao();
            const unidade = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? canvas.clientHeight : 1;
            const delta = Math.max(-300,Math.min(300,event.deltaY * unidade));
            const minimo = this.modo === 3 ? 3 : 5;
            camera.distancia = Math.max(minimo,Math.min(35,camera.distancia * Math.exp(delta * 0.001)));
        },{passive:false});
    }
    soltaMouse(){
        if(this.arrastando && this.canvas.hasPointerCapture(this.arrastando.id)) this.canvas.releasePointerCapture(this.arrastando.id);
        this.arrastando = null;
    }
    configuracao(){
        if(this.modo === 1) return this.automatica;
        if(this.modo === 2) return this.orbital;
        return this.seguir;
    }
    update(dt,protagonista){
        const m4 = twgl.m4;
        if(this.modo === 1) this.automatica.angulo += dt * 0.2;
        const configuracao = this.configuracao();
        const alvo = this.modo === 3 ? [protagonista.pos.x,protagonista.pos.y + 1,protagonista.pos.z] : [0,0.8,0];
        const horizontal = Math.cos(configuracao.elevacao) * configuracao.distancia;
        const camera = [
            alvo[0] + Math.sin(configuracao.angulo) * horizontal,
            alvo[1] + Math.sin(configuracao.elevacao) * configuracao.distancia,
            alvo[2] + Math.cos(configuracao.angulo) * horizontal
        ];
        const view = m4.inverse(m4.lookAt(camera,alvo,[0,1,0]));
        const projection = m4.perspective(Math.PI / 4,this.canvas.width / this.canvas.height,0.1,100);
        return {view,projection,camera};
    }
}
