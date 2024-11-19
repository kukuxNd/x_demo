#version 330 core
out vec4 FragColor;
in vec2 TexCoords;

uniform sampler2D screenTexture;
uniform float time;           // 时间变量，用于动画
uniform float intensity;      // 故障效果强度 (0.0 - 1.0)

// 随机函数
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

// 噪声函数
float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

// RGB分离效果
vec4 rgbShift(sampler2D tex, vec2 uv, float amount) {
    vec4 color = vec4(0.0);
    
    // 红色通道偏移
    color.r = texture(tex, vec2(uv.x + amount, uv.y)).r;
    // 绿色通道
    color.g = texture(tex, uv).g;
    // 蓝色通道偏移
    color.b = texture(tex, vec2(uv.x - amount, uv.y)).b;
    color.a = 1.0;
    
    return color;
}

// 扫描线效果
float scanLine(vec2 uv) {
    return sin(uv.y * 400.0 + time * 10.0) * 0.5 + 0.5;
}

// 块状故障效果
vec2 blockGlitch(vec2 uv) {
    float block = floor(uv.y * 10.0) / 10.0;
    float noise = noise(vec2(block, floor(time * 20.0)));
    
    if (noise > 0.8) {
        uv.x += (noise - 0.8) * intensity * 0.1;
    }
    
    return uv;
}

// 波动失真效果
vec2 wavyDistortion(vec2 uv) {
    uv.x += sin(uv.y * 10.0 + time) * intensity * 0.02;
    uv.y += sin(uv.x * 10.0 + time) * intensity * 0.02;
    return uv;
}

void main() {
    vec2 uv = TexCoords;
    
    // 应用块状故障
    uv = blockGlitch(uv);
    
    // 应用波动失真
    uv = wavyDistortion(uv);
    
    // 检查UV坐标是否在有效范围内
    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
        FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        return;
    }
    
    // 基础颜色
    vec4 color = texture(screenTexture, uv);
    
    // 随机决定是否应用RGB分离
    float rgbRandom = random(vec2(time * 0.1));
    if (rgbRandom > 0.96) {
        color = rgbShift(screenTexture, uv, intensity * 0.1);
    }
    
    // 添加扫描线
    float scan = scanLine(uv);
    color.rgb *= mix(1.0, scan, intensity * 0.2);
    
    // 随机噪点
    float noise = random(uv + time);
    if (noise > 0.98) {
        color.rgb = vec3(1.0);
    }
    
    // 随机水平条纹
    float stripNoise = random(vec2(floor(uv.y * 20.0) + time));
    if (stripNoise > 0.95) {
        color.rgb = mix(color.rgb, vec3(stripNoise), intensity * 0.5);
    }
    
    // 随机颜色偏移
    if (random(vec2(time)) > 0.95) {
        color.rgb = mix(color.rgb, 
                       color.rgb * vec3(1.0 + random(vec2(uv.y, time)) * 0.5,
                                      1.0 + random(vec2(uv.x, time)) * 0.5,
                                      1.0 + random(vec2(time))) * 2.0,
                       intensity);
    }
    
    // 添加闪烁效果
    float flicker = random(vec2(time * 4.0));
    color.rgb *= mix(1.0, flicker, intensity * 0.1);
    
    FragColor = color;
} 