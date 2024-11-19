#version 330 core
out vec4 FragColor;

in VS_OUT {
    vec3 FragPos;
    vec2 TexCoords;
    vec3 TangentLightPos;
    vec3 TangentViewPos;
    vec3 TangentFragPos;
    float Height;
    mat3 TBN;
} fs_in;

// 地表纹理
uniform sampler2D diffuseMap1;    // 基础地表纹理（如泥土）
uniform sampler2D diffuseMap2;    // 第二层纹理（如草地）
uniform sampler2D diffuseMap3;    // 第三层纹理（如岩石）
uniform sampler2D diffuseMap4;    // 第四层纹理（如雪地）
uniform sampler2D normalMap;      // 法线贴图
uniform sampler2D heightMap;      // 高度图
uniform sampler2D detailMap;      // 细节贴图
uniform sampler2D splatMap;       // 混合贴图

// 材质参数
uniform float heightScale;        // 高度缩放
uniform float tiling;            // 纹理平铺
uniform float detailStrength;    // 细节强度
uniform vec2 terrainSize;        // 地形大小
uniform float heightBlending;     // 高度混合强度
uniform float slopeBlending;      // 坡度混合强度

// 光照参数
uniform vec3 lightColor;
uniform float ambientStrength;
uniform float specularStrength;
uniform float shininess;

// 视差遮蔽映射
vec2 parallaxMapping(vec2 texCoords, vec3 viewDir) {
    const float minLayers = 8.0;
    const float maxLayers = 32.0;
    float numLayers = mix(maxLayers, minLayers, abs(dot(vec3(0.0, 0.0, 1.0), viewDir)));
    
    float layerDepth = 1.0 / numLayers;
    float currentLayerDepth = 0.0;
    
    vec2 P = viewDir.xy * heightScale;
    vec2 deltaTexCoords = P / numLayers;
    
    vec2 currentTexCoords = texCoords;
    float currentDepthMapValue = texture(heightMap, currentTexCoords).r;
    
    while(currentLayerDepth < currentDepthMapValue) {
        currentTexCoords -= deltaTexCoords;
        currentDepthMapValue = texture(heightMap, currentTexCoords).r;
        currentLayerDepth += layerDepth;
    }
    
    vec2 prevTexCoords = currentTexCoords + deltaTexCoords;
    float afterDepth = currentDepthMapValue - currentLayerDepth;
    float beforeDepth = texture(heightMap, prevTexCoords).r - currentLayerDepth + layerDepth;
    float weight = afterDepth / (afterDepth - beforeDepth);
    
    return mix(currentTexCoords, prevTexCoords, weight);
}

// 计算混合权重
vec4 calculateBlendWeights(vec3 normal, float height) {
    // 基于高度的混合
    float h = (height + 1.0) * 0.5; // 归一化到[0,1]
    vec4 heightWeights;
    heightWeights.x = smoothstep(0.0, 0.3, h);          // 泥土
    heightWeights.y = smoothstep(0.2, 0.7, h);          // 草地
    heightWeights.z = smoothstep(0.6, 0.8, h);          // 岩石
    heightWeights.w = smoothstep(0.7, 1.0, h);          // 雪地
    
    // 基于坡度的混合
    float slope = 1.0 - normal.y; // 获取坡度
    vec4 slopeWeights;
    slopeWeights.x = smoothstep(0.5, 0.7, slope);       // 陡峭处更多岩石
    slopeWeights.y = smoothstep(0.0, 0.3, slope);       // 平缓处更多草地
    slopeWeights.z = smoothstep(0.3, 0.7, slope);       // 中等坡度混合
    slopeWeights.w = smoothstep(0.7, 1.0, slope);       // 最陡处
    
    // 混合贴图
    vec4 splatWeights = texture(splatMap, fs_in.TexCoords);
    
    // 合并所有权重
    vec4 finalWeights = heightWeights * heightBlending + 
                       slopeWeights * slopeBlending +
                       splatWeights * (1.0 - heightBlending - slopeBlending);
                       
    // 归一化权重
    return finalWeights / (finalWeights.x + finalWeights.y + finalWeights.z + finalWeights.w);
}

void main() {
    // 视差映射
    vec3 viewDir = normalize(fs_in.TangentViewPos - fs_in.TangentFragPos);
    vec2 texCoords = parallaxMapping(fs_in.TexCoords * tiling, viewDir);
    
    if(texCoords.x > 1.0 || texCoords.y > 1.0 || texCoords.x < 0.0 || texCoords.y < 0.0)
        discard;
    
    // 获取法线
    vec3 normal = texture(normalMap, texCoords).rgb;
    normal = normalize(normal * 2.0 - 1.0);
    
    // 计算混合权重
    vec4 blendWeights = calculateBlendWeights(normal, fs_in.Height);
    
    // 采样各层纹理
    vec3 color1 = texture(diffuseMap1, texCoords).rgb;
    vec3 color2 = texture(diffuseMap2, texCoords).rgb;
    vec3 color3 = texture(diffuseMap3, texCoords).rgb;
    vec3 color4 = texture(diffuseMap4, texCoords).rgb;
    
    // 混合纹理
    vec3 finalColor = color1 * blendWeights.x +
                     color2 * blendWeights.y +
                     color3 * blendWeights.z +
                     color4 * blendWeights.w;
    
    // 添加细节
    vec3 detail = texture(detailMap, texCoords * 10.0).rgb * 2.0 - 1.0;
    finalColor += detail * detailStrength;
    
    // 光照计算
    vec3 lightDir = normalize(fs_in.TangentLightPos - fs_in.TangentFragPos);
    
    // 环境光
    vec3 ambient = lightColor * ambientStrength;
    
    // 漫反射
    float diff = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = lightColor * diff;
    
    // 镜面反射
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
    vec3 specular = lightColor * spec * specularStrength;
    
    // 最终颜色
    vec3 result = (ambient + diffuse + specular) * finalColor;
    
    FragColor = vec4(result, 1.0);
} 