#version 330 core
out vec4 FragColor;
in vec2 TexCoords;

uniform sampler2D screenTexture;  // 输入的屏幕纹理
uniform sampler2D lutTexture;     // LUT 贴图
uniform float intensity;          // LUT 效果强度 (0.0 - 1.0)

const float LUT_SIZE = 32.0;      // LUT 纹理的大小（通常是 32x32x32 或 64x64x64）
const float LUT_TILE = 32.0;      // LUT 纹理的每行/列的格子数

vec3 applyLUT(vec3 color) {
    // 将颜色值从 [0,1] 映射到 LUT 空间
    color = clamp(color, 0.0, 1.0) * (LUT_SIZE - 1.0);
    
    // 计算蓝色通道的层级
    float blueIndex = floor(color.b);
    vec2 tile = vec2(mod(blueIndex, LUT_TILE), floor(blueIndex / LUT_TILE));
    
    // 计算在 LUT 中的采样位置
    float tileSize = 1.0 / LUT_TILE;
    vec2 tileOffset = tile * tileSize;
    
    // 计算红绿通道的采样位置
    vec2 rgOffset = (color.rg + 0.5) * (tileSize / LUT_SIZE);
    
    // 采样当前蓝色层级
    vec3 lutColor1 = texture(lutTexture, tileOffset + rgOffset).rgb;
    
    // 如果不是最后一层，则采样下一层并进行插值
    if(blueIndex < LUT_SIZE - 1.0) {
        // 计算下一层的采样位置
        vec2 nextTile = vec2(mod(blueIndex + 1.0, LUT_TILE), 
                            floor((blueIndex + 1.0) / LUT_TILE));
        vec2 nextTileOffset = nextTile * tileSize;
        vec3 lutColor2 = texture(lutTexture, nextTileOffset + rgOffset).rgb;
        
        // 在两层之间进行线性插值
        float blueAlpha = fract(color.b);
        lutColor1 = mix(lutColor1, lutColor2, blueAlpha);
    }
    
    return lutColor1;
}

void main() {
    // 获取原始颜色
    vec3 originalColor = texture(screenTexture, TexCoords).rgb;
    
    // 应用 LUT
    vec3 lutColor = applyLUT(originalColor);
    
    // 根据强度混合原始颜色和 LUT 处理后的颜色
    vec3 finalColor = mix(originalColor, lutColor, intensity);
    
    // 输出最终颜色
    FragColor = vec4(finalColor, 1.0);
} 