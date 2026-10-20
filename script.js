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
    const marowak = await loadGLB(gl,"./assets/marowak_alola.glb");
    const jigglypuff =  await loadGLB(gl,"./assets/jigglypuff.glb");
    const branca = criaTextura(gl,new Uint8Array([255,255,255,255]),1,1);
    const normalLisa = criaTextura(gl,new Uint8Array([128,128,255,255]),1,1);
    return{programInfo,cubone,marowak,jigglypuff,branca,normalLisa};
}

function infoCenas() {
    const m4 = twgl.m4;
    const camera = [0,4.8,12];
    const view = m4.inverse(m4.lookAt(camera,[0,0.8,0],[0,1,0]));
    const projection =m4.perspective(Math.PI / 4,canvas.width / canvas.height,0.1,100);
    return {view,projection,camera};
}

function draw(programInfo,modelo,branca,normalLisa) {
    for(const parte of modelo) {
        gl.bindVertexArray(parte.vao);
        twgl.setUniforms(programInfo,{
            model:parte.model,normalMatrix:parte.normalMatrix,color:parte.color,
            textura:parte.textura || branca,mapaNormal:parte.mapaNormal || normalLisa,relevo:parte.relevo || 0,
            brilho:parte.brilho ?? 20,especular:parte.especular ?? 0.12,emissao:parte.emissao || [0,0,0]
        });
        twgl.drawBufferInfo(gl,parte.bufferInfo,parte.mode ?? gl.TRIANGLES,undefined,0,parte.instancias);
    }
}

async function main() {
    const {programInfo,cubone,marowak,jigglypuff,branca,normalLisa} = await configuraTudo();
    const m4 = twgl.m4;
    // que bosta, a origem dos dois veio diferente
    const posCubone = m4.scale(m4.rotateY(m4.translation([-3,1.73,0]),Math.PI / 4),[0.65,0.65,0.65]);
    const posMarowak = m4.scale(m4.rotateY(m4.translation([0,1.856,0]),Math.PI / 4),[0.7,0.7,0.7]);
    const posJigglypuff =  m4.scale(m4.rotateY(m4.translation([3,0,0]),Math.PI / 2),[0.85,0.85,0.85]);
    preparaModelo(gl,programInfo,cubone,posCubone);
    preparaModelo(gl,programInfo,marowak,posMarowak);
    preparaModelo(gl,programInfo,jigglypuff,posJigglypuff);
    const chao = preparaModelo(gl,programInfo,[{
        bufferInfo:twgl.primitives.createPlaneBufferInfo(gl,24,24),
        model:m4.translation([0,-0.02,0]),color:[0.18,0.18,0.18,1],especular:0
    }],m4.identity());
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0.15,0.18,0.23,1);
    function render() {
        twgl.resizeCanvasToDisplaySize(canvas);
        gl.viewport(0,0,canvas.width,canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT |gl.DEPTH_BUFFER_BIT);
        gl.useProgram(programInfo.program);
        const cena = infoCenas();
        twgl.setUniforms(programInfo,{
            ...cena,luzDirecao:[-1,2,3],luzCor:[0.45,0.45,0.45],ambiente:[0.5,0.5,0.5],
            luzPosicao:[3,3,2],luzPontual:[0.16,0.16,0.16],corNeblina:[0.15,0.18,0.23],distanciaNeblina:[20,40]
        });
        draw(programInfo,chao,branca,normalLisa);
        draw(programInfo,cubone,branca,normalLisa);
        draw(programInfo,marowak,branca,normalLisa);
        draw(programInfo,jigglypuff,branca,normalLisa);
        gl.bindVertexArray(null);
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}
const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl2");
if(gl) main().catch(console.error);
else console.error("WebGL2 indisponivel");
