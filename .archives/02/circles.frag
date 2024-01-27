#version 450

layout(binding = 0) uniform UniformBufferObject {
    float iTime;
    vec2 iResolution;
    vec2 iMouse;
} ubo;

layout(location = 0) in vec3 fragColor;
layout(location = 0) out vec4 outColor;

void main() {
    vec2 uv = gl_FragCoord.xy/ubo.iResolution.y;
    vec2 mouse = ubo.iMouse/ubo.iResolution.y;

    vec2 PtoM = vec2(uv.x-mouse.x, uv.y-mouse.y);
    float dist = sqrt(pow(PtoM.x, 2) + pow(PtoM.y, 2));

    vec3 col = 0.5*cos(dist*100) + 0.5*cos(ubo.iTime+uv.xyx+vec3(0,2,4));

    outColor = vec4(col, 1.0);
}
