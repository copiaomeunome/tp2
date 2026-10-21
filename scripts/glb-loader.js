async function loadGLB(gl,url) {
    const response = await fetch(url,{cache:"no-cache"});
    if(!response.ok) throw new Error("Erro ao carregar " + url);
    const arquivo = await response.arrayBuffer();
    const view = new DataView(arquivo);
    if(view.getUint32(0,true) !== 0x46546c67 || view.getUint32(4,true) !== 2) throw new Error("GLB invalido");
    let gltf,bin;
    for(let offset = 12;offset < arquivo.byteLength;) {
        const tamanho = view.getUint32(offset,true);
        const tipo = view.getUint32(offset + 4,true);
        offset += 8;
        if(tipo === 0x4e4f534a) gltf = JSON.parse(new TextDecoder().decode(new Uint8Array(arquivo,offset,tamanho)));
        if(tipo === 0x004e4942) bin = arquivo.slice(offset,offset + tamanho);
        offset += tamanho;
    }
    const tipos = {5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array};
    const componentes = {SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT4:16};
    const acessores = [];
    function lerAcessor(indice) {
        if(acessores[indice]) return acessores[indice];
        const acessor = gltf.accessors[indice];
        const Tipo = tipos[acessor.componentType];
        const quantidade = componentes[acessor.type];
        const dados = new Tipo(acessor.count * quantidade);
        if(acessor.bufferView !== undefined) {
            const buffer = gltf.bufferViews[acessor.bufferView];
            const offset = (buffer.byteOffset || 0) + (acessor.byteOffset || 0);
            const passo = buffer.byteStride || quantidade * Tipo.BYTES_PER_ELEMENT;
            for(let i = 0;i < acessor.count;i++) {
                dados.set(new Tipo(bin,offset + i * passo,quantidade),i * quantidade);
            }
        }
        if(acessor.sparse) {
            const sparse = acessor.sparse;
            const indicesView = gltf.bufferViews[sparse.indices.bufferView];
            const valoresView = gltf.bufferViews[sparse.values.bufferView];
            const TipoIndice = tipos[sparse.indices.componentType];
            const indices = new TipoIndice(bin,(indicesView.byteOffset || 0) + (sparse.indices.byteOffset || 0),sparse.count);
            const valores = new Tipo(bin,(valoresView.byteOffset || 0) + (sparse.values.byteOffset || 0),sparse.count * quantidade);
            for(let i = 0;i < sparse.count;i++) dados.set(valores.subarray(i * quantidade,(i + 1) * quantidade),indices[i] * quantidade);
        }
        acessores[indice] = dados;
        return dados;
    }
    const m4 = twgl.m4;
    const imagens = [];
    for(const imagem of gltf.images || []) {
        let blob;
        if(imagem.uri) {
            const resposta = await fetch(new URL(imagem.uri,new URL(url,location.href)));
            if(!resposta.ok) throw new Error("Erro ao carregar textura");
            blob = await resposta.blob();
        } else {
            const buffer = gltf.bufferViews[imagem.bufferView];
            blob = new Blob([bin.slice(buffer.byteOffset || 0,(buffer.byteOffset || 0) + buffer.byteLength)],{type:imagem.mimeType});
        }
        imagens.push(await createImageBitmap(blob,{colorSpaceConversion:"none",premultiplyAlpha:"none"}));
    }
    const texturas = (gltf.textures || []).map(textura=>{
        const resultado = criaTextura(gl,imagens[textura.source]);
        const sampler = gltf.samplers?.[textura.sampler] || {};
        gl.bindTexture(gl.TEXTURE_2D,resultado);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,sampler.wrapS ?? gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,sampler.wrapT ?? gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,sampler.magFilter ?? gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,sampler.minFilter ?? gl.LINEAR_MIPMAP_LINEAR);
        return resultado;
    });
    for(const imagem of imagens) imagem.close();
    const matrizes = [];
    const nos = [];
    function lerNo(indice,pai,animarNo) {
        const no = gltf.nodes[indice];
        let matriz = no.matrix;
        if(!matriz) {
            const [x,y,z,w] = no.rotation || [0,0,0,1];
            matriz = [1-2*(y*y+z*z),2*(x*y+z*w),2*(x*z-y*w),0,
                2*(x*y-z*w),1-2*(x*x+z*z),2*(y*z+x*w),0,
                2*(x*z+y*w),2*(y*z-x*w),1-2*(x*x+y*y),0,0,0,0,1];
            matriz = m4.scale(matriz,no.scale || [1,1,1]);
            matriz.set(no.translation || [0,0,0],12);
        }
        if(animarNo) matriz = animarNo(no.name || "",matriz);
        matrizes[indice] = m4.multiply(pai,matriz);
        nos.push(indice);
        for(const filho of no.children || []) lerNo(filho,matrizes[indice],animarNo);
    }
    for(const indice of gltf.scenes[gltf.scene || 0].nodes || []) lerNo(indice,m4.identity());
    const partes = [];
    const esqueletos = [];
    function atualizaOssos() {
        for(const esqueleto of esqueletos) {
            const skin = gltf.skins[esqueleto.skin];
            const inversas = skin.inverseBindMatrices === undefined ? null : lerAcessor(skin.inverseBindMatrices);
            const inversaModelo = m4.inverse(matrizes[esqueleto.no]);
            for(let i = 0;i < skin.joints.length;i++) {
                const inversa = inversas ? inversas.subarray(i * 16,i * 16 + 16) : m4.identity();
                esqueleto.ossos.set(m4.multiply(inversaModelo,m4.multiply(matrizes[skin.joints[i]],inversa)),i * 16);
            }
        }
    }
    for(const indice of nos) {
        const no = gltf.nodes[indice];
        if(no.mesh === undefined) continue;
        let ossos;
        if(no.skin !== undefined) {
            const skin = gltf.skins[no.skin];
            if(skin.joints.length > 48) throw new Error("Modelo com mais de 48 ossos");
            ossos = new Float32Array(skin.joints.length * 16);
            esqueletos.push({no:indice,skin:no.skin,ossos});
        }
        for(const primitiva of gltf.meshes[no.mesh].primitives) {
            const atributos = primitiva.attributes;
            const material = gltf.materials?.[primitiva.material];
            const pbr = material?.pbrMetallicRoughness;
            const textura = pbr?.baseColorTexture;
            const arrays = {};
            const campos = {POSITION:"position",NORMAL:"normal",JOINTS_0:"joints",WEIGHTS_0:"weights"};
            campos["TEXCOORD_" + (textura?.texCoord || 0)] = "texcoord";
            for(const [nome,campo] of Object.entries(campos)) {
                if(atributos[nome] === undefined) continue;
                const acessor = gltf.accessors[atributos[nome]];
                arrays[campo] = {numComponents:componentes[acessor.type],data:lerAcessor(atributos[nome]),normalize:acessor.normalized || false};
            }
            if(primitiva.indices !== undefined) arrays.indices = lerAcessor(primitiva.indices);
            partes.push({
                no:indice,ossos:arrays.joints && arrays.weights ? ossos : null,
                bufferInfo:criaBufferModelo(gl,arrays),
                model:matrizes[indice],
                color:pbr?.baseColorFactor || [1,1,1,1],
                textura:textura ? texturas[textura.index] : null,
                brilho:5 + (1 - (pbr?.roughnessFactor ?? 1)) * 95,
                especular:0.08 + (1 - (pbr?.roughnessFactor ?? 1)) * 0.3,
                emissao:material?.emissiveFactor || [0,0,0],
                mode:primitiva.mode ?? gl.TRIANGLES
            });
        }
    }
    atualizaOssos();
    partes.atualizarPose = (animarNo)=>{
        nos.length = 0;
        for(const indice of gltf.scenes[gltf.scene || 0].nodes || []) lerNo(indice,m4.identity(),animarNo);
        atualizaOssos();
        for(const parte of partes) parte.modelLocal = matrizes[parte.no];
    };
    return partes;
}
