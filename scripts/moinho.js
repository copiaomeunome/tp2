const X = -1.8;
const Z = -3.8;

export const OBSTACULO_MOINHO = {x:X,z:Z,raio:1.35};

export function criaMoinho(gl,programInfo){
    const m4 = twgl.m4;
    const caixa = twgl.primitives.createCubeBufferInfo(gl,1);
    const esfera = twgl.primitives.createSphereBufferInfo(gl,1,10,6);
    const base = {
        bufferInfo:caixa,
        model:m4.scale(m4.translation([X,1.5,Z]),[2,3,2]),
        color:[0.55,0.37,0.2,1],especular:0.05,brilho:12
    };
    const pas = [];
    for(let i = 0;i < 4;i++){
        let local = m4.rotationZ(i * Math.PI / 2);
        local = m4.translate(local,[0,0.85,0]);
        local = m4.scale(local,[0.35,1.5,0.12]);
        pas.push({bufferInfo:caixa,model:local,color:[0.9,0.85,0.67,1],especular:0.05,brilho:12});
    }
    pas.push({
        bufferInfo:esfera,model:m4.scaling([0.23,0.23,0.23]),
        color:[0.3,0.2,0.1,1],especular:0.05,brilho:12
    });
    const modelo = preparaModelo(gl,programInfo,[base,...pas],m4.identity());
    let angulo = 0;
    function update(dt){
        angulo = (angulo + dt * 0.8) % (Math.PI * 2);
        const eixo = m4.rotateZ(m4.translation([X,3.05,Z + 1.08]),angulo);
        for(const parte of pas){
            parte.model = m4.multiply(eixo,parte.modelLocal);
            parte.normalMatrix = m4.transpose(m4.inverse(parte.model));
        }
    }
    update(0);
    return {modelo,update};
}
