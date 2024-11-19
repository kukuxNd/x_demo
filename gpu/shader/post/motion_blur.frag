#version 330 core
out vec4 FragColor;
in vec2 TexCoords;

uniform sampler2D screenTexture;      // 当前帧纹理
uniform sampler2D velocityTexture;    // 速度纹理
uniform float blurStrength;           // 模糊强度
uniform int numSamples = 8;           // 采样数量
uniform vec2 screenTexelSize;         // 屏幕像素大小 (1.0/width, 1.0/height)

vec2 getVelocity(vec2 uv) {
    // 从速度纹理中获取速度向量
    vec2 velocity = texture(velocityTexture, uv).rg;
    
    // 将速度值从 [-1,1] 范围映射到实际的像素偏移
    velocity *= blurStrength;
    
    return velocity;
}

void main() {
    vec2 velocity = getVelocity(TexCoords);
    
    // 如果速度太小，跳过模糊处理
    float speed = length(velocity);
    if (speed < screenTexelSize.x) {
        FragColor = texture(screenTexture, TexCoords);
        return;
    }
    
    // 计算采样步长
    vec2 delta = velocity / float(numSamples);
    
    // 累积颜色
    vec4 color = vec4(0.0);
    vec2 currentTexCoords = TexCoords;
    
    // 在速度方向上进行多次采样
    for (int i = 0; i < numSamples; i++) {
        // 使用双线性采样获取颜色
        color += texture(screenTexture, currentTexCoords);
        
        // 移动到下一个采样点
        currentTexCoords += delta;
        
        // 检查采样点是否超出纹理范围
        if (any(greaterThan(currentTexCoords, vec2(1.0))) || 
            any(lessThan(currentTexCoords, vec2(0.0)))) {
            break;
        }
    }
    
    // 计算平均值
    color /= float(numSamples);
    
    // 根据速度大小调整模糊强度
    float blurFactor = smoothstep(0.0, 1.0, speed / (screenTexelSize.x * 100.0));
    FragColor = mix(texture(screenTexture, TexCoords), color, blurFactor);
} 