#version 330 core
layout (location = 0) in vec3 aPos;
layout (location = 1) in vec3 aNormal;
layout (location = 2) in vec2 aTexCoords;

out VS_OUT {
    vec3 FragPos;
    vec3 Normal;
    vec2 TexCoords;
    vec4 ViewPos;
} vs_out;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;
uniform float time;
uniform float scanHeight;      // 扫描高度
uniform float vertexOffset;    // 顶点偏移量

void main() {
    // 计算顶点动画
    vec3 pos = aPos;
    float scanEffect = 1.0 - abs(scanHeight - pos.y) * 2.0;
    pos += aNormal * vertexOffset * max(0.0, scanEffect);
    
    vs_out.FragPos = vec3(model * vec4(pos, 1.0));
    vs_out.Normal = mat3(transpose(inverse(model))) * aNormal;
    vs_out.TexCoords = aTexCoords;
    
    vec4 viewPos = view * vec4(vs_out.FragPos, 1.0);
    vs_out.ViewPos = viewPos;
    
    gl_Position = projection * viewPos;
} 