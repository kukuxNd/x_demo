#version 330 core
out vec4 FragColor;

in VS_OUT {
    vec3 FragPos;
    vec3 Normal;
    vec2 TexCoords;
    vec3 TangentLightPos;
    vec3 TangentViewPos;
    vec3 TangentFragPos;
    vec4 ShadowCoord;
} fs_in;

// 纹理
uniform sampler2D diffuseMap;         // 基础颜色贴图
uniform sampler2D normalMap;          // 法线贴图
uniform sampler2D rampMap;            // 色阶贴图
uniform sampler2D specularMap;        // 高光贴图
uniform sampler2D shadowMap;          // 阴影贴图
uniform sampler2D outlineMap;         // 描边贴图

// 材质参数
uniform vec3 baseColor;               // 基础颜色
uniform float specularStrength;       // 高光强度
uniform float rimLightStrength;       // 边缘光强度
uniform float outlineWidth;           // 描边宽度
uniform vec3 outlineColor;            // 描边颜色
uniform float shadowThreshold;        // 阴影阈值
uniform float toonSteps;              // 色阶数量

// 光照参数
uniform vec3 lightColor;
uniform vec3 lightPos;
uniform vec3 viewPos;

float calculateShadow(vec4 shadowCoord) {
    vec3 projCoords = shadowCoord.xyz / shadowCoord.w;
    projCoords = projCoords * 0.5 + 0.5;
    
    float currentDepth = projCoords.z;
    float shadow = 0.0;
    vec2 texelSize = 1.0 / textureSize(shadowMap, 0);
    
    for(int x = -1; x <= 1; ++x) {
        for(int y = -1; y <= 1; ++y) {
            float pcfDepth = texture(shadowMap, projCoords.xy + vec2(x, y) * texelSize).r;
            shadow += currentDepth > pcfDepth ? 1.0 : 0.0;
        }
    }
    shadow /= 9.0;
    
    return shadow;
}

void main() {
    // 获取纹理颜色
    vec4 texColor = texture(diffuseMap, fs_in.TexCoords);
    
    // 法线贴图
    vec3 normal = texture(normalMap, fs_in.TexCoords).rgb;
    normal = normalize(normal * 2.0 - 1.0);
    
    // 光照方向
    vec3 lightDir = normalize(fs_in.TangentLightPos - fs_in.TangentFragPos);
    vec3 viewDir = normalize(fs_in.TangentViewPos - fs_in.TangentFragPos);
    
    // 漫反射
    float diff = max(dot(normal, lightDir), 0.0);
    
    // 卡通阴影
    float toonDiff = floor(diff * toonSteps) / toonSteps;
    vec3 rampColor = texture(rampMap, vec2(toonDiff, 0.5)).rgb;
    
    // 高光
    vec3 halfwayDir = normalize(lightDir + viewDir);
    float spec = pow(max(dot(normal, halfwayDir), 0.0), 32.0);
    float toonSpec = step(0.5, spec);
    vec3 specular = texture(specularMap, fs_in.TexCoords).rgb * toonSpec * specularStrength;
    
    // 边缘光
    float rim = 1.0 - max(dot(viewDir, normal), 0.0);
    rim = smoothstep(0.5, 1.0, rim);
    vec3 rimLight = rim * rimLightStrength * lightColor;
    
    // 阴影计算
    float shadow = calculateShadow(fs_in.ShadowCoord);
    
    // 描边
    float outline = texture(outlineMap, fs_in.TexCoords).r;
    float outlineEffect = step(1.0 - outlineWidth, outline);
    
    // 合并所有光照
    vec3 lighting = rampColor * (1.0 - shadow * 0.5);
    vec3 finalColor = texColor.rgb * baseColor * lighting;
    finalColor += specular;
    finalColor += rimLight;
    
    // 应用描边
    finalColor = mix(finalColor, outlineColor, outlineEffect);
    
    // 输出最终颜色
    FragColor = vec4(finalColor, texColor.a);
} 