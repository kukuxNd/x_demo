#version 330 core
out vec4 FragColor;

in vec2 TexCoords;
in vec3 WorldPos;

// 纹理采样器
uniform sampler2D noiseTexture;    // 噪声纹理
uniform sampler2D colorRamp;       // 颜色渐变纹理
uniform float time;                // 时间变量

// 火焰参数
uniform float intensity;           // 火焰强度
uniform float speed;              // 火焰速度
uniform vec3 fireColor;           // 基础火焰颜色
uniform float distortionStrength; // 扭曲强度

// 火焰属性
const float FIRE_SCALE = 1.0;     // 火焰缩放
const int OCTAVES = 4;            // 噪声叠加次数

// 扭曲函数
vec2 distort(vec2 uv) {
    vec2 distortion = texture(noiseTexture, uv * 0.5 + time * 0.05).rg * 2.0 - 1.0;
    return uv + distortion * distortionStrength;
}

// FBM（分形布朗运动）噪声
float fbm(vec2 uv) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    
    for(int i = 0; i < OCTAVES; i++) {
        value += amplitude * texture(noiseTexture, uv * frequency + vec2(0.0, time * speed)).r;
        frequency *= 2.0;
        amplitude *= 0.5;
    }
    
    return value;
}

void main() {
    // 基础UV坐标
    vec2 uv = TexCoords * FIRE_SCALE;
    
    // 添加扭曲
    vec2 distortedUV = distort(uv);
    
    // 生成基础火焰形状
    float noise = fbm(distortedUV);
    
    // 垂直渐变
    float gradient = 1.0 - TexCoords.y;
    
    // 组合噪声和渐变
    float fireShape = noise * gradient;
    
    // 应用强度和阈值
    fireShape = smoothstep(0.1, 0.8, fireShape * intensity);
    
    // 获取颜色渐变
    vec3 color = texture(colorRamp, vec2(fireShape, 0.5)).rgb;
    
    // 添加基础火焰颜色
    color *= fireColor;
    
    // 添加发光效果
    float glow = exp(-fireShape * 3.0);
    color += fireColor * glow * 0.3;
    
    // 边缘淡化
    float alpha = fireShape;
    alpha *= smoothstep(0.0, 0.1, TexCoords.y);  // 底部淡入
    alpha *= smoothstep(1.0, 0.8, TexCoords.y);  // 顶部淡出
    
    // 添加闪烁效果
    float flicker = sin(time * 10.0) * 0.05 + 0.95;
    color *= flicker;
    
    // 输出最终颜色
    FragColor = vec4(color, alpha);
} 