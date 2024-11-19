#version 330 core

// 从顶点着色器接收的输入
in vec2 TexCoord;
in vec3 Normal;
in vec3 FragPos;

// 输出颜色
out vec4 FragColor;

// 材质属性
struct Material {
    sampler2D diffuse;   // 漫反射贴图
    sampler2D specular;  // 镜面贴图
    float shininess;     // 光泽度
};

// 光源属性
struct Light {
    vec3 position;       // 光源位置
    
    vec3 ambient;        // 环境光
    vec3 diffuse;        // 漫反射光
    vec3 specular;       // 镜面光
    
    float constant;      // 衰减常数项
    float linear;        // 衰减一次项
    float quadratic;     // 衰减二次项
};

// Uniforms
uniform Material material;
uniform Light light;
uniform vec3 viewPos;    // 相机位置

void main() {
    // 环境光计算
    vec3 ambient = light.ambient * vec3(texture(material.diffuse, TexCoord));
    
    // 漫反射光计算
    vec3 norm = normalize(Normal);
    vec3 lightDir = normalize(light.position - FragPos);
    float diff = max(dot(norm, lightDir), 0.0);
    vec3 diffuse = light.diffuse * diff * vec3(texture(material.diffuse, TexCoord));
    
    // 镜面光计算
    vec3 viewDir = normalize(viewPos - FragPos);
    vec3 reflectDir = reflect(-lightDir, norm);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);
    vec3 specular = light.specular * spec * vec3(texture(material.specular, TexCoord));
    
    // 计算衰减
    float distance = length(light.position - FragPos);
    float attenuation = 1.0 / (light.constant + light.linear * distance + 
                              light.quadratic * (distance * distance));
    
    // 合并所有光照分量
    vec3 result = (ambient + diffuse + specular) * attenuation;
    
    FragColor = vec4(result, 1.0);
} 