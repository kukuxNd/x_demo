#version 330 core
layout (location = 0) in vec3 aPos;
layout (location = 1) in vec3 aNormal;
layout (location = 2) in vec2 aTexCoords;
layout (location = 3) in vec3 aTangent;

out VS_OUT {
    vec3 FragPos;
    vec3 Normal;
    vec2 TexCoords;
    vec4 FragPosLightSpace;
    mat3 TBN;
    float GlitchFactor;
} vs_out;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;
uniform mat4 lightSpaceMatrix;
uniform float time;
uniform float glitchAmount;
uniform vec3 glitchDirection;

// 故障位移函数
vec3 glitchOffset(vec3 pos) {
    float noise = sin(time * 10.0 + pos.y * 20.0) * 
                 cos(time * 8.0 + pos.x * 15.0);
    return pos + glitchDirection * noise * glitchAmount;
}

void main() {
    // 应用故障效果
    vec3 glitchedPos = glitchOffset(aPos);
    vs_out.FragPos = vec3(model * vec4(glitchedPos, 1.0));
    vs_out.Normal = mat3(transpose(inverse(model))) * aNormal;
    vs_out.TexCoords = aTexCoords;
    
    // 计算TBN矩阵
    vec3 T = normalize(vec3(model * vec4(aTangent, 0.0)));
    vec3 N = vs_out.Normal;
    vec3 B = cross(N, T);
    vs_out.TBN = mat3(T, B, N);
    
    // 光空间变换
    vs_out.FragPosLightSpace = lightSpaceMatrix * vec4(vs_out.FragPos, 1.0);
    
    // 计算故障因子
    vs_out.GlitchFactor = sin(time * 5.0 + aPos.y * 10.0) * 0.5 + 0.5;
    
    gl_Position = projection * view * vec4(vs_out.FragPos, 1.0);
} 