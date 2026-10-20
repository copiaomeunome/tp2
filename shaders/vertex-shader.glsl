#version 300 es

layout(location=0) in vec4 position;
layout(location=1) in vec3 normal;
layout(location=2) in vec2 texcoord;
layout(location=3) in vec4 instancia;

uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;
uniform mat4 normalMatrix;
out vec3 vPosicao;
out vec3 vNormal;
out vec2 vUv;

void main() {
    vec4 mundo = model * vec4(position.xyz * instancia.w + instancia.xyz,1);
    vPosicao = mundo.xyz;
    vNormal = mat3(normalMatrix) * normal;
    vUv = texcoord;
    gl_Position = projection * view * mundo;
}
