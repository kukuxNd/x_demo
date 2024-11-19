#version 330 core
out vec4 FragColor;

in VS_OUT {
    vec3 FragPos;
    vec3 Normal;
    vec2 TexCoords;
    vec3 ViewPos;
    float Height;
} fs_in;

// 纹理
uniform sampler2D noiseTexture;       // 噪声纹理
uniform sampler2D patternTexture;     // 图案纹理
uniform samplerCube envMap;           // 环境贴图

// 护盾参数
uniform vec3 shieldColor;             // 护盾基础颜色
uniform vec3 impactColor;             // 受击颜色
uniform vec3 impactPoint;             // 受击点
uniform float impactProgress;         // 受击动画进度
uniform float shieldStrength;         // 护盾强度
uniform float patternScale;           // 图案缩放
uniform float hexagonScale;           // 六边形缩放
uniform float time;                   // 时间
uniform float energyFlow;             // 能量流动速度
uniform float opacity;                // 基础不透明度

// 六边形图案
float hexagonPattern(vec2 p) {
    p *= hexagonScale;
    vec2 h = vec2(0.5, 0.866025404);
    vec2 a = mod(p, h*2.0) - h;
    vec2 b = mod(p + h, h*2.0) - h;
    return min(dot(a, a), dot(b, b));
}

// 能量流动
vec2 energyFlowUV(vec2 uv) {
    return uv + vec2(time * energyFlow);
}

void main() {
    vec3 normal = normalize(fs_in.Normal);
    vec3 viewDir = normalize(-fs_in.ViewPos);
    
    // 计算到受击点的距离
    float distToImpact = distance(fs_in.FragPos, impactPoint);
    
    // 受击波纹
    float impactWave = sin(distToImpact * 10.0 - impactProgress * 5.0) * 
                      exp(-distToImpact * 3.0) * 
                      exp(-impactProgress * 2.0);
    
    // 六边形图案
    float hex = hexagonPattern(fs_in.TexCoords);
    float hexPattern = smoothstep(0.01, 0.02, hex);
    
    // 能量流动纹理
    vec2 flowUV = energyFlowUV(fs_in.TexCoords);
    float energyNoise = texture(noiseTexture, flowUV * patternScale).r;
    float pattern = texture(patternTexture, flowUV).r;
    
    // 菲涅尔效果
    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 5.0);
    
    // 环境反射
    vec3 reflectDir = reflect(-viewDir, normal);
    vec3 envReflection = texture(envMap, reflectDir).rgb;
    
    // 计算最终颜色
    vec3 finalColor = shieldColor;
    
    // 添加六边形图案
    finalColor *= (hexPattern * 0.5 + 0.5);
    
    // 添加能量流动
    finalColor += shieldColor * energyNoise * 0.2;
    finalColor += shieldColor * pattern * 0.3;
    
    // 添加受击效果
    vec3 impactEffect = mix(shieldColor, impactColor, impactWave);
    finalColor = mix(finalColor, impactEffect, impactWave);
    
    // 添加环境反射
    finalColor += envReflection * fresnel * 0.5;
    
    // 边缘发光
    float edge = pow(1.0 - abs(dot(normal, viewDir)), 3.0);
    finalColor += shieldColor * edge * shieldStrength;
    
    // 高度渐变
    float heightGradient = pow(fs_in.Height, 2.0);
    finalColor *= (1.0 + heightGradient * 0.2);
    
    // 能量波动
    float energyPulse = sin(time * 2.0 + fs_in.Height * 10.0) * 0.1 + 0.9;
    finalColor *= energyPulse;
    
    // 计算透明度
    float alpha = opacity;
    alpha *= (hexPattern * 0.5 + 0.5);
    alpha *= (fresnel * 0.5 + 0.5);
    alpha *= (1.0 + impactWave);
    
    // 输出最终颜色
    FragColor = vec4(finalColor, alpha);
} 