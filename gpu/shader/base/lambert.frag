#version 330 core

// 从顶点着色器接收的输入
in vec3 FragPos;
in vec3 Normal;
in vec2 TexCoords;

// 输出
out vec4 FragColor;

// 材质属性
struct Material {
    sampler2D diffuse;
    vec3 ambient;
};

// 光源属性
struct Light {
    vec3 position;
    vec3 direction;      // 用于定向光
    vec3 color;
    float intensity;
    
    // 衰减参数
    float constant;
    float linear;
    float quadratic;
    
    // 光源类型（0=定向光，1=点光源）
    int type;
};

// Uniforms
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
    
    // Lambert 漫反射计算
    float diff = max(dot(norm, lightDir), 0.0);
    
    // 获取材质颜色
    vec3 diffuseColor;
    if(useTexture) {
        diffuseColor = vec3(texture(material.diffuse, TexCoords));
    } else {
        diffuseColor = material.ambient;
    }
    
    // 计算衰减
    float attenuation = 1.0;
    if(light.type == 1) {
        float distance = length(light.position - FragPos);
        attenuation = 1.0 / (light.constant + light.linear * distance + 
                            light.quadratic * (distance * distance));
    }
    
    // 最终颜色计算
    vec3 result = light.color * light.intensity * diff * diffuseColor * attenuation;
    
    FragColor = vec4(result, 1.0);
} 