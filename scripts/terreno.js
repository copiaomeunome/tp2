export const RAIO_TERRENO = 12;

const objetos = [
    {tipo:'arvore',x:-6,z:-4,raio:1},
    {tipo:'arvore',x:5,z:-6,raio:1},
    {tipo:'pedra',x:6,z:3,raio:1},
    {tipo:'pedra',x:-7,z:3,raio:0.8},
    {tipo:'arbusto',x:0,z:7,raio:1},
    {tipo:'arbusto',x:-3,z:-7,raio:1},
    {tipo:'arbusto',x:8,z:-2,raio:1},
    {tipo:'cogumelo',x:3,z:5,raio:0.65}
];

export const OBSTACULOS = objetos.map(({x,z,raio})=>({x,z,raio}));

export function criaTerreno(gl,programInfo){
    const m4 = twgl.m4;
    const esfera = twgl.primitives.createSphereBufferInfo(gl,1,10,6);
    const chapeu = twgl.primitives.createSphereBufferInfo(gl,1,16,8,0,Math.PI / 2);
    const cone = twgl.primitives.createTruncatedConeBufferInfo(gl,1,0,1,10,1);
    const cilindro = twgl.primitives.createTruncatedConeBufferInfo(gl,1,1,1,12,1);
    const disco = twgl.primitives.createTruncatedConeBufferInfo(gl,RAIO_TERRENO,RAIO_TERRENO,0.16,48,1);
    const hemisferio = twgl.primitives.createSphereBufferInfo(gl,RAIO_TERRENO,48,16,Math.PI / 2,Math.PI);
    const partes = [];
    function parte(bufferInfo,pos,escala,cor,especular=0.05){
        partes.push({bufferInfo,model:m4.scale(m4.translation(pos),escala),color:[...cor,1],especular,brilho:12});
    }

    parte(disco,[0,-0.08,0],[1,1,1],[0.22,0.48,0.13]);
    parte(hemisferio,[0,-0.16,0],[1,1,1],[0.33,0.18,0.09]);
    for(const objeto of objetos){
        const {x,z,tipo} = objeto;
        if(tipo === 'arvore'){
            parte(cilindro,[x,1,z],[0.38,2,0.38],[0.32,0.14,0.055]);
            parte(cone,[x,2.65,z],[1.6,2.8,1.6],[0.08,0.38,0.11]);
            parte(cone,[x,3.6,z],[1.2,2.4,1.2],[0.12,0.46,0.14]);
        } else if(tipo === 'pedra'){
            parte(esfera,[x,0.45,z],[objeto.raio,0.7,objeto.raio * 0.8],[0.36,0.38,0.4],0.1);
        } else if(tipo === 'arbusto'){
            parte(esfera,[x,0.55,z],[0.85,0.65,0.7],[0.12,0.42,0.11]);
            parte(esfera,[x - 0.55,0.4,z],[0.55,0.45,0.55],[0.16,0.5,0.13]);
            parte(esfera,[x + 0.55,0.4,z],[0.55,0.45,0.55],[0.1,0.36,0.09]);
        } else if(tipo === 'cogumelo'){
            parte(cilindro,[x,0.35,z],[0.23,0.7,0.23],[0.9,0.85,0.7]);
            parte(chapeu,[x,0.7,z],[0.65,0.5,0.65],[0.8,0.16,0.12]);
        }
    }
    return preparaModelo(gl,programInfo,partes,m4.identity());
}
