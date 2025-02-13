# Vulkan Voxel Engine

A real-time voxel rendering engine built with Vulkan and GLFW. This project implements a basic voxel renderer with ray tracing capabilities and interactive camera controls.

![image](https://github.com/Creariax5/VulkanVoxelRayTracing/assets/63298524/391d6ede-2d01-4079-b32e-fd8a8152a992)


## Features

- Real-time voxel rendering using ray tracing
- Dynamic camera movement and rotation
- Multiple material support with different colors
- FPS counter
- WASD + Space/E movement controls
- Mouse-based camera rotation
- Configurable render distance and bounce count for reflections

## Prerequisites

To build and run this project, you'll need:

- Vulkan SDK
- GLFW3
- GLM (OpenGL Mathematics)
- A graphics card with Vulkan support
- C++ compiler with C++17 support
- CMake (3.10 or higher)

## Project Structure

```
.
├── shaders/
│   ├── frag.spv     # Fragment shader (compiled)
│   └── vert.spv     # Vertex shader (compiled)
├── MY/
│   └── msgSys.cpp   # Messaging system for debug output
└── main.cpp         # Main application code
```

## Building

1. Make sure you have all prerequisites installed
2. Create a build directory:
```bash
mkdir build
cd build
```
3. Configure with CMake:
```bash
cmake ..
```
4. Build the project:
```bash
make
```

## Controls

- `W` - Move forward
- `S` - Move backward
- `A` - Strafe left
- `D` - Strafe right
- `E` - Move down
- `Space` - Move up
- Mouse movement - Control camera direction

## Technical Details

### Rendering Pipeline

The engine uses a ray tracing approach implemented in the fragment shader. For each pixel:
1. Calculates ray direction based on camera orientation
2. Performs voxel traversal using a DDA-like algorithm
3. Handles multiple bounces for reflections
4. Combines material colors based on ray hits

### Memory Management

- Uses Vulkan's command pools for efficient command buffer allocation
- Implements double buffering with MAX_FRAMES_IN_FLIGHT = 2
- Utilizes uniform buffers for camera and time information
- Uses storage buffers for voxel data

### Shaders

The project includes two main shaders:
- Vertex shader: Handles basic vertex transformation
- Fragment shader: Implements the ray tracing algorithm and material rendering

## Performance Considerations

- Configurable render distance affects performance
- Bounce count can be adjusted for performance vs. quality
- Uses efficient voxel traversal algorithm
- Implements concurrent queue operations where possible

## Contributing

Contributions are welcome! Please feel free to submit pull requests with improvements or bug fixes.

## License

This project is open source and available under the MIT License.

## Known Issues

- Some graphics cards may not support all required Vulkan extensions
- Performance may vary significantly based on render distance and bounce count settings

## Future Improvements

- [ ] Implement dynamic voxel updates
- [ ] Add texture support
- [ ] Optimize ray tracing algorithm
- [ ] Add more complex materials
- [ ] Implement ambient occlusion
- [ ] Add shadow rendering
