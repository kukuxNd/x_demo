#version 330 core
out vec4 FragColor;

in vec3 FragPos;
in vec3 Normal;
in vec2 TexCoords;
in vec4 WorldPos;

// 基础纹理
uniform sampler2D mainTexture;        // 主纹理
uniform sampler2D noiseTexture;       // 噪声纹理（可选）

// 扫描参数
uniform float scanHeight;             // 扫描线高度
uniform float scanSpeed;              // 扫描速度
uniform float scanWidth;              // 扫描线宽度
uniform vec3 scanColor;               // 扫描线颜色
uniform float scanIntensity;          // 扫描强度
uniform float time;                   // 时间
uniform bool upward;                  // 扫描方向（true为向上，false为向下）
uniform vec2 boundingBoxMin;          // 模型包围盒最小点
uniform vec2 boundingBoxMax;          // 模型包围盒最大点

// 光照参数
uniform vec3 viewPos;
uniform bool useNoise;                // 是否使用噪声纹理

void main() {
    // 获取基础颜色
    vec4 baseColor = texture(mainTexture, TexCoords);
    
    // 计算模型空间的相对高度
    float modelHeight = (WorldPos.y - boundingBoxMin.y) / (boundingBoxMax.y - boundingBoxMin.y);
    
    // 计算扫描线位置
    float scanPos = fract(time * scanSpeed);
    if (!upward) {
        scanPos = 1.0 - scanPos;
    }
    
    // 计算到扫描线的距离
    float distanceToScan = abs(modelHeight - scanPos);
    
    // 使用平滑步进创建扫描线
    float scanValue = 1.0 - smoothstep(0.0, scanWidth, distanceToScan);
    
    // 添加噪声效果（可选）
    if (useNoise) {
        float noise = texture(noiseTexture, TexCoords + vec2(time * 0.1)).r;
        scanValue *= noise;
    }
    
    // 计算菲涅尔效果
    vec3 viewDir = normalize(viewPos - FragPos);
    float fresnel = pow(1.0 - max(dot(normalize(Normal), viewDir), 0.0), 2.0);
    
    // 合并扫描线效果
    vec3 scanEffect = scanColor * scanValue * scanIntensity;
    
    // 添加边缘发光
    scanEffect *= (1.0 + fresnel * 2.0);
    
    // 计算扫描后的颜色
    vec3 finalColor = baseColor.rgb + scanEffect;
    
    // 添加扫描线周围的辉光效果
    float glow = exp(-distanceToScan * 10.0) * scanIntensity * 0.5;
    finalColor += scanColor * glow;
    
    // 确保颜色值在有效范围内
    finalColor = clamp(finalColor, 0.0, 1.0);
    
    // 输出最终颜色
    FragColor = vec4(finalColor, baseColor.a);
    
    // 在扫描线位置添加额外的高光效果
    if (distanceToScan < scanWidth * 2.0) {
        float highlight = (1.0 - distanceToScan / (scanWidth * 2.0)) * 0.2;
        FragColor.rgb += scanColor * highlight;
    }
} 