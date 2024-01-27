#version 450

layout(binding = 0) uniform UniformBufferObject {
    float iTime;
    vec2 iResolution;
    vec2 iMouse;
} ubo;

layout(location = 0) in vec3 fragColor;
layout(location = 0) out vec4 outColor;

const float pi = 3.14159265359;
const float renderDistance = 10000;
const float size = 1;

vec3 camCoo = vec3(5, 5, 5);
vec2 camOri = vec2(ubo.iMouse.y/200*pi/2, ubo.iMouse.x/200*pi/2);

vec3 cubeCoo = vec3(0, 0, 0);

vec3 oriToVec(vec2 ori) {
    vec3 vec;

    vec.x = sin(ori.x) * sin(ori.y);
    vec.y = sin(ori.x) * cos(ori.y);
    vec.z = cos(ori.x);

    return vec;
}

vec3 rot(vec3 vec, vec3 axeRot, float oriW) {
    return  vec*cos(oriW) + 
    cross(vec, axeRot) * sin(oriW) + 
    axeRot * dot(vec, axeRot) * (1 - cos(oriW));
}

bool verif(float cubeCoo, float touch) {
    touch = touch + 0.000001;
    if (cubeCoo <= touch && cubeCoo + size >= touch) {
        return true;
    }

    return false;
}

bool isRayTouching(vec3 camVec, vec3 camCoo, vec3 cubeCoo) {
    vec3 end = camVec * renderDistance + camCoo;

    vec3 dist = end-camCoo;
  
    // calculate steps required for generating pixels 
    float steps;
    if (abs(dist.x) > abs(dist.y) && abs(dist.x) > abs(dist.z)) {
        steps = abs(dist.x); 
    }
    else if (abs(dist.y) > abs(dist.x) && abs(dist.y) > abs(dist.z)) {
        steps = abs(dist.y);
    } else {
        steps = abs(dist.z);
    }
  
    // calculate increment in x & y for each steps 
    vec3 increment;
    increment.x = dist.x / steps;
    increment.y = dist.y / steps;
    increment.z = dist.z / steps;

    vec3 now = camCoo;
  
    for (int i = 0; i <= steps; i++) { 
        if (verif(cubeCoo.x, now.x)) {
            if (verif(cubeCoo.y, now.y)) {
                if (verif(cubeCoo.z, now.z)) {
                    outColor = vec4(1.0, 0.0, 0.0, 1.0);
                    return true;
                }
            }
        }
        now = now + increment;
    }

    return false;
}

void main() {
    float midSize = ubo.iResolution.x/2;
    vec2 deplacement = vec2((gl_FragCoord.y-midSize)/midSize, (gl_FragCoord.x-midSize)/midSize);
    //vec2 mouse = ubo.iMouse/ubo.iResolution.xy;

    camOri.x = camOri.x + deplacement.x;
    vec3 camVec = oriToVec(camOri);

    vec2 oriAxeRot = vec2(camOri.x - pi/2.0, camOri.y);
    vec3 axeRot = oriToVec(oriAxeRot);

    camVec = rot(camVec, axeRot, deplacement.y);

    if (!isRayTouching(camVec, camCoo, cubeCoo)) {
        outColor = vec4(0.0, 0.0, 0.0, 1.0);
    }
}
