#version 300 es

in vec4 position;

uniform mat4 projection;
uniform mat4 modelView;

void main() {
    gl_Position = projection * modelView * position;
}