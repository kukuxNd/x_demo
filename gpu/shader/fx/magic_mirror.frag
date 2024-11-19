#version 330 core
out vec4 FragColor;

in vec3 FragPos;
in vec3 Normal;
in vec2 TexCoords;
in vec4 ClipPos;

// 纹理
uniform sampler2D mirrorTexture;      // 镜面反射纹理
uniform sampler2D normalMap;          // 法线贴图
uniform sampler2D noiseTexture;       // 噪声纹理
uniform samplerCube envMap;           // 环境贴图（可选）

// 镜面参数
uniform vec2 mirrorCenter;            // 镜面中心点
uniform float mirrorRadius;           // 镜面半径
uniform float borderWidth;            // 边框宽度
uniform vec3 borderColor;             // 边框颜色
uniform float distortionStrength;     // 扭曲强度
uniform float rippleStrength;         // 波纹强度
uniform float rippleSpeed;            // 波纹速度

// 相机参数
uniform vec3 viewPos;
uniform float time;
uniform bool useEnvMap;               // 是否使用环境贴图

// 扭曲函数
vec2 getDistortion(vec2 uv) {
    float t = time * rippleSpeed;
    vec2 noise = texture(noiseTexture, uv + t * 0.05).rg * 2.0 - 1.0;
    
    // 计算到镜面中心的距离
    float dist = length(uv - mirrorCenter);
    float ripple = sin(dist * 20.0 - t * 2.0) * rippleStrength;
    
    return noise * distortionStrength + vec2(ripple);
}

void main() {
    // 计算屏幕空间坐标
    vec2 screenPos = (ClipPos.xy / ClipPos.w) * 0.5 + 0.5;
    
    // 计算到镜面中心的距离
    float distToCenter = length(screenPos - mirrorCenter);
    
    // 判断是否在镜面范围内
    float mirrorMask = 1.0 - smoothstep(mirrorRadius - borderWidth, mirrorRadius, distToCenter);
    
    // 如果在镜面外，直接丢弃片段
    if (mirrorMask <= 0.0) {
        discard;
    }
    
    // 计算边框
    float borderMask = smoothstep(mirrorRadius - borderWidth, mirrorRadius - borderWidth * 0.5, distToCenter);
    
    // 获取法线信息
    vec3 normal = texture(normalMap, TexCoords).rgb * 2.0 - 1.0;
    
    // 计算扭曲效果
    vec2 distortion = getDistortion(screenPos);
    vec2 distortedUV = screenPos + distortion * mirrorMask;
    
    // 采样镜面反射
    vec4 reflectionColor = texture(mirrorTexture, distortedUV);
    
    // 计算菲涅尔效果
    vec3 viewDir = normalize(viewPos - FragPos);
    float fresnel = pow(1.0 - max(dot(normalize(Normal), viewDir), 0.0), 3.0);
    
    // 环境反射（可选）
    vec3 envReflection = vec3(0.0);
    if (useEnvMap) {
        vec3 reflectDir = reflect(-viewDir, normalize(Normal + normal));
        envReflection = texture(envMap, reflectDir).rgb;
    }
    
    // 合并颜色
    vec3 finalColor = mix(reflectionColor.rgb, envReflection, fresnel * 0.5);
    
    // 添加边框
    finalColor = mix(finalColor, borderColor, borderMask);
    
    // 添加发光效果
    float glowStrength = (1.0 - distToCenter / mirrorRadius) * 0.5;
    vec3 glow = borderColor * glowStrength;
    finalColor += glow;
    
    // 添加波纹效果
    float ripple = sin(distToCenter * 30.0 - time * rippleSpeed) * 0.5 + 0.5;
    finalColor += borderColor * ripple * borderMask * 0.2;
    
    // 输出最终颜色
    FragColor = vec4(finalColor, mirrorMask);
} 