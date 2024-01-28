#include <iostream>
#include <glm/glm.hpp>

struct UniformBufferObject {
    alignas(4) glm::float32 iTime;
    alignas(8) glm::vec2 iResolution;
    alignas(8) glm::vec2 iMouse;
    alignas(16) glm::vec3 camCoo;
    alignas(8) glm::vec2 camOri;   
};

const float pi = 3.14159265359;
const float renderDistance = 80;

glm::vec2 camOri;

const int bonces = 10;

const int gridSize = 3;
int cubeCoo[gridSize][gridSize][gridSize];

glm::vec3 rayDir;
glm::vec3 rayPos;

glm::vec3 oriToVec(glm::vec2 ori) {
    glm::vec3 vec;

    vec.x = sin(ori.x) * sin(ori.y);
    vec.y = sin(ori.x) * cos(ori.y);
    vec.z = cos(ori.x);

    return vec;
}

glm::vec3 rot(glm::vec3 vec, glm::vec3 axeRot, float oriW) {
    return  vec*cos(oriW) + 
    glm::cross(vec, axeRot) * sin(oriW) + 
    axeRot * dot(vec, axeRot) * (1 - cos(oriW));
}

int getVoxel(glm::ivec3 rayPos) {
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
    glm::ivec3 mapPos = glm::ivec3(floor(rayPos));

	glm::vec3 deltaDist = abs(glm::vec3(length(rayDir)) / rayDir);
	
	glm::ivec3 rayStep = glm::ivec3(sign(rayDir));

	glm::vec3 signVec = glm::sign(rayDir);
    glm::vec3 sideDist = (signVec * (glm::vec3(mapPos) - rayPos) + (signVec * glm::vec3(0.5)) + glm::vec3(0.5)) * deltaDist;

    glm::bvec3 mask;
    
    int blockType;
  
    for (int i = 0; i < renderDistance; i++) {
        blockType = getVoxel(mapPos);
        if (blockType != 0) return blockType;
        glm::bvec3 mask = glm::lessThanEqual(sideDist, glm::min(glm::min(glm::vec3(sideDist.y, sideDist.z, sideDist.x), glm::vec3(sideDist.z, sideDist.x, sideDist.y)), glm::vec3(sideDist.x, sideDist.y, sideDist.z)));

		sideDist += glm::vec3(mask) * deltaDist;
		mapPos += glm::ivec3(glm::vec3(mask)) * rayStep;
    }

    glm::vec3 rayNorm = glm::ivec3(0, 0, 0);

    if (mask.x) {
        rayNorm.x=1;
        if (mapPos.x<0) {
            rayNorm.x=-1;
        }
	}
	if (mask.y) {
		rayNorm.y=1;
        if (mapPos.y<0) {
            rayNorm.y=-1;
        }
	}
	if (mask.z) {
		rayNorm.z=1;
        if (mapPos.z<0) {
            rayNorm.z=-1;
        }
	}
    rayPos.x = mapPos.x + rayNorm.x * 0.00001;
    rayPos.y = mapPos.y + rayNorm.y * 0.00001;
    rayPos.z = mapPos.z + rayNorm.z * 0.00001;

    rayDir = reflect(rayDir, rayNorm);

    return blockType;
}

glm::uint random(glm::uint seed){
    glm::uint state = seed * 747796405u + 2891336453u;
    glm::uint word = ((state >> ((state >> 28u) + 4u)) ^ state) * 277803737u;
    return (word >> 22u) ^ word;
}


glm::vec4 colorToInvert(glm::vec4 color) {
    color.x = color.x * color.w;
    color.y = color.y * color.w;
    color.z = color.z * color.w;
    
    color.w = 0.0;
    return color;
}

glm::vec4 choosePixColor() {

    glm::vec4 color = glm::vec4(0.02, 0.02, 0.02, 1.0);

    for (int i = 0; i < bonces; i++) {
        int blockType = voxelTransversal();

        if (blockType == 0) {
            return color;
        }
        if (blockType == 1) {
            color = color + colorToInvert(glm::vec4(1.0, 1.0, 1.0, 0.5));
        }
        if (blockType == 2) {
            color = color + colorToInvert(glm::vec4(0.0, 1.0, 0.0, -0.2));
        }
        if (blockType == 3) {
            color = color + colorToInvert(glm::vec4(0.0, 0.0, 1.0, -0.2));
        }
    }
    return color;
}

int main() {
    UniformBufferObject ubo{};

    ubo.iResolution = glm::vec2(800, 800);

    ubo.iMouse = glm::vec2(400, 400);

    ubo.camCoo = glm::vec3(5, 5, 5);
            
    camOri = glm::vec2(ubo.iMouse.y/200*pi/2, ubo.iMouse.x/200*pi/2);
    ubo.camOri = camOri;



    for (int i = 0; i < gridSize; i++) {
        for (int j = 0; j < gridSize; j++) {
            for (int k = 0; k < gridSize; k++) {
                cubeCoo[i][j][k] = 0;
            }
        }
    }

    cubeCoo[1][1][0] = 1;
    cubeCoo[0][0][0] = 2;
    cubeCoo[0][0][1] = 3;

    float midSize = ubo.iResolution.x/2;
    glm::vec2 deplacement = glm::vec2((650-midSize)/midSize, (650-midSize)/midSize);
    //vec2 mouse = ubo.iMouse/ubo.iResolution.xy;

    camOri.x = camOri.x + deplacement.x;
    glm::vec3 camVec = oriToVec(camOri);

    glm::vec2 oriAxeRot = glm::vec2(camOri.x - pi/2.0, camOri.y);
    glm::vec3 axeRot = oriToVec(oriAxeRot);

    camVec = rot(camVec, axeRot, deplacement.y);

    rayDir = camVec;
    rayPos = ubo.camCoo;

    glm::vec4 pColo = choosePixColor();
    std::cout << pColo.x << std::endl;
    std::cout << pColo.y << std::endl;
    std::cout << pColo.z << std::endl;

    return 0;
}
