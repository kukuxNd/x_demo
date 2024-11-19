#version 330 core
layout (location = 0) in vec3 aPos;
layout (location = 1) in vec3 aNormal;
layout (location = 2) in vec2 aTexCoords;
layout (location = 3) in float aGrowthWeight;  // 生长权重

out vec3 FragPos;
out vec3 Normal;
out vec2 TexCoords;
out float GrowthWeight;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;
uniform float growthProgress;    // 生长进度 (0.0 - 1.0)
uniform float growthDirection;   // 生长方向 (-1.0 向下, 1.0 向上)
uniform vec3 growthOrigin;      // 生长起点
uniform float bendFactor;        // 弯曲因子
uniform float windStrength;      // 风力强度
uniform float time;             // 时间变量

// 计算弯曲位移
vec3 calculateBend(vec3 position, float weight) {
    float bend = sin(position.y * 0.5 + time * 2.0) * bendFactor * weight;
    return vec3(bend, 0.0, bend * 0.5);
}

// 计算风力效果
vec3 calculateWind(vec3 position, float weight) {
    float wind = sin(time * 3.0 + position.y * 0.5) * 
                 cos(time * 2.0 + position.x * 0.5) * 
                 windStrength * weight;
    return vec3(wind, 0.0, wind * 0.5);
}

void main() {
    // 计算生长权重影响
    float growthEffect = smoothstep(growthProgress - 0.2, growthProgress, aGrowthWeight);
    
    // 初始位置
    vec3 position = aPos;
    
    // 计算到生长起点的距离
    vec3 toOrigin = position - growthOrigin;
    float distanceToOrigin = length(toOrigin);
    
    // 应用生长效果
    position = mix(growthOrigin, position, growthEffect);
    
    // 添加弯曲效果
    vec3 bend = calculateBend(position, growthEffect);
    position += bend * (1.0 - aGrowthWeight); // 顶部弯曲更明显
    
    // 添加风力效果
    vec3 wind = calculateWind(position, growthEffect);
    position += wind * (1.0 - aGrowthWeight);
    
    // 计算最终位置
    FragPos = vec3(model * vec4(position, 1.0));
    
    // 调整法线
    vec3 adjustedNormal = aNormal;
    if (growthEffect > 0.0) {
        // 根据弯曲和风力调整法线
        vec3 tangent = normalize(bend + wind);
        adjustedNormal = normalize(aNormal + tangent * 0.5);
    }
    Normal = mat3(transpose(inverse(model))) * adjustedNormal;
    
    // 传递纹理坐标和生长权重
    TexCoords = aTexCoords;
    GrowthWeight = growthEffect;
    
    gl_Position = projection * view * vec4(FragPos, 1.0);
} 