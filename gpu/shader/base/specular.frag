#version 330 core

in vec3 FragPos;
in vec3 Normal;
in vec2 TexCoords;

out vec4 FragColor;

struct Material {
    sampler2D specular;
    float shininess;
    vec3 color;
};

struct Light {
    vec3 position;
    vec3 direction;
    vec3 color;
    float intensity;
    int type;          // 0 = 定向光, 1 = 点光源
    
    float constant;    // 衰减参数
    float linear;
    float quadratic;
};

uniform Material material;
uniform Light light;
uniform vec3 viewPos;
uniform bool useTexture;

void main() {
    // 标准化法线
    vec3 norm = normalize(Normal);
    vec3 viewDir = normalize(viewPos - FragPos);
    
    // 计算光照方向
    vec3 lightDir;
    if(light.type == 0) {
        lightDir = normalize(-light.direction);
    } else {
        lightDir = normalize(light.position - FragPos);
    }
    
    // 反射向量
    vec3 reflectDir = reflect(-lightDir, norm);
    
    // 镜面反射计算
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);
    
    // 获取材质颜色
    vec3 specularColor;
    if(useTexture) {
        specularColor = vec3(texture(material.specular, TexCoords));
    } else {
        specularColor = material.color;
    }
    
    // 计算衰减
    float attenuation = 1.0;
    if(light.type == 1) {
        float distance = length(light.position - FragPos);
        attenuation = 1.0 / (light.constant + light.linear * distance + 
                            light.quadratic * (distance * distance));
    }
    
    // 最终颜色
    vec3 result = light.color * light.intensity * spec * specularColor * attenuation;
    
    // 色调映射
    result = result / (result + vec3(1.0));
    
    FragColor = vec4(result, 1.0);
} 