#version 330 core
layout (location = 0) in vec3 aPos;
layout (location = 1) in vec3 aNormal;
layout (location = 2) in vec2 aTexCoords;

out VS_OUT {
    vec3 FragPos;
    vec3 Normal;
    vec2 TexCoords;
    vec4 ClipPos;
    vec3 ViewPos;
    vec3 WorldPos;
} vs_out;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;
uniform vec3 viewPos;
uniform float time;
uniform float waveHeight;     // 波浪高度
uniform float waveFrequency;  // 波浪频率

// 波浪函数
float wave(vec2 position) {
    float wave1 = sin(position.x * waveFrequency + time) * 
                 cos(position.z * waveFrequency * 0.5 + time * 0.8);
    float wave2 = sin(position.x * waveFrequency * 0.8 + time * 1.2) * 
                 cos(position.z * waveFrequency * 0.6 + time);
    return (wave1 + wave2) * waveHeight;
}

void main() {
    vec3 pos = aPos;
    
    // 如果是水面，应用波浪效果
    if(pos.y < 0.1) { // 假设水面在y=0附近
        pos.y += wave(pos.xz);
    }
    
    vs_out.WorldPos = pos;
    vs_out.FragPos = vec3(model * vec4(pos, 1.0));
    vs_out.Normal = mat3(transpose(inverse(model))) * aNormal;
    vs_out.TexCoords = aTexCoords;
    vs_out.ViewPos = viewPos;
    
    vec4 clipPos = projection * view * vec4(vs_out.FragPos, 1.0);
    vs_out.ClipPos = clipPos;
    
    gl_Position = clipPos;
} 