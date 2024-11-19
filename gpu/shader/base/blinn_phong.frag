#version 330 core

// 从顶点着色器接收的输入
in vec3 FragPos;
in vec3 Normal;
in vec2 TexCoords;
in vec4 FragPosLightSpace;

// 输出
out vec4 FragColor;

// 材质结构体
struct Material {
    sampler2D diffuse;
    sampler2D specular;
    sampler2D normal;    // 法线贴图
    float shininess;
};

// 定向光源
struct DirLight {
    vec3 direction;
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};

// 点光源
struct PointLight {
    vec3 position;
    
    float constant;
    float linear;
    float quadratic;
    
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};

// Uniforms
uniform vec3 viewPos;
uniform Material material;
uniform DirLight dirLight;
uniform sampler2D shadowMap;  // 阴影贴图
uniform bool useShadows;      // 是否使用阴影
uniform bool useNormalMap;    // 是否使用法线贴图

#define NR_POINT_LIGHTS 4
uniform PointLight pointLights[NR_POINT_LIGHTS];

// 函数声明
vec3 CalcDirLight(DirLight light, vec3 normal, vec3 viewDir, vec3 fragPos);
vec3 CalcPointLight(PointLight light, vec3 normal, vec3 fragPos, vec3 viewDir);
float ShadowCalculation(vec4 fragPosLightSpace, vec3 normal, vec3 lightDir);
vec3 getNormalFromMap();

void main() {
    // 获取法线
    vec3 norm = useNormalMap ? getNormalFromMap() : normalize(Normal);
    vec3 viewDir = normalize(viewPos - FragPos);
    
    // 第一阶段：方向光
    vec3 result = CalcDirLight(dirLight, norm, viewDir, FragPos);
    
    // 第二阶段：点光源
    for(int i = 0; i < NR_POINT_LIGHTS; i++)
        result += CalcPointLight(pointLights[i], norm, FragPos, viewDir);
    
    // 伽马校正
    result = pow(result, vec3(1.0/2.2));
    
    FragColor = vec4(result, 1.0);
}

// Blinn-Phong 定向光照计算
vec3 CalcDirLight(DirLight light, vec3 normal, vec3 viewDir, vec3 fragPos) {
    vec3 lightDir = normalize(-light.direction);
    
    // 半程向量
    vec3 halfwayDir = normalize(lightDir + viewDir);
    
    // 漫反射
    float diff = max(dot(normal, lightDir), 0.0);
    
    // Blinn-Phong 镜面反射
    float spec = pow(max(dot(normal, halfwayDir), 0.0), material.shininess);
    
    // 计算阴影
    float shadow = useShadows ? ShadowCalculation(FragPosLightSpace, normal, lightDir) : 0.0;
    
    // 合并结果
    vec3 ambient = light.ambient * vec3(texture(material.diffuse, TexCoords));
    vec3 diffuse = light.diffuse * diff * vec3(texture(material.diffuse, TexCoords));
    vec3 specular = light.specular * spec * vec3(texture(material.specular, TexCoords));
    
    return ambient + (1.0 - shadow) * (diffuse + specular);
}

// Blinn-Phong 点光源计算
vec3 CalcPointLight(PointLight light, vec3 normal, vec3 fragPos, vec3 viewDir) {
    vec3 lightDir = normalize(light.position - fragPos);
    
    // 半程向量
    vec3 halfwayDir = normalize(lightDir + viewDir);
    
    // 漫反射
    float diff = max(dot(normal, lightDir), 0.0);
    
    // Blinn-Phong 镜面反射
    float spec = pow(max(dot(normal, halfwayDir), 0.0), material.shininess);
    
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

// 从法线贴图获取法线
vec3 getNormalFromMap() {
    vec3 tangentNormal = texture(material.normal, TexCoords).xyz * 2.0 - 1.0;

    vec3 Q1  = dFdx(FragPos);
    vec3 Q2  = dFdy(FragPos);
    vec2 st1 = dFdx(TexCoords);
    vec2 st2 = dFdy(TexCoords);

    vec3 N   = normalize(Normal);
    vec3 T   = normalize(Q1*st2.t - Q2*st1.t);
    vec3 B   = -normalize(cross(N, T));
    mat3 TBN = mat3(T, B, N);

    return normalize(TBN * tangentNormal);
}

// 阴影计算
float ShadowCalculation(vec4 fragPosLightSpace, vec3 normal, vec3 lightDir) {
    // 执行透视除法
    vec3 projCoords = fragPosLightSpace.xyz / fragPosLightSpace.w;
    
    // 变换到[0,1]范围
    projCoords = projCoords * 0.5 + 0.5;
    
    // 获取最近的深度值
    float closestDepth = texture(shadowMap, projCoords.xy).r;
    
    // 获取当前片段的深度
    float currentDepth = projCoords.z;
    
    // 检查是否在阴影中
    float bias = max(0.05 * (1.0 - dot(normal, lightDir)), 0.005);
    float shadow = currentDepth - bias > closestDepth ? 1.0 : 0.0;
    
    return shadow;
} 