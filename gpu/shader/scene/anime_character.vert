#version 330 core
layout (location = 0) in vec3 aPos;
layout (location = 1) in vec3 aNormal;
layout (location = 2) in vec2 aTexCoords;
layout (location = 3) in vec4 aTangent;

out VS_OUT {
    vec3 FragPos;
    vec3 Normal;
    vec2 TexCoords;
    mat3 TBN;
    vec3 ViewPos;
    float ViewSpaceDepth;
} vs_out;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;
uniform vec3 viewPos;

void main() {
    vs_out.FragPos = vec3(model * vec4(aPos, 1.0));
    
    mat3 normalMatrix = transpose(inverse(mat3(model)));
    vs_out.Normal = normalize(normalMatrix * aNormal);
    
    vs_out.TexCoords = aTexCoords;
    
    // 计算TBN矩阵
    vec3 T = normalize(normalMatrix * vec3(aTangent));
    vec3 N = vs_out.Normal;
    vec3 B = normalize(cross(N, T) * aTangent.w);
    vs_out.TBN = mat3(T, B, N);
    
    vs_out.ViewPos = viewPos;
    
    // 计算观察空间深度
    vec4 viewPos = view * model * vec4(aPos, 1.0);
    vs_out.ViewSpaceDepth = -viewPos.z;
    
    gl_Position = projection * viewPos;
} 