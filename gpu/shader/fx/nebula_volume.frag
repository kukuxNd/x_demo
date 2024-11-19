#version 330 core
out vec4 FragColor;

in VS_OUT {
    vec3 FragPos;
    vec3 Normal;
    vec2 TexCoords;
    vec4 FragPosLightSpace;
    vec3 TangentViewPos;
    vec3 TangentFragPos;
} fs_in;

// 纹理采样器
uniform sampler3D volumeNoise;    // 3D噪声纹理
uniform sampler2D flowMap;        // 流动图
uniform sampler2D colorRamp;      // 颜色渐变
uniform samplerCube envMap;       // 环境贴图

// 参数
uniform vec3 nebulaColor;         // 星云基础颜色
uniform vec3 glowColor;           // 发光颜色
uniform float time;               // 时间
uniform float density;            // 密度
uniform float energyFlow;         // 能量流动速度
uniform float turbulence;         // 湍流强度
uniform vec3 viewPos;             // 相机位置

// 噪声函数
float fbm(vec3 p) {
    float sum = 0.0;
    float amp = 1.0;
    float freq = 1.0;
    // 多层噪声叠加
    for(int i = 0; i < 4; i++) {
        sum += texture(volumeNoise, p * freq).r * amp;
        freq *= 2.0;
        amp *= 0.5;
        p += vec3(time * 0.1);
    }
    return sum;
}

// 体积云函数
float volumetricClouds(vec3 p) {
    // 基础噪声
    float noise = fbm(p * 0.1);
    
    // 添加流动效果
    vec2 flow = texture(flowMap, fs_in.TexCoords + time * energyFlow).rg * 2.0 - 1.0;
    p.xy += flow * turbulence;
    
    // 第二层噪声
    float detail = fbm(p * 0.4 + time * 0.2);
    
    return mix(noise, detail, 0.5);
}

void main() {
    vec3 viewDir = normalize(viewPos - fs_in.FragPos);
    vec3 normal = normalize(fs_in.Normal);
    
    // 计算体积云
    vec3 p = fs_in.FragPos * 0.1;
    float cloud = volumetricClouds(p);
    
    // 边缘发光
    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);
    
    // 能量流动
    float energy = sin(cloud * 10.0 + time * 2.0) * 0.5 + 0.5;
    
    // 从渐变图获取颜色
    vec3 cloudColor = texture(colorRamp, vec2(cloud, 0.5)).rgb;
    
    // 环境反射
    vec3 reflectDir = reflect(-viewDir, normal);
    vec3 envColor = texture(envMap, reflectDir).rgb;
    
    // 合并颜色
    vec3 finalColor = mix(nebulaColor, cloudColor, cloud);
    finalColor += glowColor * energy * density;
    finalColor += envColor * fresnel * 0.3;
    
    // 添加体积光效果
    float volumetricLight = pow(cloud, 2.0) * density;
    finalColor += glowColor * volumetricLight;
    
    // 能量脉冲
    float pulse = sin(time * 3.0 + cloud * 5.0) * 0.5 + 0.5;
    finalColor += glowColor * pulse * 0.2;
    
    // HDR色调映射
    finalColor = finalColor / (finalColor + vec3(1.0));
    
    // 计算透明度
    float alpha = mix(0.0, 1.0, cloud * density + fresnel);
    
    FragColor = vec4(finalColor, alpha);
} 