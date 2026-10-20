function criaTextura(gl,dados,largura,altura) {
    const textura = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D,textura);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);
    if(largura) gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,largura,altura,0,gl.RGBA,gl.UNSIGNED_BYTE,dados);
    else gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,dados);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.REPEAT);
    return textura;
}

function texturaTerreno(gl,cor) {
    const tamanho = 64;
    const alturas = new Float32Array(tamanho * tamanho);
    const pixels = new Uint8Array(tamanho * tamanho * 4);
    const normais = new Uint8Array(pixels.length);
    for(let i = 0;i < alturas.length;i++) {
        const ruido = Math.sin(i * 127.1 + 43.7) * 43758.5453;
        alturas[i] = ruido - Math.floor(ruido);
        for(let c = 0;c < 3;c++) pixels[i * 4 + c] = cor[c] * (0.65 + alturas[i] * 0.35);
        pixels[i * 4 + 3] = 255;
    }
    for(let y = 0;y < tamanho;y++) {
        for(let x = 0;x < tamanho;x++) {
            const i = y * tamanho + x;
            const dx = alturas[y * tamanho + (x + 1) % tamanho] - alturas[y * tamanho + (x + tamanho - 1) % tamanho];
            const dy = alturas[((y + 1) % tamanho) * tamanho + x] - alturas[((y + tamanho - 1) % tamanho) * tamanho + x];
            const n = twgl.v3.normalize([-dx,-dy,1]);
            for(let c = 0;c < 3;c++) normais[i * 4 + c] = (n[c] * 0.5 + 0.5) * 255;
            normais[i * 4 + 3] = 255;
        }
    }
    return {textura:criaTextura(gl,pixels,tamanho,tamanho),mapaNormal:criaTextura(gl,normais,tamanho,tamanho)};
}
