#version 330 core
out vec4 FragColor;

in vec3 FragPos;
in vec3 Normal;
in vec2 TexCoords;
in vec3 ViewPos;

// 纹理
uniform sampler2D noiseTexture1;    // 主噪声纹理
uniform sampler2D noiseTexture2;    // 次噪声纹理
uniform sampler2D colorGradient;    // 颜色渐变纹理
uniform samplerCube envMap;         // 环境贴图

// 参数
uniform float time;
uniform vec3 baseColor;            // 基础颜色
uniform vec3 energyColor;          // 能量颜色
uniform float energyIntensity;     // 能量强度
uniform float flowSpeed;           // 流动速度
uniform float turbulence;          // 湍流强度
uniform float voronoiScale;        // Voronoi缩放
uniform float edgeGlow;            // 边缘发光强度

// Voronoi噪声函数
float voronoi(vec2 uv) {
    vec2 baseCell = floor(uv);
    vec2 frac = fract(uv);
    float minDist = 1.0;
    
    for(int x = -1; x <= 1; x++) {
        for(int y = -1; y <= 1; y++) {
            vec2 cell = baseCell + vec2(x, y);
            vec2 cellPosition = cell + texture(noiseTexture1, cell/32.0).xy;
            vec2 diff = cellPosition - uv;
            float dist = length(diff);
            minDist = min(minDist, dist);
        }
    }
    
    return minDist;
}

// FBM (Fractal Brownian Motion)
float fbm(vec2 uv) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    
    for(int i = 0; i < 5; i++) {
        value += amplitude * texture(noiseTexture2, uv * frequency).r;
        frequency *= 2.0;
        amplitude *= 0.5;
    }
    
    return value;
}

void main() {
    // 视线方向
    vec3 viewDir = normalize(-ViewPos);
    vec3 normal = normalize(Normal);
    
    // 基础UV动画
    vec2 flowUV = TexCoords + time * flowSpeed;
    
    // 生成复杂的噪声模式
    float noise1 = fbm(flowUV);
    float noise2 = fbm(flowUV * 2.0 + time * 0.5);
    
    // Voronoi图案
    float voronoi1 = voronoi(flowUV * voronoiScale);
    float voronoi2 = voronoi(flowUV * voronoiScale * 2.0 + time);
    
    // 组合噪声
    float combinedNoise = mix(noise1, noise2, 0.5) * 
                         mix(voronoi1, voronoi2, 0.5);
    
    // 湍流效果
    float turbulenceEffect = sin(combinedNoise * turbulence + time);
    
    // 能量流动效果
    float energyFlow = smoothstep(0.2, 0.8, combinedNoise + turbulenceEffect);
    
    // 边缘发光
    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);
    
    // 从渐变纹理获取颜色
    vec3 gradientColor = texture(colorGradient, vec2(energyFlow, 0.5)).rgb;
    
    // 环境反射
    vec3 reflectDir = reflect(-viewDir, normal);
    vec3 envReflection = texture(envMap, reflectDir).rgb;
    
    // 合并所有效果
    vec3 finalColor = mix(baseColor, energyColor, energyFlow);
    finalColor = mix(finalColor, gradientColor, 0.6);
    finalColor += envReflection * 0.2;
    
    // 添加能量脉冲
    float pulse = sin(time * 2.0 + combinedNoise * 4.0) * 0.5 + 0.5;
    finalColor += energyColor * pulse * energyIntensity;
    
    // 添加边缘发光
    finalColor += energyColor * fresnel * edgeGlow;
    
    // 能量波动
    float energyWave = sin(FragPos.y * 10.0 + time * 3.0) * 0.5 + 0.5;
    finalColor += energyColor * energyWave * 0.2;
    
    // HDR调整
    finalColor = finalColor / (finalColor + vec3(1.0));
    
    // 透明度
    float alpha = mix(0.6, 1.0, energyFlow + fresnel);
    
    FragColor = vec4(finalColor, alpha);
} 