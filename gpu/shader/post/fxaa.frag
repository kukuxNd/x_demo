#version 330 core
out vec4 FragColor;
in vec2 TexCoords;

uniform sampler2D screenTexture;
uniform vec2 screenSize;

#define EDGE_THRESHOLD_MIN 0.0312
#define EDGE_THRESHOLD_MAX 0.125
#define QUALITY(q) ((q) < 5 ? 1.0 : ((q) > 5 ? 2.0 : 1.5))
#define ITERATIONS 12

void main() {
    vec2 texelSize = 1.0 / screenSize;
    vec2 screenTexCoords = TexCoords;
    
    // 获取周围的纹素
    vec3 rgbNW = textureOffset(screenTexture, screenTexCoords, ivec2(-1, -1)).rgb;
    vec3 rgbNE = textureOffset(screenTexture, screenTexCoords, ivec2(1, -1)).rgb;
    vec3 rgbSW = textureOffset(screenTexture, screenTexCoords, ivec2(-1, 1)).rgb;
    vec3 rgbSE = textureOffset(screenTexture, screenTexCoords, ivec2(1, 1)).rgb;
    vec3 rgbM = texture(screenTexture, screenTexCoords).rgb;
    
    // 计算亮度
    const vec3 luma = vec3(0.299, 0.587, 0.114);
    float lumaNW = dot(rgbNW, luma);
    float lumaNE = dot(rgbNE, luma);
    float lumaSW = dot(rgbSW, luma);
    float lumaSE = dot(rgbSE, luma);
    float lumaM = dot(rgbM, luma);
    
    // 计算对比度
    float lumaMin = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));
    float lumaMax = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));
    float lumaRange = lumaMax - lumaMin;
    
    // 如果对比度太低，直接返回
    if (lumaRange < max(EDGE_THRESHOLD_MIN, lumaMax * EDGE_THRESHOLD_MAX)) {
        FragColor = vec4(rgbM, 1.0);
        return;
    }
    
    // 执行FXAA
    vec2 dir;
    dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));
    dir.y = ((lumaNW + lumaSW) - (lumaNE + lumaSE));
    
    float dirReduce = max((lumaNW + lumaNE + lumaSW + lumaSE) * 0.25 * QUALITY(0), 1.0 / 128.0);
    float rcpDirMin = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);
    dir = min(vec2(ITERATIONS, ITERATIONS),
              max(vec2(-ITERATIONS, -ITERATIONS),
                  dir * rcpDirMin)) * texelSize;
    
    vec3 rgbA = 0.5 * (
        texture(screenTexture, screenTexCoords + dir * (1.0/3.0 - 0.5)).rgb +
        texture(screenTexture, screenTexCoords + dir * (2.0/3.0 - 0.5)).rgb);
    vec3 rgbB = rgbA * 0.5 + 0.25 * (
        texture(screenTexture, screenTexCoords + dir * -0.5).rgb +
        texture(screenTexture, screenTexCoords + dir * 0.5).rgb);
    
    float lumaB = dot(rgbB, luma);
    
    if (lumaB < lumaMin || lumaB > lumaMax) {
        FragColor = vec4(rgbA, 1.0);
    } else {
        FragColor = vec4(rgbB, 1.0);
    }
} 