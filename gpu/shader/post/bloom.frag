#version 330 core
out vec4 FragColor;
in vec2 TexCoords;

uniform sampler2D screenTexture;
uniform sampler2D bloomTexture;
uniform float exposure;
uniform float bloomStrength;

void main() {
    vec3 hdrColor = texture(screenTexture, TexCoords).rgb;
    vec3 bloomColor = texture(bloomTexture, TexCoords).rgb;
    
    // 添加泛光
    hdrColor += bloomColor * bloomStrength;
    
    // 色调映射
    vec3 result = vec3(1.0) - exp(-hdrColor * exposure);
    
    // 伽马校正
    result = pow(result, vec3(1.0 / 2.2));
    
    FragColor = vec4(result, 1.0);
} 