#version 330 core

// 输入顶点属性
layout (location = 0) in vec3 aPos;      // 位置
layout (location = 1) in vec2 aTexCoord; // 纹理坐标
layout (location = 2) in vec3 aNormal;   // 法线

// 输出到片段着色器的数据
out vec2 TexCoord;
out vec3 Normal;
out vec3 FragPos;

// 统一变量（Uniforms）
uniform mat4 model;      // 模型矩阵
uniform mat4 view;       // 视图矩阵
uniform mat4 projection; // 投影矩阵

void main() {
    // 计算裁剪空间的顶点位置
    gl_Position = projection * view * model * vec4(aPos, 1.0);
    
    // 计算片段位置（用于光照计算）
    FragPos = vec3(model * vec4(aPos, 1.0));
    
    // 传递纹理坐标
    TexCoord = aTexCoord;
    
    // 计算法线（需要使用法线矩阵以处理非统一缩放）
    Normal = mat3(transpose(inverse(model))) * aNormal;
} 