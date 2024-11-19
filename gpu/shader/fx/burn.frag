#version 330 core
out vec4 FragColor;

in vec3 FragPos;
in vec3 Normal;
in vec2 TexCoords;
in vec3 WorldPos;

// 纹理
uniform sampler2D diffuseTexture;     // 主纹理
uniform sampler2D noiseTexture;       // 噪声纹理
uniform sampler2D burnTexture;        // 燃烧纹理（渐变）

// 燃烧参数
uniform float burnAmount;             // 燃烧程度 (0.0 - 1.0)
uniform vec3 burnColor;               // 燃烧颜色
uniform vec3 glowColor;               // 发光颜色
uniform float burnSpeed;              // 燃烧速度
uniform float time;                   // 时间
uniform vec3 burnDirection;           // 燃烧方向

// 火焰参数
uniform float fireIntensity;          // 火焰强度
uniform float smokeIntensity;         // 烟雾强度
uniform float edgeWidth;              // 边缘宽度
uniform float noiseScale;             // 噪声缩放

// 扰动函数
vec2 distort(vec2 uv) {
    float t = time * burnSpeed;
    vec2 distortion = texture(noiseTexture, uv * noiseScale + t * 0.1).rg * 2.0 - 1.0;
    return uv + distortion * 0.02;
}

// 火焰噪声
float fireNoise(vec2 uv) {
    float noise = 0.0;
    float scale = 1.0;
    float amp = 1.0;
    
    for(int i = 0; i < 3; i++) {
        noise += texture(noiseTexture, uv * scale + vec2(time * burnSpeed * 0.5, 0.0)).r * amp;
        scale *= 2.0;
        amp *= 0.5;
    }
    
    return noise;
}

void main() {
    // 获取基础颜色
    vec4 baseColor = texture(diffuseTexture, TexCoords);
    
    // 计算燃烧高度（基于世界坐标和燃烧方向）
    float heightFactor = dot(WorldPos, normalize(burnDirection));
    
    // 获取噪声值
    vec2 distortedUV = distort(TexCoords);
    float noise = fireNoise(distortedUV);
    
    // 计算燃烧阈值
    float burnThreshold = burnAmount - heightFactor * 0.5;
    float burnEdge = smoothstep(burnThreshold, burnThreshold + edgeWidth, noise);
    
    // 如果完全燃烧就丢弃片段
    if(burnEdge <= 0.0 && burnAmount > 0.99) {
        discard;
    }
    
    // 计算火焰效果
    float fireEffect = smoothstep(burnThreshold - edgeWidth, burnThreshold, noise);
    vec3 fireColor = mix(glowColor, burnColor, fireEffect);
    
    // 计算烟雾效果
    float smokeEffect = smoothstep(burnThreshold, burnThreshold + edgeWidth * 2.0, noise);
    vec3 smokeColor = vec3(0.2, 0.2, 0.2) * smokeIntensity;
    
    // 发光效果
    float glowEffect = exp(-abs(burnEdge - 0.5) * 4.0);
    vec3 glowEmission = glowColor * glowEffect * fireIntensity;
    
    // 计算边缘发光
    vec3 viewDir = normalize(-FragPos);
    float fresnel = pow(1.0 - max(dot(normalize(Normal), viewDir), 0.0), 2.0);
    vec3 edgeGlow = burnColor * fresnel * fireEffect;
    
    // 合并所有效果
    vec3 finalColor = baseColor.rgb;
    
    // 添加火焰和烟雾
    if(fireEffect > 0.0) {
        finalColor = mix(finalColor, fireColor, fireEffect);
        finalColor += glowEmission;
        finalColor = mix(finalColor, smokeColor, smokeEffect * (1.0 - fireEffect));
    }
    
    // 添加边缘发光
    finalColor += edgeGlow;
    
    // 动态火焰纹理
    float fireTexture = texture(burnTexture, vec2(burnEdge, 0.5)).r;
    finalColor += burnColor * fireTexture * fireIntensity * (1.0 - burnEdge);
    
    // 输出最终颜色
    float alpha = baseColor.a * (1.0 - burnEdge * 0.5);
    FragColor = vec4(finalColor, alpha);
} 