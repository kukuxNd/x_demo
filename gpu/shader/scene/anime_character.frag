#version 330 core
out vec4 FragColor;

in VS_OUT {
    vec3 FragPos;
    vec3 Normal;
    vec2 TexCoords;
    mat3 TBN;
    vec3 ViewPos;
    float ViewSpaceDepth;
} fs_in;

// 纹理
uniform sampler2D diffuseMap;         // 基础颜色贴图
uniform sampler2D normalMap;          // 法线贴图
uniform sampler2D emissionMap;        // 自发光贴图
uniform sampler2D rampMap;            // 色阶贴图
uniform sampler2D specularMap;        // 高光贴图
uniform sampler2D aoMap;              // 环境光遮蔽贴图

// 材质参数
uniform vec3 baseColor;               // 基础颜色
uniform float outlineWidth;           // 描边宽度
uniform vec3 outlineColor;            // 描边颜色
uniform float rimLightStrength;       // 边缘光强度
uniform vec3 rimLightColor;           // 边缘光颜色
uniform float specularStrength;       // 高光强度
uniform float shadowSoftness;         // 阴影软度
uniform int toonSteps;               // 色阶数量
uniform float emissionStrength;       // 自发光强度

// 光照参数
uniform vec3 lightPos;
uniform vec3 lightColor;
uniform float ambientStrength;

// 风格化参数
uniform float saturation;             // 饱和度
uniform float contrast;               // 对比度
uniform vec3 shadowColor;             // 阴影颜色
uniform float shadowThreshold;        // 阴影阈值

// 色彩调整函数
vec3 adjustColor(vec3 color) {
    // 亮度
    float luminance = dot(color, vec3(0.299, 0.587, 0.114));
    
    // 饱和度调整
    vec3 saturated = mix(vec3(luminance), color, saturation);
    
    // 对比度调整
    vec3 contrasted = (saturated - 0.5) * contrast + 0.5;
    
    return contrasted;
}

// 卡通阴影函数
float toonDiffuse(float NdotL) {
    float stepped = floor(NdotL * float(toonSteps)) / float(toonSteps);
    return smoothstep(shadowThreshold - shadowSoftness, shadowThreshold + shadowSoftness, stepped);
}

void main() {
    // 获取基础颜色
    vec4 texColor = texture(diffuseMap, fs_in.TexCoords);
    vec3 color = texColor.rgb * baseColor;
    
    // 法线贴图
    vec3 normal = texture(normalMap, fs_in.TexCoords).rgb;
    normal = normalize(normal * 2.0 - 1.0);
    normal = normalize(fs_in.TBN * normal);
    
    // 光照方向
    vec3 lightDir = normalize(lightPos - fs_in.FragPos);
    vec3 viewDir = normalize(fs_in.ViewPos - fs_in.FragPos);
    
    // 基础光照计算
    float NdotL = max(dot(normal, lightDir), 0.0);
    float toonShading = toonDiffuse(NdotL);
    
    // 色阶渲染
    vec3 rampColor = texture(rampMap, vec2(toonShading, 0.5)).rgb;
    
    // 高光计算
    vec3 halfwayDir = normalize(lightDir + viewDir);
    float spec = pow(max(dot(normal, halfwayDir), 0.0), 32.0);
    float toonSpec = step(0.5, spec);
    vec3 specular = texture(specularMap, fs_in.TexCoords).rgb * toonSpec * specularStrength;
    
    // 边缘光
    float rim = 1.0 - max(dot(viewDir, normal), 0.0);
    rim = smoothstep(0.5, 1.0, rim);
    vec3 rimLight = rimLightColor * rim * rimLightStrength;
    
    // 环境光遮蔽
    float ao = texture(aoMap, fs_in.TexCoords).r;
    
    // 自发光
    vec3 emission = texture(emissionMap, fs_in.TexCoords).rgb * emissionStrength;
    
    // 合并光照
    vec3 ambient = lightColor * ambientStrength;
    vec3 diffuse = lightColor * rampColor;
    
    // 最终颜色计算
    vec3 finalColor = color * (ambient + diffuse) * ao;
    finalColor += specular + rimLight + emission;
    
    // 应用色彩调整
    finalColor = adjustColor(finalColor);
    
    // 描边检测
    float depth = fs_in.ViewSpaceDepth;
    float normalEdge = length(fwidth(normal)) / fwidth(depth);
    float depthEdge = length(fwidth(depth));
    float edge = step(0.8, max(normalEdge, depthEdge * 10.0));
    
    // 应用描边
    finalColor = mix(finalColor, outlineColor, edge * outlineWidth);
    
    FragColor = vec4(finalColor, texColor.a);
} 