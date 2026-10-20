#version 300 es

precision highp float;

uniform vec4 color;
uniform sampler2D textura;
uniform sampler2D mapaNormal;
uniform float relevo;
uniform float brilho;
uniform float especular;
uniform vec3 emissao;
uniform vec3 camera;
uniform vec3 luzDirecao;
uniform vec3 luzCor;
uniform vec3 luzPosicao;
uniform vec3 luzPontual;
uniform vec3 ambiente;
uniform vec3 corNeblina;
uniform vec2 distanciaNeblina;
in vec3 vPosicao;
in vec3 vNormal;
in vec2 vUv;

out vec4 outColor;

vec3 ilumina(vec3 n,vec3 l,vec3 v,vec3 corLuz,vec3 base) {
    float difusa = max(dot(n,l),0.0);
    float reflexo = 0.0;
    if(difusa > 0.0) reflexo = pow(max(dot(reflect(-l,n),v),0.0),brilho) * especular;
    return corLuz * (base * difusa + reflexo);
}

vec3 srgbParaLinear(vec3 cor) {
    return mix(cor / 12.92,pow((cor + 0.055) / 1.055,vec3(2.4)),step(vec3(0.04045),cor));
}

vec3 linearParaSrgb(vec3 cor) {
    return mix(cor * 12.92,1.055 * pow(cor,vec3(1.0 / 2.4)) - 0.055,step(vec3(0.0031308),cor));
}

void main() {
    vec4 amostra = texture(textura,vUv);
    vec4 base = color * vec4(srgbParaLinear(amostra.rgb),amostra.a);
    vec3 n = normalize(vNormal);
    if(!gl_FrontFacing) n = -n;
    if(relevo > 0.0) {
        vec3 dp1 = dFdx(vPosicao),dp2 = dFdy(vPosicao);
        vec2 uv1 = dFdx(vUv),uv2 = dFdy(vUv);
        vec3 perpendicular2 = cross(dp2,n),perpendicular1 = cross(n,dp1);
        vec3 t = perpendicular2 * uv1.x + perpendicular1 * uv2.x;
        vec3 b = perpendicular2 * uv1.y + perpendicular1 * uv2.y;
        float escala = inversesqrt(max(max(dot(t,t),dot(b,b)),0.000001));
        vec3 detalhe = texture(mapaNormal,vUv).xyz * 2.0 - 1.0;
        detalhe.xy *= relevo;
        n = normalize(mat3(t * escala,b * escala,n) * detalhe);
    }
    vec3 observador = normalize(camera - vPosicao);
    vec3 resultado = base.rgb * ambiente + emissao;
    resultado += ilumina(n,normalize(luzDirecao),observador,luzCor,base.rgb);
    vec3 paraLuz = luzPosicao - vPosicao;
    float distancia = length(paraLuz);
    float atenuacao = 1.0 / (1.0 + 0.09 * distancia + 0.032 * distancia * distancia);
    resultado += ilumina(n,normalize(paraLuz),observador,luzPontual,base.rgb) * atenuacao;
    float neblina = smoothstep(distanciaNeblina.x,distanciaNeblina.y,length(camera - vPosicao));
    outColor = vec4(mix(linearParaSrgb(max(resultado,vec3(0))),corNeblina,neblina),base.a);
}
