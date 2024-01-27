#include <iostream>
#include <glm/glm.hpp>

struct UniformBufferObject {
    alignas(4) glm::float32 iTime;
    alignas(8) glm::vec2 iResolution;
    alignas(8) glm::vec2 iMouse;
};

const float pi = 3.14159265359;
const float renderDistance = 100;
const float size = 1;

glm::vec3 camCoo = glm::vec3(5, 5, 5);
glm::vec2 camOri = glm::vec2(1.4*pi/2, 2.5*pi/2);

glm::vec3 cubeCoo = glm::vec3(0, 0, 0);

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
    axeRot * glm::dot(vec, axeRot) * (1 - cos(oriW));
}

bool verif(float cubeCoo, float touch) {
    if (cubeCoo <= touch && cubeCoo +1 >= touch) {
        return true;
    }

    return false;
}

bool isRayTouching(glm::vec3 camVec, glm::vec3 camCoo, glm::vec3 cubeCoo) {
    glm::vec3 end = camVec * renderDistance + camCoo;

    glm::vec3 ray = end-camCoo;

    glm::vec3 rayPos = camCoo;
  
    // calculate steps required for generating pixels 
    glm::vec3 steps = glm::sign(end - camCoo);

    glm::vec3 next = rayPos+steps;
  
    glm::vec3 tMax = next - camCoo/ray;

    glm::vec3 tDelta;
    tDelta.x = steps.x/ray.x;
    tDelta.y = steps.y/ray.y;
    tDelta.z = steps.z/ray.z;

    if (ray.x < 0) {
        rayPos.x -= 1;
    }
    if (ray.y < 0) {
        rayPos.y -= 1;
    }
    if (ray.z < 0) {
        rayPos.z -= 1;
    }

    std::cout << end.x << std::endl;
    std::cout << end.y << std::endl;
    std::cout << end.z << std::endl;

    end.x = glm::floor(end.x+0.5);
    end.y = glm::floor(end.y+0.5);
    end.z = glm::floor(end.z+0.5);

    std::cout << end.x << std::endl;
    std::cout << end.y << std::endl;
    std::cout << end.z << std::endl;
  
    while (end != rayPos) {
        if (tMax.x < tMax.y) {
            if (tMax.x < tMax.z) {
                rayPos.x += steps.x;
                tMax.x += tDelta.x;
            } else {
                rayPos.z += steps.z;
                tMax.z += tDelta.z;
            }
        } else {
            if (tMax.y < tMax.z) {
                rayPos.y += steps.y;
                tMax.y += tDelta.y;
            } else {
                rayPos.z += steps.z;
                tMax.z += tDelta.z;
            }
        }

        if (end.x == rayPos.x)
        {
            std::cout << rayPos.x << std::endl;
            std::cout << rayPos.y << std::endl;
            std::cout << rayPos.z << std::endl;
        }
        

        if (verif(cubeCoo.x, rayPos.x) && verif(cubeCoo.y, rayPos.y) && verif(cubeCoo.z, rayPos.z)) {
            return true;
        }
    }

    return false;
}

int main() {
    UniformBufferObject ubo{};

    ubo.iResolution = glm::vec2(800, 800);

    float midSize = ubo.iResolution.x/2;
    glm::vec2 deplacement = glm::vec2((400-midSize)/midSize, (440-midSize)/midSize);
    
    camOri.x = camOri.x + deplacement.x;
    glm::vec3 camVec = oriToVec(camOri);

    glm::vec2 oriAxeRot = glm::vec2(camOri.x - pi/2.0, camOri.y);
    glm::vec3 axeRot = oriToVec(oriAxeRot);

    camVec = rot(camVec, axeRot, deplacement.y);
    
    if (!isRayTouching(camVec, camCoo, cubeCoo)) {
        std::cout << "no cube" << std::endl;
    } else {
        std::cout << "cube !" << std::endl;
    }

    return 0;
}
