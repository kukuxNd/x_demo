#version 330 core

in vec3 FragPos;
in vec3 Normal;
in vec2 TexCoords;

out vec4 FragColor;

struct Material {
    sampler2D diffuse;
    vec3 color;
};

struct Light {
    vec3 position;      // 点光源位置
    vec3 direction;     // 定向光方向
    vec3 color;
    float intensity;
    int type;          // 0 = 定向光, 1 = 点光源
};

uniform Material material;
uniform Light light;
uniform bool useTexture;

void main() {
    // 标准化法线
    vec3 norm = normalize(Normal);
    
    // 计算光照方向
    vec3 lightDir;
    if(light.type == 0) {
        lightDir = normalize(-light.direction);
    } else {
        lightDir = normalize(light.position - FragPos);
    }
    
    // 漫反射计算
    float diff = max(dot(norm, lightDir), 0.0);
    
    // 获取材质颜色
    vec3 diffuseColor;
    if(useTexture) {
        diffuseColor = vec3(texture(material.diffuse, TexCoords));
    } else {
        diffuseColor = material.color;
    }
    
    // 最终颜色
    vec3 result = light.color * light.intensity * diff * diffuseColor;
    
    FragColor = vec4(result, 1.0);
} 