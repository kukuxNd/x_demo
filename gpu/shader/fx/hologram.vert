#version 330 core
layout (location = 0) in vec3 aPos;
layout (location = 1) in vec3 aNormal;
layout (location = 2) in vec2 aTexCoords;

out VS_OUT {
    vec3 FragPos;
    vec3 Normal;
    vec2 TexCoords;
    float Height;
} vs_out;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;
uniform float time;
uniform float flickerSpeed;
uniform float vertexDisplacement;

void main() {
    // 计算顶点动画
    vec3 pos = aPos;
    
    // 添加波动效果
    float wave = sin(time * flickerSpeed + pos.y * 5.0) * vertexDisplacement;
    pos.x += wave;
    pos.z += wave;
    
    // 计算高度信息
    vs_out.Height = (pos.y + 1.0) * 0.5; // 归一化到[0,1]范围
    
    vs_out.FragPos = vec3(model * vec4(pos, 1.0));
    vs_out.Normal = mat3(transpose(inverse(model))) * aNormal;
    vs_out.TexCoords = aTexCoords;
    
    gl_Position = projection * view * vec4(vs_out.FragPos, 1.0);
} 