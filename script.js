async function loadShader(url) {
    const response = await fetch(url);
    return await response.text();
}

async function configuraTudo() {
    const vertexShader =await loadShader("./shaders/vertex-shader.glsl");
    const fragmentShader =await loadShader("./shaders/fragment-shader.glsl");
    const programInfo =twgl.createProgramInfo(gl,[vertexShader, fragmentShader]);
    const sphere =twgl.primitives.createSphereBufferInfo(gl,0.5,32,16);
    return{programInfo,sphere};
}

function infoCenas() {
    const m4 = twgl.m4;
    let model = m4.identity();
    model = m4.rotateX(model,valor);
    const view = m4.identity();
    const modelView =m4.multiply(view, model);
    const projection =m4.ortho(-1, 1,-1, 1,-1, 1);
    return {modelView,projection};
}

function draw(programInfo, sphere, cena) {
    gl.useProgram(programInfo.program);
    twgl.setBuffersAndAttributes(gl,programInfo,sphere);
    twgl.setUniforms(programInfo,{projection: cena.projection,modelView: cena.modelView,color: [1, 0, 0, 1]});
    twgl.drawBufferInfo(gl,sphere);
}


let valor = 0;
async function main() {
    const {programInfo,sphere} = await configuraTudo();
    function render(dt) {
        gl.clear(gl.COLOR_BUFFER_BIT |gl.DEPTH_BUFFER_BIT);
        valor += 0.01;
        const cena = infoCenas();
        draw(programInfo,sphere,cena);
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}
const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl2");
main();