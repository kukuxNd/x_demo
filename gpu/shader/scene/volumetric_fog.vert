#version 330 core
layout (location = 0) in vec3 aPos;
layout (location = 1) in vec2 aTexCoords;

out VS_OUT {
    vec2 TexCoords;
    vec3 ViewRay;
    vec4 FragPosLightSpace;
} vs_out;

uniform mat4 projection;
uniform mat4 view;
uniform mat4 lightSpaceMatrix;

void main() {
    vs_out.TexCoords = aTexCoords;
    
    // 计算视线射线
    vec4 viewRay = inverse(projection * view) * vec4(aPos.xy, 1.0, 1.0);
    vs_out.ViewRay = viewRay.xyz / viewRay.w;
    
    // 计算光空间位置（用于阴影计算）
    vs_out.FragPosLightSpace = lightSpaceMatrix * vec4(vs_out.ViewRay, 1.0);
    
    gl_Position = vec4(aPos, 1.0);
} 