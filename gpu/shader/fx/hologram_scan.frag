#version 330 core
out vec4 FragColor;

in VS_OUT {
    vec3 FragPos;
    vec3 Normal;
    vec2 TexCoords;
    vec4 ViewPos;
} fs_in;

// 纹理
uniform sampler2D mainTexture;       // 主纹理
uniform sampler2D noiseTexture;      // 噪声纹理
uniform sampler2D scanlineTexture;   // 扫描线纹理
uniform sampler2D dataTexture;       // 数据纹理

// 全息参数
uniform vec3 hologramColor;          // 全息颜色
uniform float scanHeight;            // 扫描高度
uniform float scanSpeed;             // 扫描速度
uniform float glitchIntensity;       // 故障强度
uniform float scanlineIntensity;     // 扫描线强度
uniform float edgeIntensity;         // 边缘强度
uniform float transparency;          // 透明度
uniform float time;                  // 时间

// 扫描线效果
float scanline(vec2 uv) {
    return texture(scanlineTexture, uv * vec2(1.0, 10.0) + vec2(0.0, time * scanSpeed)).r;
}

// 故障效果
vec2 glitchOffset(vec2 uv) {
    float noise = texture(noiseTexture, uv * 0.5 + time * 0.1).r;
    return vec2(noise * 2.0 - 1.0) * glitchIntensity;
}

// 数据流效果
float dataFlow(vec2 uv) {
    return texture(dataTexture, uv + vec2(0.0, -time * 0.5)).r;
}

void main() {
    vec2 uv = fs_in.TexCoords;
    vec3 normal = normalize(fs_in.Normal);
    
    // 计算扫描效果
    float scanEffect = 1.0 - abs(scanHeight - fs_in.FragPos.y) * 2.0;
    scanEffect = max(0.0, scanEffect);
    
    // 添加故障偏移
    vec2 glitchUV = uv + glitchOffset(uv) * scanEffect;
    
    // 基础颜色
    vec4 texColor = texture(mainTexture, glitchUV);
    
    // 添加扫描线
    float scan = scanline(uv) * scanlineIntensity;
    
    // 数据流动画
    float data = dataFlow(uv);
    
    // 计算边缘发光
    float edge = pow(1.0 - abs(dot(normal, vec3(0.0, 0.0, 1.0))), edgeIntensity);
    
    // 全息干扰效果
    float interference = sin(uv.y * 100.0 + time * 10.0) * 0.02;
    
    // 合并所有效果
    vec3 finalColor = hologramColor;
    finalColor *= (1.0 + scan);
    finalColor *= (1.0 + data * 0.5);
    finalColor += edge * hologramColor;
    finalColor += interference * hologramColor;
    
    // 添加扫描高亮
    float scanHighlight = exp(-pow(scanHeight - fs_in.FragPos.y, 2.0) * 50.0);
    finalColor += hologramColor * scanHighlight * 2.0;
    
    // 计算闪烁效果
    float flicker = sin(time * 30.0) * 0.03 + 0.97;
    finalColor *= flicker;
    
    // 计算距离衰减
    float depth = length(fs_in.ViewPos.xyz);
    float depthFade = exp(-depth * 0.1);
    
    // 计算最终透明度
    float alpha = transparency;
    alpha *= (edge * 0.5 + 0.5);
    alpha *= depthFade;
    alpha *= (scan * 0.3 + 0.7);
    
    // 添加扫描线透明度变化
    alpha *= (1.0 + scanHighlight * 0.5);
    
    FragColor = vec4(finalColor, alpha);
    
    // 添加像素化效果
    float pixelSize = 50.0;
    vec2 pixelUV = floor(fs_in.TexCoords * pixelSize) / pixelSize;
    float pixelNoise = texture(noiseTexture, pixelUV + time * 0.1).r;
    FragColor.rgb += pixelNoise * 0.05;
} 