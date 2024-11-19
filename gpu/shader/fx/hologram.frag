#version 330 core
out vec4 FragColor;

in VS_OUT {
    vec3 FragPos;
    vec3 Normal;
    vec2 TexCoords;
    float Height;
} fs_in;

// 纹理
uniform sampler2D mainTexture;        // 主纹理
uniform sampler2D noiseTexture;       // 噪声纹理
uniform sampler2D scanlineTexture;    // 扫描线纹理
uniform sampler2D hologramPattern;    // 全息图案

// 全息参数
uniform vec3 hologramColor;           // 全息颜色
uniform float hologramOpacity;        // 基础不透明度
uniform float glitchIntensity;        // 故障强度
uniform float scanlineIntensity;      // 扫描线强度
uniform float rimPower;               // 边缘光强度
uniform float flickerSpeed;           // 闪烁速度
uniform float time;                   // 时间
uniform float interlaceScale;         // 交错线条缩放
uniform float distortionAmount;       // 扭曲强度

// 噪声函数
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

// 扭曲UV
vec2 distortUV(vec2 uv) {
    float noise = texture(noiseTexture, uv + time * 0.1).r;
    return uv + vec2(noise * 2.0 - 1.0) * distortionAmount;
}

void main() {
    vec2 uv = fs_in.TexCoords;
    vec3 normal = normalize(fs_in.Normal);
    
    // 基础UV扭曲
    vec2 distortedUV = distortUV(uv);
    
    // 主纹理采样
    vec4 texColor = texture(mainTexture, distortedUV);
    
    // 扫描线效果
    float scanline = texture(scanlineTexture, vec2(uv.x, uv.y * interlaceScale + time)).r;
    
    // 全息图案
    float pattern = texture(hologramPattern, uv * 2.0 + time * 0.1).r;
    
    // 故障效果
    float glitch = 0.0;
    if(random(vec2(time * 10.0, 0.0)) > 0.95) {
        vec2 glitchUV = uv;
        glitchUV.y += random(vec2(time)) * 0.2;
        glitch = texture(noiseTexture, glitchUV).r * glitchIntensity;
    }
    
    // 边缘发光
    float rim = 1.0 - max(dot(normal, vec3(0.0, 0.0, 1.0)), 0.0);
    rim = pow(rim, rimPower);
    
    // 高度渐变
    float heightGradient = fs_in.Height;
    
    // 闪烁效果
    float flicker = sin(time * flickerSpeed) * 0.1 + 0.9;
    
    // 交错线条
    float interlace = mod(gl_FragCoord.y, 2.0) * 0.25;
    
    // 合并所有效果
    vec3 finalColor = hologramColor;
    finalColor *= (scanline * scanlineIntensity + 0.5);
    finalColor *= (1.0 + pattern * 0.5);
    finalColor += glitch * hologramColor;
    finalColor *= flicker;
    finalColor += rim * hologramColor;
    finalColor *= (1.0 + interlace);
    
    // 垂直扫描线
    float verticalScan = smoothstep(0.0, 1.0, sin(uv.y * 100.0 + time * 10.0) * 0.5 + 0.5);
    finalColor *= (verticalScan * 0.25 + 0.75);
    
    // 水平扫描线
    float horizontalScan = smoothstep(0.0, 1.0, sin(uv.x * 50.0 - time * 5.0) * 0.5 + 0.5);
    finalColor *= (horizontalScan * 0.25 + 0.75);
    
    // 随机噪点
    float noise = random(uv + time) * 0.1;
    finalColor += noise * hologramColor;
    
    // 计算透明度
    float alpha = hologramOpacity;
    alpha *= (scanline * 0.5 + 0.5);
    alpha *= (1.0 - heightGradient * 0.5);
    alpha *= flicker;
    
    // 添加高度消隐效果
    float heightDissolve = smoothstep(0.3, 0.5, heightGradient);
    alpha *= heightDissolve;
    
    // 输出最终颜色
    FragColor = vec4(finalColor, alpha);
} 