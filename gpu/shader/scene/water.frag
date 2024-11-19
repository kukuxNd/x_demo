#version 330 core
out vec4 FragColor;

in VS_OUT {
    vec3 FragPos;
    vec3 Normal;
    vec2 TexCoords;
    vec4 ClipPos;
    vec4 ProjPos;
    mat3 TBN;
} fs_in;

// 纹理
uniform sampler2D reflectionTex;    // 反射纹理
uniform sampler2D refractionTex;    // 折射纹理
uniform sampler2D normalMap1;       // 法线贴图1
uniform sampler2D normalMap2;       // 法线贴图2
uniform sampler2D depthMap;         // 深度贴图
uniform sampler2D foamTex;          // 泡沫纹理
uniform sampler2D causticsTex;      // 焦散纹理

// 参数
uniform vec3 waterColor;            // 水体颜色
uniform vec3 deepColor;             // 深水颜色
uniform float time;                 // 时间
uniform vec3 lightDir;              // 光照方向
uniform vec3 viewPos;               // 视角位置
uniform float normalStrength;       // 法线强度
uniform float flowSpeed;            // 流动速度
uniform float refractionStrength;   // 折射强度
uniform float fresnelPower;         // 菲涅尔强度
uniform float waterDepth;           // 水深
uniform float foamDepth;            // 泡沫深度
uniform float causticsStrength;     // 焦散强度

// 扰动UV函数
vec2 distortUV(vec2 uv, vec2 offset, float strength) {
    vec2 normal1 = texture(normalMap1, uv + offset).rg * 2.0 - 1.0;
    vec2 normal2 = texture(normalMap2, uv - offset * 0.5).rg * 2.0 - 1.0;
    return (normal1 + normal2) * strength;
}

void main() {
    // 计算基础UV和视线方向
    vec2 screenUV = fs_in.ProjPos.xy * 0.5 + 0.5;
    vec3 viewDir = normalize(viewPos - fs_in.FragPos);
    
    // 计算流动UV
    vec2 flowOffset = vec2(time * flowSpeed);
    vec2 distortion = distortUV(fs_in.TexCoords, flowOffset, normalStrength);
    
    // 获取深度信息
    float sceneDepth = texture(depthMap, screenUV).r;
    float surfaceDepth = fs_in.ClipPos.z / fs_in.ClipPos.w;
    float depthDifference = sceneDepth - surfaceDepth;
    
    // 计算反射和折射UV
    vec2 reflectUV = screenUV + distortion;
    vec2 refractUV = screenUV - distortion * refractionStrength;
    
    // 采样反射和折射纹理
    vec3 reflection = texture(reflectionTex, reflectUV).rgb;
    vec3 refraction = texture(refractionTex, refractUV).rgb;
    
    // 计算法线
    vec3 normal1 = texture(normalMap1, fs_in.TexCoords + flowOffset).rgb * 2.0 - 1.0;
    vec3 normal2 = texture(normalMap2, fs_in.TexCoords - flowOffset * 0.5).rgb * 2.0 - 1.0;
    vec3 normal = normalize(mix(normal1, normal2, 0.5));
    normal = normalize(fs_in.TBN * normal);
    
    // 菲涅尔效果
    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), fresnelPower);
    
    // 水深效果
    float waterFactor = exp(-depthDifference * waterDepth);
    vec3 waterColorMix = mix(deepColor, waterColor, waterFactor);
    
    // 焦散效果
    vec2 causticsUV = fs_in.TexCoords * 5.0 + time * 0.05;
    float caustics = texture(causticsTex, causticsUV).r;
    caustics *= smoothstep(0.0, foamDepth, depthDifference);
    
    // 泡沫效果
    float foam = texture(foamTex, fs_in.TexCoords + distortion).r;
    foam *= (1.0 - smoothstep(0.0, foamDepth, depthDifference));
    
    // 合并所有效果
    vec3 finalColor = mix(refraction, reflection, fresnel);
    finalColor = mix(finalColor, waterColorMix, 1.0 - waterFactor);
    finalColor += caustics * causticsStrength * waterColor;
    finalColor += foam * vec3(1.0);
    
    // 添加高光
    float specular = pow(max(dot(reflect(-lightDir, normal), viewDir), 0.0), 32.0);
    finalColor += specular * vec3(1.0) * fresnel;
    
    FragColor = vec4(finalColor, 1.0);
} 