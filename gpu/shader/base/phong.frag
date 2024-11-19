#version 330 core

// 从顶点着色器接收的输入
in vec3 FragPos;
in vec3 Normal;
in vec2 TexCoords;

// 输出颜色
out vec4 FragColor;

// 材质结构体
struct Material {
    sampler2D diffuse;   // 漫反射贴图
    sampler2D specular;  // 镜面贴图
    float shininess;     // 光泽度
};

// 定向光源结构体
struct DirLight {
    vec3 direction;      // 光照方向
    
    vec3 ambient;        // 环境光颜色
    vec3 diffuse;        // 漫反射颜色
    vec3 specular;       // 镜面反射颜色
};

// 点光源结构体
struct PointLight {
    vec3 position;       // 光源位置
    
    float constant;      // 衰减常数项
    float linear;        // 衰减一次项
    float quadratic;     // 衰减二次项
    
    vec3 ambient;        // 环境光颜色
    vec3 diffuse;        // 漫反射颜色
    vec3 specular;       // 镜面反射颜色
};

// Uniforms
uniform vec3 viewPos;    // 观察者位置
uniform Material material;
uniform DirLight dirLight;
#define NR_POINT_LIGHTS 4
uniform PointLight pointLights[NR_POINT_LIGHTS];

// 函数声明
vec3 CalcDirLight(DirLight light, vec3 normal, vec3 viewDir);
vec3 CalcPointLight(PointLight light, vec3 normal, vec3 fragPos, vec3 viewDir);

void main() {
    // 属性
    vec3 norm = normalize(Normal);
    vec3 viewDir = normalize(viewPos - FragPos);
    
    // 第一阶段：定向光照
    vec3 result = CalcDirLight(dirLight, norm, viewDir);
    
    // 第二阶段：点光源
    for(int i = 0; i < NR_POINT_LIGHTS; i++)
        result += CalcPointLight(pointLights[i], norm, FragPos, viewDir);
    
    FragColor = vec4(result, 1.0);
}

// 计算定向光照
vec3 CalcDirLight(DirLight light, vec3 normal, vec3 viewDir) {
    vec3 lightDir = normalize(-light.direction);
    
    // 漫反射
    float diff = max(dot(normal, lightDir), 0.0);
    
    // 镜面反射
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);
    
    // 合并结果
    vec3 ambient = light.ambient * vec3(texture(material.diffuse, TexCoords));
    vec3 diffuse = light.diffuse * diff * vec3(texture(material.diffuse, TexCoords));
    vec3 specular = light.specular * spec * vec3(texture(material.specular, TexCoords));
    
    return (ambient + diffuse + specular);
}

// 计算点光源
vec3 CalcPointLight(PointLight light, vec3 normal, vec3 fragPos, vec3 viewDir) {
    vec3 lightDir = normalize(light.position - fragPos);
    
    // 漫反射
    float diff = max(dot(normal, lightDir), 0.0);
    
    // 镜面反射
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);
    
    // 衰减
    float distance = length(light.position - fragPos);
    float attenuation = 1.0 / (light.constant + light.linear * distance + 
                              light.quadratic * (distance * distance));
    
    // 合并结果
    vec3 ambient = light.ambient * vec3(texture(material.diffuse, TexCoords));
    vec3 diffuse = light.diffuse * diff * vec3(texture(material.diffuse, TexCoords));
    vec3 specular = light.specular * spec * vec3(texture(material.specular, TexCoords));
    
    ambient *= attenuation;
    diffuse *= attenuation;
    specular *= attenuation;
    
    return (ambient + diffuse + specular);
} 