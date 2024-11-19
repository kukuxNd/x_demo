#version 330 core
layout (location = 0) in vec3 aPos;
layout (location = 1) in vec3 aNormal;
layout (location = 2) in vec2 aTexCoords;
layout (location = 3) in ivec4 aBoneIds;     // 骨骼ID
layout (location = 4) in vec4 aWeights;      // 骨骼权重
layout (location = 5) in vec3 aPhysicsPos;   // 物理模拟位置

out VS_OUT {
    vec3 FragPos;
    vec3 Normal;
    vec2 TexCoords;
    vec3 PhysicsPos;
    float BoneWeight;
} vs_out;

const int MAX_BONES = 100;
uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;
uniform mat4 bones[MAX_BONES];           // 骨骼矩阵数组
uniform float physicsBlend;              // 物理混合权重
uniform vec3 gravity;                    // 重力方向
uniform float stiffness;                 // 刚性系数

void main() {
    // 初始化位置和法线
    vec4 totalPosition = vec4(0.0);
    vec3 totalNormal = vec3(0.0);
    
    // 骨骼动画计算
    for(int i = 0; i < 4; i++) {
        if(aBoneIds[i] == -1) 
            continue;
            
        mat4 boneTransform = bones[aBoneIds[i]];
        vec4 localPosition = boneTransform * vec4(aPos, 1.0);
        vec3 localNormal = mat3(boneTransform) * aNormal;
        
        totalPosition += localPosition * aWeights[i];
        totalNormal += localNormal * aWeights[i];
    }
    
    // 物理模拟位置混合
    vec3 physicsOffset = aPhysicsPos - aPos;
    vec3 finalPos = mix(vec3(totalPosition), aPhysicsPos, physicsBlend);
    
    // 应用刚性约束
    vec3 toPhysics = aPhysicsPos - vec3(totalPosition);
    float dist = length(toPhysics);
    if(dist > 0.0) {
        vec3 constraint = normalize(toPhysics) * min(dist, stiffness);
        finalPos = vec3(totalPosition) + constraint;
    }
    
    // 输出计算结果
    vs_out.FragPos = vec3(model * vec4(finalPos, 1.0));
    vs_out.Normal = normalize(mat3(model) * totalNormal);
    vs_out.TexCoords = aTexCoords;
    vs_out.PhysicsPos = aPhysicsPos;
    vs_out.BoneWeight = aWeights[0];  // 主骨骼权重
    
    gl_Position = projection * view * model * vec4(finalPos, 1.0);
} 