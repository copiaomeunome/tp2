#version 300 es

layout(location=0) in vec4 position;
layout(location=1) in vec3 normal;
layout(location=2) in vec2 texcoord;
layout(location=3) in vec4 instancia;
layout(location=4) in vec4 joints;
layout(location=5) in vec4 weights;
uniform bool usaOssos;
uniform mat4 ossos[48];

uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;
uniform mat4 normalMatrix;
out vec3 vPosicao;
out vec3 vNormal;
out vec2 vUv;

void main() {
    vec4 posicao = position;
    vec3 normalLocal = normal;
    if(usaOssos) {
        mat4 skin = ossos[int(joints.x)] * weights.x + ossos[int(joints.y)] * weights.y
            + ossos[int(joints.z)] * weights.z + ossos[int(joints.w)] * weights.w;
        posicao = skin * position;
        normalLocal = transpose(inverse(mat3(skin))) * normal;
    }
    vec4 mundo = model * vec4(posicao.xyz * instancia.w + instancia.xyz,1);
    vPosicao = mundo.xyz;
    vNormal = mat3(normalMatrix) * normalLocal;
    vUv = texcoord;
    gl_Position = projection * view * mundo;
}
