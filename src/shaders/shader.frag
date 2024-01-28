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
const float renderDistance = 40;

vec2 camOri = ubo.camOri;

const int bonces = 4;

const int gridSize = 3;
int cubeCoo[gridSize][gridSize][gridSize];

vec3 rayDir;
vec3 rayPos;

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

int getVoxel(ivec3 rayPos) {
	if ((0 > rayPos.x) || (gridSize <= rayPos.x)) {
        return 0;
    }
    if ((0 > rayPos.y) || (gridSize <= rayPos.y)) {
        return 0;
    }
    if ((0 > rayPos.z) || (gridSize <= rayPos.z)) {
        return 0;
    }

    return cubeCoo[rayPos.x][rayPos.y][rayPos.z];
}

int voxelTransversal() {
    ivec3 mapPos = ivec3(floor(rayPos));

	vec3 deltaDist = abs(vec3(length(rayDir)) / rayDir);
	
	ivec3 rayStep = ivec3(sign(rayDir));

	vec3 sideDist = (rayStep * (vec3(mapPos) - rayPos) + (rayStep * 0.5) + 0.5) * deltaDist;

    bvec3 mask;
    
    int blockType;
  
    while (int i = 0; i < renderDistance; i++) {
        blockType = getVoxel(mapPos);
        if (blockType != 0) continue;
        mask = lessThanEqual(sideDist.xyz, min(sideDist.yzx, sideDist.zxy));

		sideDist += vec3(mask) * deltaDist;
		mapPos += ivec3(vec3(mask)) * rayStep;
    }

    vec3 rayNorm = ivec3(0, 0, 0);

    if (mask.x) {
        rayNorm.x=-rayStep.x;
	}
	if (mask.y) {
		rayNorm.y=-rayStep.y;
	}
	if (mask.z) {
		rayNorm.z=-rayStep.z;
	}
    rayPos = mapPos + rayNorm * 0.00001;

    rayDir = normalize(reflect(rayDir, rayNorm));

    return blockType;
}

uint random(uint seed){
    uint state = seed * 747796405u + 2891336453u;
    uint word = ((state >> ((state >> 28u) + 4u)) ^ state) * 277803737u;
    return (word >> 22u) ^ word;
}


vec4 colorToInvert(vec4 color) {
    color.x = color.x * color.w;
    color.y = color.y * color.w;
    color.z = color.z * color.w;
    
    color.w = 0.0;
    return color;
}

bool choosePixColor() {

    vec4 color = vec4(1.0, 1.0, 1.0, 1.0);

    for (int i = 0; i < bonces; i++) {
        int blockType = voxelTransversal();

        if (blockType == 0) {
            outColor = color;
            return true;
        }
        if (blockType == 1) {
            color = color + colorToInvert(vec4(0.208, 0.6, 0.165, -1.0));
        }
        if (blockType == 2) {
            color = color + colorToInvert(vec4(0.961, 0.914, 0.043, -1.0));
        }
        if (blockType == 3) {
            color = color + colorToInvert(vec4(0.812, 0.153, 0.733, -1.0));
        }
    }
    outColor = color;
    return true;
}

void main() {
    for (int i = 0; i < gridSize; i++) {
        for (int j = 0; j < gridSize; j++) {
            for (int k = 0; k < gridSize; k++) {
                cubeCoo[i][j][k] = 0;
            }
        }
    }

    cubeCoo[0][0][0] = 1;
    cubeCoo[0][2][0] = 2;
    /*cubeCoo[0][0][1] = 3;
    cubeCoo[0][0][2] = 3;
    cubeCoo[0][1][0] = 3;
    cubeCoo[0][1][1] = 3;
    cubeCoo[0][1][2] = 3;
    cubeCoo[0][2][0] = 3;
    cubeCoo[0][2][1] = 3;
    cubeCoo[0][2][2] = 3;
    
    cubeCoo[2][0][0] = 2;
    cubeCoo[2][0][1] = 3;
    cubeCoo[2][0][2] = 3;
    cubeCoo[2][1][0] = 3;
    cubeCoo[2][1][1] = 3;
    cubeCoo[2][1][2] = 3;
    cubeCoo[2][2][0] = 3;
    cubeCoo[2][2][1] = 3;
    cubeCoo[2][2][2] = 3;

    cubeCoo[1][0][0] = 2;
    cubeCoo[1][0][2] = 3;
    cubeCoo[1][1][2] = 3;
    cubeCoo[1][2][0] = 3;
    cubeCoo[1][2][2] = 3;*/

    float midSize = ubo.iResolution.x/2;
    vec2 deplacement = vec2((gl_FragCoord.y-midSize)/midSize, (gl_FragCoord.x-midSize)/midSize);
    //vec2 mouse = ubo.iMouse/ubo.iResolution.xy;

    camOri.x = camOri.x + deplacement.x;
    vec3 camVec = oriToVec(camOri);

    vec2 oriAxeRot = vec2(camOri.x - pi/2.0, camOri.y);
    vec3 axeRot = oriToVec(oriAxeRot);

    camVec = rot(camVec, axeRot, deplacement.y);

    rayDir = camVec;
    rayPos = ubo.camCoo;

    if (!choosePixColor()) {
        outColor = vec4(0.0, 0.0, 0.0, 1.0);
    }
}
