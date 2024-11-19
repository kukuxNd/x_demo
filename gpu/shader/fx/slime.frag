#version 330 core
out vec4 FragColor;

in VS_OUT {
    vec3 FragPos;
    vec3 Normal;
    vec2 TexCoords;
    vec3 ViewPos;
} fs_in;

// 纹理
uniform sampler2D noiseTexture;       // 噪声纹理
uniform sampler2D normalMap;          // 法线贴图
uniform samplerCube envMap;           // 环境贴图

// 粘液参数
uniform vec3 slimeColor;              // 基础颜色
uniform vec3 subsurfaceColor;         // 次表面散射颜色
uniform float glossiness;             // 光泽度
uniform float transparency;           // 透明度
uniform float refractionStrength;     // 折射强度
uniform float wobbleSpeed;            // 流动速度
uniform float viscosity;              // 粘性
uniform float time;                   // 时间

// 光照参数
uniform vec3 lightPos;
uniform vec3 viewPos;

// 噪声函数
float noise(vec2 uv) {
    return texture(noiseTexture, uv).r;
}

// 扰动UV坐标
vec2 distortUV(vec2 uv) {
    float distortion = noise(uv * 0.5 + time * 0.1) * 2.0 - 1.0;
    return uv + distortion * 0.1;
}

void main() {
    // 获取扰动后的UV坐标
    vec2 distortedUV = distortUV(fs_in.TexCoords);
    
    // 法线计算
    vec3 normal = normalize(fs_in.Normal);
    vec3 normalMap = texture(normalMap, distortedUV).rgb * 2.0 - 1.0;
    normal = normalize(normal + normalMap * 0.5);
    
    // 视线方向
    vec3 viewDir = normalize(viewPos - fs_in.FragPos);
    
    // 粘液流动效果
    float flow = noise(fs_in.TexCoords + time * wobbleSpeed);
    float flowLayer2 = noise(fs_in.TexCoords * 2.0 - time * wobbleSpeed * 0.5);
    float combinedFlow = mix(flow, flowLayer2, 0.5);
    
    // 粘性效果
    float viscousEffect = pow(1.0 - abs(dot(normal, viewDir)), viscosity);
    
    // 次表面散射
    float sss = pow(max(dot(normal, -viewDir), 0.0), 2.0) * 0.5;
    vec3 subsurface = subsurfaceColor * sss;
    
    // 反射和折射
    vec3 reflectDir = reflect(-viewDir, normal);
    vec3 refractDir = refract(-viewDir, normal, 1.0/1.33);
    
    // 环境反射
    vec3 reflection = texture(envMap, reflectDir).rgb;
    vec3 refraction = texture(envMap, refractDir).rgb;
    
    // 菲涅尔效果
    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 5.0);
    
    // 粘液滴落效果
    float drip = smoothstep(0.4, 0.6, noise(vec2(fs_in.FragPos.x * 2.0, 
                                                 fs_in.FragPos.y - time * 0.5)));
    
    // 合并所有效果
    vec3 finalColor = slimeColor;
    finalColor += subsurface;
    finalColor = mix(finalColor, reflection, fresnel * glossiness);
    finalColor += refraction * refractionStrength;
    
    // 添加流动效果
    finalColor += slimeColor * combinedFlow * 0.2;
    
    // 添加粘性高光
    vec3 viscousHighlight = vec3(1.0) * pow(viscousEffect, 4.0) * glossiness;
    finalColor += viscousHighlight;
    
    // 滴落效果
    finalColor = mix(finalColor, slimeColor * 1.2, drip * 0.3);
    
    // 边缘发光
    float rimLight = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);
    finalColor += slimeColor * rimLight * 0.5;
    
    // 计算最终透明度
    float alpha = mix(transparency, 1.0, fresnel);
    alpha = mix(alpha, 1.0, viscousEffect * 0.5);
    
    FragColor = vec4(finalColor, alpha);
} 