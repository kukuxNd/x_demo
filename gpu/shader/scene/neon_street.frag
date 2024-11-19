#version 330 core
out vec4 FragColor;

in VS_OUT {
    vec3 FragPos;
    vec3 Normal;
    vec2 TexCoords;
    vec4 FragPosLightSpace;
    mat3 TBN;
    vec4 ClipPos;
} fs_in;

// 纹理
uniform sampler2D diffuseMap;        // 基础纹理
uniform sampler2D normalMap;         // 法线贴图
uniform sampler2D emissionMap;       // 发光贴图
uniform sampler2D reflectionMap;     // 反射贴图
uniform sampler2D wetnessMask;       // 湿度遮罩
uniform sampler2D rainDrops;         // 雨滴纹理
uniform sampler2D noiseTexture;      // 噪声纹理

// 参数
uniform vec3 viewPos;
uniform float time;
uniform float wetness;              // 湿度
uniform float rainIntensity;        // 雨强度
uniform float neonIntensity;        // 霓虹强度
uniform float reflectionStrength;    // 反射强度
uniform vec3 neonColor1;            // 霓虹色1
uniform vec3 neonColor2;            // 霓虹色2
uniform float flickerSpeed;         // 闪烁速度
uniform float puddleDepth;          // 水坑深度

// 雨滴效果
vec2 rainEffect(vec2 uv) {
    vec2 rainUV = uv * 5.0 + time * 0.1;
    float rain = texture(rainDrops, rainUV).r;
    rain *= rainIntensity;
    return vec2(rain) * 0.02;
}

// 霓虹闪烁
float neonFlicker() {
    return sin(time * flickerSpeed) * 0.5 + 0.5;
}

void main() {
    // 获取基础纹理
    vec2 texCoords = fs_in.TexCoords;
    
    // 雨天效果
    vec2 rainOffset = rainEffect(texCoords);
    texCoords += rainOffset * wetness;
    
    // 基础颜色
    vec4 diffuseColor = texture(diffuseMap, texCoords);
    
    // 法线贴图
    vec3 normal = texture(normalMap, texCoords).rgb;
    normal = normalize(normal * 2.0 - 1.0);
    normal = normalize(fs_in.TBN * normal);
    
    // 视线方向
    vec3 viewDir = normalize(viewPos - fs_in.FragPos);
    
    // 霓虹发光效果
    vec3 emission = texture(emissionMap, texCoords).rgb;
    float flicker = neonFlicker();
    vec3 neonGlow = mix(neonColor1, neonColor2, sin(time) * 0.5 + 0.5);
    emission *= neonGlow * neonIntensity * flicker;
    
    // 反射效果
    float wetnessFactor = texture(wetnessMask, texCoords).r * wetness;
    vec3 reflection = texture(reflectionMap, texCoords + rainOffset).rgb;
    
    // 菲涅尔效果
    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 5.0);
    fresnel = mix(0.0, fresnel, wetnessFactor);
    
    // 水坑效果
    float puddle = smoothstep(1.0 - puddleDepth, 1.0, wetnessFactor);
    
    // 合并所有效果
    vec3 finalColor = diffuseColor.rgb;
    
    // 添加反射
    finalColor = mix(finalColor, reflection, fresnel * reflectionStrength * wetnessFactor);
    
    // 添加霓虹发光
    finalColor += emission;
    
    // 水坑反射
    finalColor = mix(finalColor, reflection, puddle);
    
    // 雨天调整
    finalColor *= (1.0 - wetness * 0.2); // 降低对比度
    
    // 添加环境光遮蔽
    float ao = 1.0 - (wetnessFactor * 0.2);
    finalColor *= ao;
    
    // HDR色调映射
    finalColor = finalColor / (finalColor + vec3(1.0));
    
    // 输出最终颜色
    FragColor = vec4(finalColor, 1.0);
} 