#version 330 core
layout (location = 0) in vec3 aPos;
layout (location = 1) in vec3 aNormal;
layout (location = 2) in vec2 aTexCoords;

out VS_OUT {
    vec3 FragPos;
    vec3 Normal;
    vec2 TexCoords;
    vec3 ViewPos;
} vs_out;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;
uniform float time;
uniform float wobbleAmount;    // 摆动幅度
uniform float wobbleSpeed;     // 摆动速度
uniform vec3 gravity;          // 重力方向

void main() {
    // 计算顶点动画
    vec3 pos = aPos;
    
    // 添加重力影响的下垂效果
    float gravityEffect = dot(normalize(pos), normalize(gravity));
    pos += gravity * gravityEffect * 0.1;
    
    // 添加波浪动画
    float wave = sin(time * wobbleSpeed + pos.y * 5.0) * wobbleAmount;
    pos.x += wave * (1.0 - abs(pos.y));  // 上部摆动更大
    pos.z += cos(time * wobbleSpeed + pos.x * 5.0) * wobbleAmount;
    
    // 计算输出
    vs_out.FragPos = vec3(model * vec4(pos, 1.0));
    vs_out.Normal = mat3(transpose(inverse(model))) * aNormal;
    vs_out.TexCoords = aTexCoords;
    
    gl_Position = projection * view * vec4(vs_out.FragPos, 1.0);
} 