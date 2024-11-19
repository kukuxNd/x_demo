#version 330 core
out vec4 FragColor;

in VS_OUT {
    vec2 TexCoords;
    vec3 ViewRay;
    vec4 FragPosLightSpace;
} fs_in;

// 纹理
uniform sampler2D depthMap;        // 深度纹理
uniform sampler2D noiseTexture;    // 噪声纹理
uniform sampler2D shadowMap;       // 阴影贴图
uniform sampler3D volumeNoise;     // 3D噪声纹理

// 相机参数
uniform vec3 viewPos;
uniform vec3 lightDir;
uniform vec3 lightColor;

// 雾参数
uniform vec3 fogColor;             // 雾颜色
uniform float fogDensity;          // 雾密度
uniform float fogHeightFalloff;    // 高度衰减
uniform float fogBaseHeight;       // 基础高度
uniform float scatteringFactor;    // 散射因子
uniform float noiseScale;          // 噪声缩放
uniform float time;                // 时间
uniform float windSpeed;           // 风速

// 光线步进参数
const int STEPS = 64;
const float STEP_SIZE = 0.1;

// 相位函数 (Henyey-Greenstein)
float phaseFunction(float cosTheta, float g) {
    float g2 = g * g;
    return (1.0 - g2) / (4.0 * 3.14159 * pow(1.0 + g2 - 2.0 * g * cosTheta, 1.5));
}

// 噪声函数
float getNoise(vec3 pos) {
    vec3 noisePos = pos * noiseScale + vec3(time * windSpeed);
    return texture(volumeNoise, noisePos).r;
}

// 计算阴影
float getShadow(vec4 fragPosLightSpace) {
    vec3 projCoords = fragPosLightSpace.xyz / fragPosLightSpace.w;
    projCoords = projCoords * 0.5 + 0.5;
    float currentDepth = projCoords.z;
    float shadow = 0.0;
    float bias = 0.005;
    
    vec2 texelSize = 1.0 / textureSize(shadowMap, 0);
    for(int x = -1; x <= 1; ++x) {
        for(int y = -1; y <= 1; ++y) {
            float pcfDepth = texture(shadowMap, projCoords.xy + vec2(x, y) * texelSize).r;
            shadow += currentDepth - bias > pcfDepth ? 1.0 : 0.0;
        }
    }
    shadow /= 9.0;
    return shadow;
}

void main() {
    // 获取场景深度
    float depth = texture(depthMap, fs_in.TexCoords).r;
    vec3 worldPos = fs_in.ViewRay * depth;
    
    // 计算光线步进的起点和终点
    vec3 rayStart = viewPos;
    vec3 rayEnd = worldPos;
    vec3 rayDir = normalize(rayEnd - rayStart);
    float rayLength = length(rayEnd - rayStart);
    
    // 初始化累积值
    vec3 accumFog = vec3(0.0);
    float transmittance = 1.0;
    
    // 光线步进
    float stepSize = rayLength / float(STEPS);
    for(int i = 0; i < STEPS; i++) {
        vec3 currentPos = rayStart + rayDir * (float(i) * stepSize);
        
        // 计算高度雾
        float height = currentPos.y - fogBaseHeight;
        float heightFactor = exp(-height * fogHeightFalloff);
        
        // 添加噪声
        float noise = getNoise(currentPos);
        float density = fogDensity * heightFactor * noise;
        
        // 计算散射
        float cosTheta = dot(rayDir, -lightDir);
        float phase = phaseFunction(cosTheta, 0.3);
        
        // 计算阴影
        vec4 posLightSpace = lightSpaceMatrix * vec4(currentPos, 1.0);
        float shadow = getShadow(posLightSpace);
        
        // 计算光照贡献
        vec3 lightContrib = lightColor * phase * (1.0 - shadow);
        
        // 累积雾效果
        float stepTransmittance = exp(-density * stepSize);
        vec3 stepScattering = fogColor * density * stepSize;
        
        accumFog += transmittance * stepScattering * (lightContrib + 0.2); // 0.2为环境光
        transmittance *= stepTransmittance;
        
        // 优化：如果透明度已经很低，提前退出
        if(transmittance < 0.01)
            break;
    }
    
    // 合并最终颜色
    vec3 finalColor = accumFog;
    
    // 添加大气散射
    float atmosphericScatter = pow(max(dot(rayDir, -lightDir), 0.0), 8.0);
    finalColor += lightColor * atmosphericScatter * scatteringFactor;
    
    FragColor = vec4(finalColor, 1.0 - transmittance);
} 