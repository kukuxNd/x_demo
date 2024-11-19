#version 330 core
out vec4 FragColor;

in VS_OUT {
    vec3 FragPos;
    vec3 Normal;
    vec2 TexCoords;
    vec3 PhysicsPos;
    float BoneWeight;
} fs_in;

// 纹理
uniform sampler2D diffuseMap;
uniform sampler2D normalMap;
uniform sampler2D physicsMap;     // 物理效果贴图

// 材质参数
uniform vec3 baseColor;
uniform float roughness;
uniform float metallic;
uniform float physicsInfluence;   // 物理影响强度

// 光照参数
uniform vec3 lightPos;
uniform vec3 viewPos;
uniform vec3 lightColor;

// 物理参数
uniform float windStrength;       // 风力强度
uniform vec3 windDirection;       // 风向
uniform float time;              // 时间

// 物理动画函数
vec3 calculatePhysicsAnimation(vec3 pos, float weight) {
    // 风力影响
    vec3 windEffect = windDirection * windStrength * 
                     sin(time + pos.x * 2.0 + pos.y * 3.0) * 
                     (1.0 - weight);
    
    // 添加一些随机扰动
    float noise = sin(time * 3.0 + pos.y * 5.0) * 0.1;
    
    return windEffect + vec3(noise);
}

void main() {
    // 基础纹理颜色
    vec4 texColor = texture(diffuseMap, fs_in.TexCoords);
    vec3 color = texColor.rgb * baseColor;
    
    // 法线贴图
    vec3 normal = texture(normalMap, fs_in.TexCoords).rgb;
    normal = normalize(normal * 2.0 - 1.0);
    
    // 物理效果贴图
    vec3 physicsEffect = texture(physicsMap, fs_in.TexCoords).rgb;
    
    // 计算物理动画
    vec3 physicsAnim = calculatePhysicsAnimation(fs_in.PhysicsPos, fs_in.BoneWeight);
    
    // 光照计算
    vec3 lightDir = normalize(lightPos - fs_in.FragPos);
    vec3 viewDir = normalize(viewPos - fs_in.FragPos);
    vec3 halfwayDir = normalize(lightDir + viewDir);
    
    // 漫反射
    float diff = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = lightColor * diff * color;
    
    // 镜面反射
    float spec = pow(max(dot(normal, halfwayDir), 0.0), 32.0);
    vec3 specular = lightColor * spec * (1.0 - roughness);
    
    // 物理效果影响
    vec3 physicsColor = mix(color, color * physicsEffect, physicsInfluence);
    
    // 合并所有效果
    vec3 finalColor = physicsColor * (diffuse + specular);
    
    // 添加物理动画效果
    finalColor += physicsAnim * physicsInfluence;
    
    // 金属度影响
    finalColor = mix(finalColor, finalColor * color, metallic);
    
    FragColor = vec4(finalColor, texColor.a);
} 