#version 330 core
layout (location = 0) in vec3 aPos;
layout (location = 1) in vec3 aNormal;
layout (location = 2) in vec2 aTexCoords;
layout (location = 3) in vec3 aTangent;

out VS_OUT {
    vec3 FragPos;
    vec3 Normal;
    vec2 TexCoords;
    vec4 ClipPos;
    vec4 ProjPos;
    mat3 TBN;
} vs_out;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;
uniform float time;

// 波浪参数
uniform vec4 wave1; // (方向x, 方向z, 振幅, 频率)
uniform vec4 wave2;
uniform vec4 wave3;

// Gerstner波浪函数
vec3 GerstnerWave(vec4 wave, vec3 p) {
    float steepness = 0.5;
    float k = 2.0 * 3.14159 / wave.w;
    float c = sqrt(9.8 / k);
    vec2 d = normalize(wave.xy);
    float f = k * (dot(d, p.xz) - c * time);
    float a = wave.z;
    
    return vec3(
        d.x * (a * cos(f)),
        a * sin(f),
        d.y * (a * cos(f))
    );
}

void main() {
    // 计算波浪位移
    vec3 pos = aPos;
    vec3 tangent = vec3(1, 0, 0);
    vec3 bitangent = vec3(0, 0, 1);
    
    // 应用多个波浪
    vec3 offset1 = GerstnerWave(wave1, pos);
    vec3 offset2 = GerstnerWave(wave2, pos);
    vec3 offset3 = GerstnerWave(wave3, pos);
    
    pos += offset1 + offset2 + offset3;
    
    // 计算法线
    vec3 normal = normalize(cross(
        normalize(tangent + offset1 + offset2 + offset3),
        normalize(bitangent + offset1 + offset2 + offset3)
    ));
    
    // 计算TBN矩阵
    vec3 T = normalize(vec3(model * vec4(tangent, 0.0)));
    vec3 N = normalize(vec3(model * vec4(normal, 0.0)));
    T = normalize(T - dot(T, N) * N);
    vec3 B = cross(N, T);
    vs_out.TBN = mat3(T, B, N);
    
    // 输出到片段着色器
    vs_out.FragPos = vec3(model * vec4(pos, 1.0));
    vs_out.Normal = mat3(transpose(inverse(model))) * normal;
    vs_out.TexCoords = aTexCoords;
    
    vec4 clipPos = projection * view * vec4(vs_out.FragPos, 1.0);
    vs_out.ClipPos = clipPos;
    vs_out.ProjPos = clipPos / clipPos.w;
    
    gl_Position = clipPos;
} 