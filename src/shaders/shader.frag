#version 450

layout(binding = 0) uniform UniformBufferObject {
    float iTime;
    vec2 iResolution;
    vec2 iMouse;

    vec3 camCoo;
    vec2 camOri;
} ubo;

layout(location = 0) in vec3 fragColor;
layout(location = 0) out vec4 outColor;

const float pi = 3.14159265359;
const float renderDistance = 800;

vec2 camOri = ubo.camOri;

const int gridSize = 3;
bool cubeCoo[gridSize][gridSize][gridSize];

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

bool getVoxel(ivec3 rayPos) {
	if ((0 > rayPos.x) || (gridSize <= rayPos.x)) {
        return false;
    }
    if ((0 > rayPos.y) || (gridSize <= rayPos.y)) {
        return false;
    }
    if ((0 > rayPos.z) || (gridSize <= rayPos.z)) {
        return false;
    }


    if (cubeCoo[rayPos.x][rayPos.y][rayPos.z] == true) {
        return true;
    }
    return false;
}

bool isRayTouching(vec3 camVec, vec3 camCoo, bool cubeCoo[gridSize][gridSize][gridSize]) {

    vec3 rayDir = camVec;
    vec3 rayPos = camCoo;

    ivec3 mapPos = ivec3(floor(rayPos));

	vec3 deltaDist = abs(vec3(length(rayDir)) / rayDir);
	
	ivec3 rayStep = ivec3(sign(rayDir));

	vec3 sideDist = (sign(rayDir) * (vec3(mapPos) - rayPos) + (sign(rayDir) * 0.5) + 0.5) * deltaDist;

    bvec3 mask;
    
    bool theVoid = false;
  
    for (int i = 0; i < renderDistance; i++) {
        if (getVoxel(mapPos)) continue;
        if (i==renderDistance-2) {
            theVoid=true;
        };
        mask = lessThanEqual(sideDist.xyz, min(sideDist.yzx, sideDist.zxy));

		sideDist += vec3(mask) * deltaDist;
		mapPos += ivec3(vec3(mask)) * rayStep;
    }

    if (theVoid) {
		return false;
	}
	if (mask.x) {
		outColor = vec4(1.0, 0.0, 0.0, 1.0);
        return true;
	}
	if (mask.y) {
		outColor = vec4(0.0, 1.0, 0.0, 1.0);
        return true;
	}
	if (mask.z) {
		outColor = vec4(0.0, 0.0, 1.0, 1.0);
        return true;
	}

    return false;
}

void main() {
    for (int i = 0; i < gridSize; i++) {
        for (int j = 0; j < gridSize; j++) {
            for (int k = 0; k < gridSize; k++) {
                cubeCoo[i][j][k] = false;
            }
        }
    }

    cubeCoo[1][1][0] = true;
    cubeCoo[0][0][0] = true;
    cubeCoo[1][2][2] = true;

    float midSize = ubo.iResolution.x/2;
    vec2 deplacement = vec2((gl_FragCoord.y-midSize)/midSize, (gl_FragCoord.x-midSize)/midSize);
    //vec2 mouse = ubo.iMouse/ubo.iResolution.xy;

    camOri.x = camOri.x + deplacement.x;
    vec3 camVec = oriToVec(camOri);

    vec2 oriAxeRot = vec2(camOri.x - pi/2.0, camOri.y);
    vec3 axeRot = oriToVec(oriAxeRot);

    camVec = rot(camVec, axeRot, deplacement.y);

    if (!isRayTouching(camVec, ubo.camCoo, cubeCoo)) {
        outColor = vec4(0.0, 0.0, 0.0, 1.0);
    }
}
