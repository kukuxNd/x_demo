#version 330 core

in vec2 TexCoords;
out vec4 FragColor;

struct Material {
    sampler2D diffuse;
    vec3 ambient;
};

uniform Material material;
uniform vec3 ambientLight;
uniform bool useTexture;

void main() {
    // 环境光计算
    vec3 ambient;
    if(useTexture) {
        ambient = ambientLight * vec3(texture(material.diffuse, TexCoords));
    } else {
        ambient = ambientLight * material.ambient;
    }
    
    FragColor = vec4(ambient, 1.0);
} 