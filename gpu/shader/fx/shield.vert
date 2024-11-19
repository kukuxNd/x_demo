#version 330 core
layout (location = 0) in vec3 aPos;
layout (location = 1) in vec3 aNormal;
layout (location = 2) in vec2 aTexCoords;

out VS_OUT {
    vec3 FragPos;
    vec3 Normal;
    vec2 TexCoords;
    vec3 ViewPos;
    float Height;
} vs_out;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;
uniform float time;
uniform vec3 impactPoint;        // 受击点
uniform float impactProgress;    // 受击动画进度
uniform float pulseStrength;     // 脉冲强度

void main() {
    // 基础位置计算
    vec3 pos = aPos;
    vs_out.Height = (pos.y + 1.0) * 0.5;
    
    // 计算到受击点的距离
    float distToImpact = distance(pos, impactPoint);
    
    // 受击波纹效果
    float impactWave = sin(distToImpact * 10.0 - impactProgress * 5.0) * 
                      exp(-distToImpact * 3.0) * 
                      exp(-impactProgress * 2.0);
                      
    // 添加脉冲动画
    float pulse = sin(time * 2.0 + pos.y * 5.0) * pulseStrength;
    
    // 应用顶点偏移
    pos += aNormal * (impactWave * 0.1 + pulse);
    
    vs_out.FragPos = vec3(model * vec4(pos, 1.0));
    vs_out.Normal = mat3(transpose(inverse(model))) * aNormal;
    vs_out.TexCoords = aTexCoords;
    vs_out.ViewPos = vec3(view * vec4(vs_out.FragPos, 1.0));
    
    gl_Position = projection * view * vec4(vs_out.FragPos, 1.0);
} 