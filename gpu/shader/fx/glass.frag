#version 330 core
out vec4 FragColor;

in VS_OUT {
    vec3 FragPos;
    vec3 Normal;
    vec2 TexCoords;
    vec4 FragPosLightSpace;
    mat3 TBN;
    vec3 ViewPos;
} fs_in;

// 纹理
uniform samplerCube envMap;           // 环境贴图
uniform sampler2D normalMap;          // 法线贴图
uniform sampler2D roughnessMap;       // 粗糙度贴图
uniform sampler2D thicknessMap;       // 厚度贴图

// 玻璃参数
uniform float ior;                    // 折射率
uniform float dispersion;             // 色散强度
uniform float roughness;              // 基础粗糙度
uniform float transparency;           // 透明度
uniform vec3 glassColor;             // 玻璃颜色
uniform float fresnelPower;          // 菲涅尔强度
uniform float aberrationStrength;     // 色差强度
uniform float distortionStrength;     // 扭曲强度

// 计算色散
vec3 calculateDispersion(vec3 refractDir, float strength) {
    vec3 color;
    color.r = texture(envMap, refractDir * (1.0 + strength)).r;
    color.g = texture(envMap, refractDir).g;
    color.b = texture(envMap, refractDir * (1.0 - strength)).b;
    return color;
}

// 菲涅尔方程
float fresnel(float cosTheta, float F0) {
    return F0 + (1.0 - F0) * pow(1.0 - cosTheta, fresnelPower);
}

void main() {
    // 获取材质属性
    float materialRoughness = texture(roughnessMap, fs_in.TexCoords).r * roughness;
    float thickness = texture(thicknessMap, fs_in.TexCoords).r;
    
    // 计算法线
    vec3 normal = normalize(fs_in.Normal);
    vec3 normalMap = normalize(texture(normalMap, fs_in.TexCoords).rgb * 2.0 - 1.0);
    normal = normalize(fs_in.TBN * normalMap);
    
    vec3 viewDir = normalize(fs_in.ViewPos - fs_in.FragPos);
    
    // 计算反射和折射方向
    vec3 reflectDir = reflect(-viewDir, normal);
    vec3 refractDir = refract(-viewDir, normal, 1.0/ior);
    
    // 添加基于厚度的扭曲
    refractDir += normal * thickness * distortionStrength;
    
    // 计算菲涅尔效果
    float cosTheta = max(dot(normal, viewDir), 0.0);
    float F = fresnel(cosTheta, 0.04);
    
    // 采样环境贴图
    vec3 reflectionColor = texture(envMap, reflectDir).rgb;
    
    // 计算色散效果
    vec3 refractionColor = calculateDispersion(refractDir, dispersion * aberrationStrength);
    
    // 基于粗糙度模糊反射和折射
    float mipLevel = materialRoughness * 8.0;
    reflectionColor = textureLod(envMap, reflectDir, mipLevel).rgb;
    
    // 合并反射和折射
    vec3 finalColor = mix(refractionColor, reflectionColor, F);
    
    // 应用玻璃颜色
    finalColor *= glassColor;
    
    // 添加厚度影响
    finalColor *= mix(1.0, 0.8, thickness);
    
    // 边缘发光效果
    float rimLight = pow(1.0 - cosTheta, 4.0);
    finalColor += glassColor * rimLight * 0.5;
    
    // 添加微小的表面细节
    float surfaceNoise = fract(sin(dot(fs_in.TexCoords, vec2(12.9898, 78.233))) * 43758.5453);
    finalColor += surfaceNoise * 0.02;
    
    // HDR色调映射
    finalColor = finalColor / (finalColor + vec3(1.0));
    
    // 输出最终颜色
    FragColor = vec4(finalColor, transparency);
} 