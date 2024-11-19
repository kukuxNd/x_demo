#version 330 core
out vec4 FragColor;

in vec2 TexCoords;
in vec3 Normal;
in vec3 FragPos;

// 材质贴图
uniform sampler2D mainTexture;        // 主纹理
uniform sampler2D noiseTexture;       // 噪声纹理
uniform sampler2D edgeTexture;        // 边缘纹理（可选）

// 溶解参数
uniform float dissolveThreshold;      // 溶解阈值 (0.0 - 1.0)
uniform vec3 dissolveColor;           // 溶解边缘颜色
uniform float dissolveEdgeWidth;      // 边缘宽度
uniform bool useEdgeTexture;          // 是否使用边缘纹理

// 光照参数
uniform vec3 lightPos;
uniform vec3 viewPos;
uniform vec3 lightColor;

// 材质参数
uniform float ambient;
uniform float shininess;
uniform vec3 baseColor;

void main() {
    // 获取噪声值
    float noise = texture(noiseTexture, TexCoords).r;
    
    // 计算溶解因子
    float dissolveAmount = noise - dissolveThreshold;
    
    // 如果低于阈值，丢弃片段
    if(dissolveAmount < 0.0) {
        discard;
    }
    
    // 基础颜色
    vec4 texColor = texture(mainTexture, TexCoords);
    
    // 计算边缘
    float edge = smoothstep(0.0, dissolveEdgeWidth, dissolveAmount);
    
    // 基础光照计算
    vec3 norm = normalize(Normal);
    vec3 lightDir = normalize(lightPos - FragPos);
    vec3 viewDir = normalize(viewPos - FragPos);
    vec3 reflectDir = reflect(-lightDir, norm);
    
    // 环境光
    vec3 ambientLight = ambient * lightColor;
    
    // 漫反射
    float diff = max(dot(norm, lightDir), 0.0);
    vec3 diffuse = diff * lightColor;
    
    // 镜面反射
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
    vec3 specular = spec * lightColor;
    
    // 合并光照
    vec3 lighting = (ambientLight + diffuse + specular);
    
    // 最终颜色计算
    vec3 finalColor;
    if(useEdgeTexture) {
        // 使用边缘纹理
        vec4 edgeColor = texture(edgeTexture, vec2(edge, 0.5));
        finalColor = mix(texColor.rgb * lighting, edgeColor.rgb, (1.0 - edge) * edgeColor.a);
    } else {
        // 使用纯色边缘
        finalColor = mix(texColor.rgb * lighting, dissolveColor, (1.0 - edge));
    }
    
    // 添加发光边缘效果
    float glowFactor = 1.0 - smoothstep(0.0, dissolveEdgeWidth * 2.0, dissolveAmount);
    finalColor += dissolveColor * glowFactor * 2.0;
    
    // 输出最终颜色
    FragColor = vec4(finalColor, texColor.a);
} 