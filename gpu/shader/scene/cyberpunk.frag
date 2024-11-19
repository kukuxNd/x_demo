#version 330 core
out vec4 FragColor;

in VS_OUT {
    vec3 FragPos;
    vec3 Normal;
    vec2 TexCoords;
    vec4 FragPosLightSpace;
    mat3 TBN;
    float GlitchFactor;
} fs_in;

// 纹理
uniform sampler2D diffuseMap;        // 基础纹理
uniform sampler2D emissionMap;       // 发光贴图
uniform sampler2D normalMap;         // 法线贴图
uniform sampler2D noiseTexture;      // 噪声纹理
uniform sampler2D hologramPattern;   // 全息图案
uniform sampler2D glitchTexture;     // 故障纹理

// 参数
uniform vec3 viewPos;
uniform float time;
uniform vec3 neonColor1;            // 霓虹色1
uniform vec3 neonColor2;            // 霓虹色2
uniform float glitchIntensity;      // 故障强度
uniform float hologramStrength;     // 全息强度
uniform float emissionStrength;     // 发光强度
uniform float scanlineFreq;         // 扫描线频率
uniform float rgbShiftAmount;       // RGB偏移量

// RGB偏移效果
vec4 rgbShift(sampler2D tex, vec2 uv) {
    vec4 color;
    color.r = texture(tex, uv + vec2(rgbShiftAmount, 0.0)).r;
    color.g = texture(tex, uv).g;
    color.b = texture(tex, uv - vec2(rgbShiftAmount, 0.0)).b;
    color.a = texture(tex, uv).a;
    return color;
}

// 扫描线效果
float scanline(vec2 uv) {
    return sin(uv.y * scanlineFreq + time * 10.0) * 0.5 + 0.5;
}

// 故障效果
vec3 glitchEffect(vec2 uv) {
    float noise = texture(noiseTexture, uv + time * 0.1).r;
    vec2 glitchUV = uv;
    if(noise > 0.98) {
        glitchUV.x += (noise - 0.98) * glitchIntensity;
    }
    return texture(glitchTexture, glitchUV).rgb;
}

void main() {
    vec2 uv = fs_in.TexCoords;
    
    // 基础颜色（带RGB偏移）
    vec4 texColor = rgbShift(diffuseMap, uv);
    
    // 法线贴图
    vec3 normal = texture(normalMap, uv).rgb;
    normal = normalize(normal * 2.0 - 1.0);
    normal = normalize(fs_in.TBN * normal);
    
    // 视线方向
    vec3 viewDir = normalize(viewPos - fs_in.FragPos);
    
    // 全息图案
    float hologram = texture(hologramPattern, uv + vec2(0.0, time * 0.1)).r;
    hologram *= sin(uv.y * 50.0 + time * 2.0) * 0.5 + 0.5;
    
    // 发光效果
    vec3 emission = texture(emissionMap, uv).rgb;
    vec3 neonColor = mix(neonColor1, neonColor2, sin(time) * 0.5 + 0.5);
    emission *= neonColor * emissionStrength;
    
    // 故障效果
    vec3 glitch = glitchEffect(uv);
    
    // 扫描线
    float scan = scanline(uv);
    
    // 边缘发光
    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);
    
    // 合并所有效果
    vec3 finalColor = texColor.rgb;
    finalColor += emission;
    finalColor += hologram * hologramStrength * neonColor;
    finalColor = mix(finalColor, glitch, fs_in.GlitchFactor * glitchIntensity);
    finalColor *= scan * 0.5 + 0.5;
    finalColor += fresnel * neonColor * 0.5;
    
    // 添加闪烁效果
    float flicker = sin(time * 15.0) * 0.05 + 0.95;
    finalColor *= flicker;
    
    // 添加噪点
    float noise = texture(noiseTexture, uv * 2.0 + time).r * 0.1;
    finalColor += noise * neonColor;
    
    // HDR色调映射
    finalColor = finalColor / (finalColor + vec3(1.0));
    
    // 最终输出
    FragColor = vec4(finalColor, texColor.a);
} 