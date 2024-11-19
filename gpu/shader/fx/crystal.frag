#version 330 core
out vec4 FragColor;

in vec3 FragPos;
in vec3 Normal;
in vec2 TexCoords;
in vec4 ClipPos;
in vec3 ViewPos;

// 纹理
uniform samplerCube envMap;           // 环境贴图
uniform sampler2D normalMap;          // 法线贴图
uniform sampler2D noiseTexture;       // 噪声纹理
uniform sampler2D depthTexture;       // 深度纹理

// 晶体参数
uniform vec3 crystalColor;            // 晶体基础颜色
uniform float refractionIndex;        // 折射率
uniform float dispersion;             // 色散强度
uniform float roughness;              // 表面粗糙度
uniform float innerStructureScale;    // 内部结构缩放
uniform float crystalTransparency;    // 透明度

// 相机参数
uniform vec3 viewPos;
uniform float time;
uniform vec2 screenSize;

// 晶体内部结构
float getInnerStructure(vec3 pos) {
    float noise = texture(noiseTexture, pos.xy * innerStructureScale + time * 0.1).r;
    noise += texture(noiseTexture, pos.yz * innerStructureScale - time * 0.15).r;
    noise += texture(noiseTexture, pos.xz * innerStructureScale + time * 0.05).r;
    return noise / 3.0;
}

// 色散效果
vec3 calculateDispersion(vec3 refractDir, float dispersionStrength) {
    vec3 dispersedColor;
    dispersedColor.r = texture(envMap, refractDir * (1.0 + dispersionStrength)).r;
    dispersedColor.g = texture(envMap, refractDir).g;
    dispersedColor.b = texture(envMap, refractDir * (1.0 - dispersionStrength)).b;
    return dispersedColor;
}

void main() {
    // 视线方向
    vec3 viewDir = normalize(viewPos - FragPos);
    vec3 norm = normalize(Normal);
    
    // 菲涅尔效果
    float fresnel = pow(1.0 - max(dot(norm, viewDir), 0.0), 5.0);
    fresnel = mix(0.1, 1.0, fresnel);
    
    // 反射
    vec3 reflectDir = reflect(-viewDir, norm);
    vec3 reflectionColor = texture(envMap, reflectDir).rgb;
    
    // 折射
    vec3 refractDir = refract(-viewDir, norm, 1.0/refractionIndex);
    vec3 refractionColor = calculateDispersion(refractDir, dispersion);
    
    // 内部结构
    float innerNoise = getInnerStructure(FragPos);
    vec3 innerColor = crystalColor * innerNoise;
    
    // 表面扰动
    float surfaceNoise = texture(noiseTexture, TexCoords + time * 0.1).r;
    norm = normalize(norm + vec3(surfaceNoise * 0.1));
    
    // 深度计算
    vec2 screenCoord = (ClipPos.xy / ClipPos.w) * 0.5 + 0.5;
    float sceneDepth = texture(depthTexture, screenCoord).r;
    float currentDepth = ClipPos.z / ClipPos.w;
    float depthDiff = abs(sceneDepth - currentDepth);
    
    // 厚度效果
    float thickness = smoothstep(0.0, 1.0, depthDiff);
    
    // 合并颜色
    vec3 finalColor = mix(refractionColor, reflectionColor, fresnel);
    finalColor = mix(finalColor, innerColor, thickness * 0.5);
    
    // 添加表面高光
    float specular = pow(max(dot(reflectDir, viewDir), 0.0), 32.0);
    finalColor += vec3(1.0) * specular * (1.0 - roughness);
    
    // 边缘发光
    vec3 edgeGlow = crystalColor * pow(1.0 - abs(dot(norm, viewDir)), 3.0);
    finalColor += edgeGlow * 0.5;
    
    // 添加色散效果在边缘
    vec3 dispersedEdge = calculateDispersion(norm, dispersion * 2.0);
    finalColor += dispersedEdge * fresnel * 0.3;
    
    // 透明度计算
    float alpha = mix(crystalTransparency, 1.0, fresnel);
    
    // 最终输出
    FragColor = vec4(finalColor, alpha);
} 