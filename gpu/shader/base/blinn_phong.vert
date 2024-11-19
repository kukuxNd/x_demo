#version 330 core

// 顶点属性
layout (location = 0) in vec3 aPos;
layout (location = 1) in vec3 aNormal;
layout (location = 2) in vec2 aTexCoords;

// 输出到片段着色器
out vec3 FragPos;
out vec3 Normal;
out vec2 TexCoords;
out vec4 FragPosLightSpace;  // 用于阴影计算

// Uniforms
uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;
uniform mat4 lightSpaceMatrix;  // 光源空间变换矩阵

void main() {
    FragPos = vec3(model * vec4(aPos, 1.0));
    Normal = mat3(transpose(inverse(model))) * aNormal;  
    TexCoords = aTexCoords;
    
    // 计算光空间的片段位置（用于阴影）
    FragPosLightSpace = lightSpaceMatrix * vec4(FragPos, 1.0);
    
    // 最终位置
    gl_Position = projection * view * vec4(FragPos, 1.0);
} 