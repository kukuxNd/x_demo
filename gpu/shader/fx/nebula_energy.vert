#version 330 core
layout (location = 0) in vec3 aPos;
layout (location = 1) in vec3 aNormal;
layout (location = 2) in vec2 aTexCoords;

out vec3 FragPos;
out vec3 Normal;
out vec2 TexCoords;
out vec3 ViewPos;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;
uniform float time;
uniform float pulseSpeed;
uniform float pulseAmplitude;

void main() {
    // 添加呼吸效果的顶点动画
    float pulse = sin(time * pulseSpeed) * pulseAmplitude;
    vec3 pos = aPos + aNormal * pulse;
    
    FragPos = vec3(model * vec4(pos, 1.0));
    Normal = mat3(transpose(inverse(model))) * aNormal;
    TexCoords = aTexCoords;
    
    vec4 viewPosition = view * vec4(FragPos, 1.0);
    ViewPos = viewPosition.xyz;
    
    gl_Position = projection * viewPosition;
} 