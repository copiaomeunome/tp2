import {Scene} from "./scripts/scene.js";
import {Camera} from "./scripts/camera.js";
import {DiaNoite} from "./scripts/dia-noite.js";

async function loadShader(url) {
    const response = await fetch(url,{cache:"no-cache"});
    if(!response.ok) throw new Error("Erro ao carregar " + url);
    return await response.text();
}

async function configuraTudo() {
    const vertexShader =await loadShader("./shaders/vertex-shader.glsl");
    const fragmentShader =await loadShader("./shaders/fragment-shader.glsl");
    const programInfo =twgl.createProgramInfo(gl,[vertexShader, fragmentShader]);
    const cubone = await loadGLB(gl,"./assets/cubone.glb");
    const evolucao = await loadGLB(gl,"./assets/marowak_alola.glb");
    const jigglypuff =  await loadGLB(gl,"./assets/jigglypuff.glb");
    const branca = criaTextura(gl,new Uint8Array([255,255,255,255]),1,1);
    const normalLisa = criaTextura(gl,new Uint8Array([128,128,255,255]),1,1);
    return{programInfo,cubone,evolucao,jigglypuff,branca,normalLisa};
}

function draw(programInfo,modelo,branca,normalLisa) {
    for(const parte of modelo) {
        gl.bindVertexArray(parte.vao);
        twgl.setUniforms(programInfo,{
            model:parte.model,normalMatrix:parte.normalMatrix,color:parte.color,
            textura:parte.textura || branca,mapaNormal:parte.mapaNormal || normalLisa,relevo:parte.relevo || 0,
            brilho:parte.brilho ?? 20,especular:parte.especular ?? 0.12,emissao:parte.emissao || [0,0,0],usaOssos:!!parte.ossos
        });
        if(parte.ossos) twgl.setUniforms(programInfo,{ossos:parte.ossos});
        twgl.drawBufferInfo(gl,parte.bufferInfo,parte.mode ?? gl.TRIANGLES,undefined,0,parte.instancias);
    }
}

async function main() {
    const {programInfo,cubone,evolucao,jigglypuff,branca,normalLisa} = await configuraTudo();
    const m4 = twgl.m4;
    const scene = new Scene(gl,programInfo,{cubone,evolucao,jigglypuff});
    const camera = new Camera(canvas);
    const diaNoite = new DiaNoite();
    for(const periodo of ["dia","noite"]){
        const input = document.getElementById("tempo-" + periodo);
        input.addEventListener("change",()=>{
            const valor = input.valueAsNumber;
            if(input.validity.valid) diaNoite.configurarDuracao(periodo,valor);
            input.value = periodo === "dia" ? diaNoite.duracaoDia : diaNoite.duracaoNoite;
        });
    }
    const chao = preparaModelo(gl,programInfo,[{
        bufferInfo:twgl.primitives.createPlaneBufferInfo(gl,24,24),
        model:m4.translation([0,-0.02,0]),color:[0.18,0.18,0.18,1],especular:0
    }],m4.identity());
    gl.enable(gl.DEPTH_TEST);
    const estadoCubone = document.getElementById("estado-cubone");
    const noitesEvolucao = document.getElementById("noites-evolucao");
    let estadoAnterior = "";
    let progressoAnterior = "";
    let anterior = performance.now();
    function render(tempo) {
        const dt = Math.min((tempo - anterior) / 1000,0.05);
        anterior = tempo;
        const {ceu,...iluminacao} = diaNoite.update(dt);
        const {pokemons} = scene.update(dt,diaNoite);
        const estado = `${scene.cubone.evoluido ? "Marowak de Alola" : "Cubone"}: ${scene.cubone.estado}.`;
        if(estado !== estadoAnterior){estadoCubone.textContent = estado;estadoAnterior = estado;}
        const faltam = Math.max(0,10 - scene.noitesDormidas);
        const progresso = scene.cubone.evoluido ? "Cubone evoluiu para Marowak de Alola!" : faltam === 1 ? "Falta 1 noite para evoluir." : `Faltam ${faltam} noites para evoluir.`;
        if(progresso !== progressoAnterior){noitesEvolucao.textContent = progresso;progressoAnterior = progresso;}
        twgl.resizeCanvasToDisplaySize(canvas);
        gl.viewport(0,0,canvas.width,canvas.height);
        gl.clearColor(...ceu,1);
        gl.clear(gl.COLOR_BUFFER_BIT |gl.DEPTH_BUFFER_BIT);
        gl.useProgram(programInfo.program);
        const cena = camera.update(dt,scene.protagonista);
        twgl.setUniforms(programInfo,{
            ...cena,...iluminacao,luzDirecao:[-1,2,3],luzPosicao:[3,3,2],distanciaNeblina:[20,40]
        });
        draw(programInfo,chao,branca,normalLisa);
        for(const pokemon of pokemons) draw(programInfo,pokemon.modelo,branca,normalLisa);
        gl.bindVertexArray(null);
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}
const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl2");
if(gl) main().catch(console.error);
else console.error("WebGL2 indisponivel");
