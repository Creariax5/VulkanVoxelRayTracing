@echo off

call "C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\VC\Auxiliary\Build\vcvars64.bat"

set PROJPATH=D:/devProjects/c++/LastTryVoxEngine

SET includes=/Isrc /I%VULKAN_SDK%/Include /I%PROJPATH%/libs/include /I%PROJPATH%/src/include
SET links=/link /LIBPATH:%VULKAN_SDK%/Lib /LIBPATH:%PROJPATH%/libs/lib glfw3.lib vulkan-1.lib User32.lib Gdi32.lib Shell32.lib /NODEFAULTLIB:MSVCRTD
SET defines=/D DEBUG

echo "building shaders..."
call %PROJPATH%/src/shaders/compile.bat

echo "building c++..."
call cl /EHsc /Z7 /MD /std:c++17 /Fo"build/obj/main.obj" /Fe"build/voxEngine" %includes% %defines% src/main.cpp %links%

call cl /EHsc /Z7 /MD /std:c++17 /Fo"build/test/obj/test.obj" /Fe"build/test/test" %includes% %defines% src/test.cpp %links%
