#version 330 core

// 顶点属性输入
layout (location = 0) in vec3 aPos;
layout (location = 1) in vec3 aNormal;
layout (location = 2) in vec2 aTexCoords;

// 输出到片段着色器的数据
out vec3 FragPos;
out vec3 Normal;
out vec2 TexCoords;

// 变换矩阵
uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

void main() {
    // 计算片段位置（世界空间）
    FragPos = vec3(model * vec4(aPos, 1.0));
    
    // 计算法线（世界空间）- 使用法线矩阵
    Normal = mat3(transpose(inverse(model))) * aNormal;
    
    // 传递纹理坐标
    TexCoords = aTexCoords;
    
    // 计算最终位置（裁剪空间）
    gl_Position = projection * view * vec4(FragPos, 1.0);
} 