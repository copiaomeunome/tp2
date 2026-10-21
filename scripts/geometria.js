function criaBufferModelo(gl,arrays) {
    const posicoes = arrays.position.data;
    const normais = arrays.normal?.data;
    const uv = arrays.texcoord?.data;
    const dados = new Float32Array(posicoes.length / 3 * 8);
    for(let i = 0;i < posicoes.length / 3;i++) {
        dados.set(posicoes.subarray(i * 3,i * 3 + 3),i * 8);
        dados.set(normais ? normais.subarray(i * 3,i * 3 + 3) : [0,1,0],i * 8 + 3);
        dados.set(uv ? uv.subarray(i * 2,i * 2 + 2) : [0,0],i * 8 + 6);
    }
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    gl.bufferData(gl.ARRAY_BUFFER,dados,gl.STATIC_DRAW);
    const atributos = {
        position:{buffer,numComponents:3,type:gl.FLOAT,stride:32,offset:0},
        normal:{buffer,numComponents:3,type:gl.FLOAT,stride:32,offset:12},
        texcoord:{buffer,numComponents:2,type:gl.FLOAT,stride:32,offset:24}
    };
    if(arrays.indices) atributos.indices = arrays.indices;
    if(arrays.joints) atributos.joints = arrays.joints;
    if(arrays.weights) atributos.weights = arrays.weights;
    return twgl.createBufferInfoFromArrays(gl,atributos);
}

function criaIlha(gl) {
    const position = [],normal = [],texcoord = [],indices = [];
    const lados = 32;
    // o topo e a lateral precisam de normais diferentes
    for(let i = 0;i <= lados;i++) {
        const angulo = i / lados * Math.PI * 2;
        const x = Math.cos(angulo),z = Math.sin(angulo);
        position.push(x,0,z);
        normal.push(0,1,0);
        texcoord.push(x * 2,z * 2);
    }
    position.push(0,0,0);
    normal.push(0,1,0);
    texcoord.push(0,0);
    for(let i = 0;i < lados;i++) indices.push(lados + 1,i + 1,i);
    const inicio = position.length / 3;
    for(let i = 0;i <= lados;i++) {
        const angulo = i / lados * Math.PI * 2;
        const x = Math.cos(angulo),z = Math.sin(angulo);
        position.push(x,0,z,x * 0.65,-1,z * 0.65);
        const n = twgl.v3.normalize([x,-0.35,z]);
        normal.push(...n,...n);
        texcoord.push(i / lados * 8,0,i / lados * 8,2);
        if(i < lados) {
            const p = inicio + i * 2;
            indices.push(p,p + 2,p + 1,p + 1,p + 2,p + 3);
        }
    }
    const fundo = position.length / 3;
    position.push(0,-1,0);
    normal.push(0,-1,0);
    texcoord.push(0,0);
    for(let i = 0;i < lados;i++) indices.push(fundo,inicio + i * 2 + 1,inicio + (i + 1) * 2 + 1);
    return criaBufferModelo(gl,{
        position:{data:new Float32Array(position)},normal:{data:new Float32Array(normal)},
        texcoord:{data:new Float32Array(texcoord)},indices:new Uint16Array(indices)
    });
}

function preparaModelo(gl,programInfo,modelo,transformacao) {
    const m4 = twgl.m4;
    for(const parte of modelo) {
        parte.modelLocal = parte.model;
        parte.model = m4.multiply(transformacao,parte.model);
        parte.normalMatrix = m4.transpose(m4.inverse(parte.model));
        parte.vao = twgl.createVAOFromBufferInfo(gl,programInfo,parte.bufferInfo);
    }
    return modelo;
}
