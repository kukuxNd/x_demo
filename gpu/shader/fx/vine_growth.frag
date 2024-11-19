#version 330 core
out vec4 FragColor;

in vec3 FragPos;
in vec3 Normal;
in vec2 TexCoords;
in float GrowthWeight;

// 纹理
uniform sampler2D diffuseTexture;    // 主纹理
uniform sampler2D growthTexture;     // 生长纹理
uniform sampler2D noiseTexture;      // 噪声纹理

// 材质参数
uniform vec3 baseColor;              // 基础颜色
uniform vec3 growthColor;            // 生长时的颜色
uniform float shininess;             // 光泽度
uniform float growthGlow;            // 生长发光强度

// 光照参数
uniform vec3 lightPos;
uniform vec3 viewPos;
uniform vec3 lightColor;

// 时间
uniform float time;

void main() {
    // 基础纹理颜色
    vec4 texColor = texture(diffuseTexture, TexCoords);
    
    // 生长纹理
    vec4 growthTex = texture(growthTexture, TexCoords);
    
    // 噪声纹理
    vec2 noiseUV = TexCoords + vec2(time * 0.1);
    float noise = texture(noiseTexture, noiseUV).r;
    
    // 基础光照计算
    vec3 norm = normalize(Normal);
    vec3 lightDir = normalize(lightPos - FragPos);
    vec3 viewDir = normalize(viewPos - FragPos);
    vec3 reflectDir = reflect(-lightDir, norm);
    
    // 环境光
    float ambientStrength = 0.2;
    vec3 ambient = ambientStrength * lightColor;
    
    // 漫反射
    float diff = max(dot(norm, lightDir), 0.0);
    vec3 diffuse = diff * lightColor;
    
    // 镜面反射
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
    vec3 specular = spec * lightColor;
    
    // 生长效果
    float growthEdge = smoothstep(GrowthWeight - 0.1, GrowthWeight, growthTex.r);
    vec3 glowColor = growthColor * growthGlow * growthEdge * (0.5 + noise * 0.5);
    
    // 颜色混合
    vec3 baseColorMix = mix(baseColor, growthColor, growthEdge);
    vec3 finalColor = (ambient + diffuse) * baseColorMix * texColor.rgb + specular;
    
    // 添加生长发光
    finalColor += glowColor * (1.0 - GrowthWeight) * 2.0;
    
    // 边缘发光
    float fresnel = pow(1.0 - max(dot(norm, viewDir), 0.0), 2.0);
    finalColor += growthColor * fresnel * growthEdge * growthGlow;
    
    // 透明度处理
    float alpha = texColor.a * smoothstep(0.0, 0.1, GrowthWeight);
    
    // 输出最终颜色
    FragColor = vec4(finalColor, alpha);
} 