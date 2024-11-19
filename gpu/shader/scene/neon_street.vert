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
    vec4 ClipPos;
} vs_out;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;
uniform mat4 lightSpaceMatrix;
uniform float time;
uniform float rainDistortion;

void main() {
    vs_out.FragPos = vec3(model * vec4(aPos, 1.0));
    vs_out.Normal = mat3(transpose(inverse(model))) * aNormal;
    vs_out.TexCoords = aTexCoords;
    
    // 计算TBN矩阵
    vec3 T = normalize(vec3(model * vec4(aTangent, 0.0)));
    vec3 N = vs_out.Normal;
    vec3 B = cross(N, T);
    vs_out.TBN = mat3(T, B, N);
    
    // 光空间变换（用于反射和阴影）
    vs_out.FragPosLightSpace = lightSpaceMatrix * vec4(vs_out.FragPos, 1.0);
    
    vec4 clipPos = projection * view * vec4(vs_out.FragPos, 1.0);
    vs_out.ClipPos = clipPos;
    
    gl_Position = clipPos;
} 