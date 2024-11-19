#version 330 core
layout (location = 0) in vec3 aPos;
layout (location = 1) in vec3 aNormal;
layout (location = 2) in vec2 aTexCoords;

out VS_OUT {
    vec3 FragPos;
    vec3 Normal;
    vec2 TexCoords;
    vec4 ClipPos;
    float WaveHeight;
} vs_out;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;
uniform float time;

// 风格化波浪参数
uniform float waveHeight;      // 波浪高度
uniform float waveFrequency;   // 波浪频率
uniform float waveSpeed;       // 波浪速度
uniform vec2 flowDirection;    // 流动方向

// 风格化波浪函数
float stylizedWave(vec2 pos) {
    float wave1 = sin(pos.x * waveFrequency + time * waveSpeed) * 
                 cos(pos.y * waveFrequency * 0.8 + time * waveSpeed * 0.8);
                 
    float wave2 = sin(pos.x * waveFrequency * 0.5 + time * waveSpeed * 1.2) * 
                 cos(pos.y * waveFrequency * 0.6 + time * waveSpeed);
                 
    float wave = (wave1 + wave2) * 0.5;
    return wave * waveHeight;
}

void main() {
    // 计算波浪位移
    vec3 pos = aPos;
    float wave = stylizedWave(pos.xz + flowDirection * time);
    pos.y += wave;
    
    // 计算法线
    float dx = stylizedWave(pos.xz + vec2(0.01, 0) + flowDirection * time) - wave;
    float dz = stylizedWave(pos.xz + vec2(0, 0.01) + flowDirection * time) - wave;
    vec3 normal = normalize(vec3(-dx * 100.0, 1.0, -dz * 100.0));
    
    vs_out.FragPos = vec3(model * vec4(pos, 1.0));
    vs_out.Normal = mat3(transpose(inverse(model))) * normal;
    vs_out.TexCoords = aTexCoords;
    vs_out.WaveHeight = wave;
    
    vec4 clipPos = projection * view * vec4(vs_out.FragPos, 1.0);
    vs_out.ClipPos = clipPos;
    
    gl_Position = clipPos;
} 