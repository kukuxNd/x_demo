# Shader 待实现清单

## 环境效果
- [ ] 动态云层和体积云 (VolumetricCloud)
  - 需要3D噪声
  - 光线步进
  - 大气散射

- [ ] 体积光/光轴效果 (VolumetricLight)
  - 光线步进
  - 散射计算
  - 阴影交互

- [ ] 大气散射 (AtmosphericScattering)
  - Rayleigh散射
  - Mie散射
  - 多重散射

## 材质效果
- [ ] 皮毛渲染 (FurRendering)
  - Shell技术
  - 毛发阴影
  - 各向异性高光

- [ ] 布料材质 (ClothMaterial)
  - 各向异性反射
  - 微表面模型
  - 次表面散射

- [ ] 次表面散射 (SubsurfaceScattering)
  - 透射
  - 散射剖面
  - 多层材质

## 后处理效果
- [ ] 景深 (DepthOfField)
  - Circle of Confusion
  - Bokeh效果
  - 景深范围控制

- [ ] 屏幕空间反射 (SSR)
  - 光线追踪
  - 模糊反射
  - 边缘处理

- [ ] 屏幕空间环境光遮蔽 (SSAO)
  - 半球采样
  - 深度比较
  - 模糊处理

## 粒子效果
- [ ] 高级粒子系统 (AdvancedParticle)
  - GPU粒子
  - 粒子碰撞
  - 粒子生命周期

- [ ] 流体效果 (FluidEffect)
  - SPH模拟
  - 表面张力
  - 粒子交互

## 风格化渲染
- [ ] 铅笔素描 (PencilSketch)
  - 边缘检测
  - 交叉线
  - 素描纹理

- [ ] 水彩画风格 (Watercolor)
  - 颜色扩散
  - 边缘暗化
  - 纸张纹理

## 特殊效果
- [ ] 传送门 (Portal)
  - 视角扭曲
  - 边缘发光
  - 空间变形

- [ ] 时空扭曲 (SpaceDistortion)
  - UV扭曲
  - 顶点动画
  - 色散效果

## 场景效果
- [ ] 植被交互 (VegetationInteraction)
  - 风力系统
  - 碰撞变形
  - 动态阴影

- [ ] 动态天气 (DynamicWeather)
  - 雨雪效果
  - 云层变化
  - 光照适应

## 优化目标
- [ ] 性能优化
  - LOD系统
  - 实例化渲染
  - 着色器变体

- [ ] 代码重构
  - 模块化设计
  - 通用函数库
  - 参数配置系统

## 工具支持
- [ ] 调试工具
  - 着色器可视化
  - 性能分析
  - 参数调节界面

## 参考资源
- PBR材质系统
- Unity URP/HDRP
- Unreal Engine材质系统
- 各类技术文档和论文

## 注意事项
1. 需要考虑跨平台兼容性
2. 性能和质量的平衡
3. 易用性和可维护性
4. 代码复用和模块化 