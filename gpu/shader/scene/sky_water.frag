#version 330 core
out vec4 FragColor;

in VS_OUT {
    vec3 FragPos;
    vec3 Normal;
    vec2 TexCoords;
    vec4 ClipPos;
    vec3 ViewPos;
    vec3 WorldPos;
} fs_in;

// 纹理
uniform samplerCube skybox;           // 天空盒纹理
uniform sampler2D waterNormal;        // 水面法线贴图
uniform sampler2D foamTexture;        // 泡沫纹理
uniform sampler2D reflectionTexture;  // 反射纹理
uniform sampler2D refractionTexture;  // 折射纹理
uniform sampler2D depthTexture;       // 深度纹理

// 参数
uniform float time;
uniform vec3 lightDir;
uniform vec3 lightColor;
uniform float waterDepth;        // 水深
uniform float waterTurbulence;   // 水面湍流
uniform float foamStrength;      // 泡沫强度
uniform vec3 waterColor;         // 水体颜色
uniform float reflectivity;      // 反射率
uniform float fresnelPower;      // 菲涅尔强度

// 扰动UV坐标
vec2 distortUV(vec2 uv, float strength) {
    vec2 distortion1 = texture(waterNormal, uv + time * 0.05).rg * 2.0 - 1.0;
    vec2 distortion2 = texture(waterNormal, uv * 1.2 - time * 0.05).rg * 2.0 - 1.0;
    return uv + (distortion1 + distortion2) * strength;
}

void main() {
    vec3 viewDir = normalize(fs_in.ViewPos - fs_in.FragPos);
    vec3 normal = normalize(fs_in.Normal);
    
    // 水面法线扰动
    if(fs_in.WorldPos.y < 0.1) { // 水面处理
        vec2 distortedUV = distortUV(fs_in.TexCoords, waterTurbulence);
        vec3 waterNorm = texture(waterNormal, distortedUV).rgb;
        waterNorm = normalize(waterNorm * 2.0 - 1.0);
        normal = normalize(normal + waterNorm);
        
        // 反射和折射
        vec2 screenCoord = (fs_in.ClipPos.xy / fs_in.ClipPos.w) * 0.5 + 0.5;
        vec2 reflectCoord = distortUV(screenCoord, waterTurbulence * 0.1);
        vec2 refractCoord = distortUV(screenCoord, waterTurbulence * 0.2);
        
        vec3 reflection = texture(reflectionTexture, reflectCoord).rgb;
        vec3 refraction = texture(refractionTexture, refractCoord).rgb;
        
        // 深度计算
        float depth = texture(depthTexture, screenCoord).r;
        float waterFactor = clamp((depth - gl_FragCoord.z) * waterDepth, 0.0, 1.0);
        
        // 菲涅尔效果
        float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), fresnelPower);
        
        // 泡沫效果
        float foam = texture(foamTexture, distortedUV).r;
        foam *= (1.0 - waterFactor) * foamStrength;
        
        // 合并颜色
        vec3 finalColor = mix(refraction, reflection, fresnel * reflectivity);
        finalColor = mix(finalColor, waterColor, waterFactor);
        finalColor += foam * vec3(1.0);
        
        // 添加高光
        vec3 halfwayDir = normalize(lightDir + viewDir);
        float spec = pow(max(dot(normal, halfwayDir), 0.0), 32.0);
        finalColor += lightColor * spec * fresnel;
        
        FragColor = vec4(finalColor, 1.0);
    } else { // 天空处理
        vec3 reflectDir = reflect(-viewDir, normal);
        vec3 skyColor = texture(skybox, reflectDir).rgb;
        
        // 大气散射效果
        float atmosphere = pow(1.0 - max(dot(normal, vec3(0.0, 1.0, 0.0)), 0.0), 1.5);
        vec3 atmosphereColor = vec3(0.6, 0.8, 1.0);
        
        skyColor = mix(skyColor, atmosphereColor, atmosphere);
        
        FragColor = vec4(skyColor, 1.0);
    }
} 