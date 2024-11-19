#version 330 core
out vec4 FragColor;

in VS_OUT {
    vec3 FragPos;
    vec3 Normal;
    vec2 TexCoords;
    vec4 ClipPos;
    float WaveHeight;
} fs_in;

// 纹理
uniform sampler2D foamTexture;       // 泡沫纹理
uniform sampler2D noiseTexture;      // 噪声纹理
uniform sampler2D colorGradient;     // 颜色渐变纹理
uniform sampler2D patternTexture;    // 图案纹理

// 风格化参数
uniform vec3 shallowColor;           // 浅水颜色
uniform vec3 deepColor;              // 深水颜色
uniform float foamThreshold;         // 泡沫阈值
uniform float foamWidth;             // 泡沫宽度
uniform float patternScale;          // 图案缩放
uniform float colorBands;            // 色带数量
uniform float rimPower;              // 边缘光强度
uniform float time;                  // 时间

// 风格化函数
float stylizeBanding(float value, float bands) {
    return floor(value * bands) / bands;
}

vec2 rotateUV(vec2 uv, float rotation) {
    float mid = 0.5;
    return vec2(
        cos(rotation) * (uv.x - mid) + sin(rotation) * (uv.y - mid) + mid,
        cos(rotation) * (uv.y - mid) - sin(rotation) * (uv.x - mid) + mid
    );
}

void main() {
    vec3 viewDir = normalize(-fs_in.FragPos);
    vec3 normal = normalize(fs_in.Normal);
    
    // 基础UV动画
    vec2 flowingUV = fs_in.TexCoords + vec2(time * 0.1);
    vec2 rotatedUV = rotateUV(flowingUV, time * 0.2);
    
    // 噪声纹理
    float noise = texture(noiseTexture, flowingUV).r;
    float noise2 = texture(noiseTexture, rotatedUV * 1.5).r;
    
    // 风格化波浪图案
    vec2 patternUV = fs_in.TexCoords * patternScale;
    float pattern = texture(patternTexture, patternUV + vec2(time * 0.05)).r;
    pattern = stylizeBanding(pattern, colorBands);
    
    // 计算深度渐变
    float depth = fs_in.WaveHeight * 0.5 + 0.5;
    depth = stylizeBanding(depth, colorBands);
    
    // 边缘发光
    float rim = 1.0 - max(dot(normal, viewDir), 0.0);
    rim = pow(rim, rimPower);
    
    // 泡沫效果
    float foam = smoothstep(foamThreshold - foamWidth, foamThreshold + foamWidth, noise);
    foam *= texture(foamTexture, flowingUV * 2.0).r;
    
    // 颜色混合
    vec3 waterColor = mix(deepColor, shallowColor, depth);
    waterColor = mix(waterColor, vec3(1.0), foam);
    
    // 添加图案
    waterColor = mix(waterColor, shallowColor * 1.5, pattern * 0.3);
    
    // 添加边缘光
    waterColor += rim * shallowColor;
    
    // 添加动态高光
    float highlight = pow(max(dot(reflect(-viewDir, normal), vec3(0.0, 1.0, 0.0)), 0.0), 32.0);
    highlight = stylizeBanding(highlight, colorBands * 0.5);
    waterColor += vec3(highlight);
    
    // 最终颜色
    FragColor = vec4(waterColor, 0.9);
} 