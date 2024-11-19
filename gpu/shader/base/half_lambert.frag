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
    float roughness;     // 粗糙度参数，影响漫反射的扩散程度
};

// 光源属性
struct Light {
    vec3 position;
    vec3 direction;
    vec3 color;
    float intensity;
    
    float constant;
    float linear;
    float quadratic;
    
    int type;           // 0=定向光，1=点光源
};

// Uniforms
uniform Material material;
uniform Light light;
uniform bool useTexture;
uniform float halfLambertScale;    // 半Lambert缩放因子（默认为0.5）
uniform float halfLambertBias;     // 半Lambert偏移值（默认为0.5）

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
    
    // 半Lambert漫反射计算
    float NdotL = dot(norm, lightDir);
    float halfLambert = NdotL * halfLambertScale + halfLambertBias;
    float diff = halfLambert * halfLambert;
    
    // 应用粗糙度
    diff = pow(diff, material.roughness);
    
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
    
    // 应用简单的色调映射
    result = result / (result + vec3(1.0));
    
    // 伽马校正
    result = pow(result, vec3(1.0/2.2));
    
    FragColor = vec4(result, 1.0);
} 