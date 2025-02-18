"""
Material Analyzer Tool
---------------------

这个工具用于分析和优化场景中的材质使用情况，主要功能：

1. 材质分析功能:
   - 发现不必要的材质重复
   - 识别合批优化机会
   - 可视化材质使用情况
   - 提供具体的优化建议

2. 主要优化目标:
   - 减少Draw Call
   - 优化材质资源使用
   - 提高渲染批次效率
   - 规范化材质使用

3. 输出内容:
   - JSON格式的详细分析报告
   - 材质分布可视化图表
   - 合批潜力分析图表
   - 具体的优化建议列表

4. 使用方法:
   python material_analyzer.py [scene_path]

作者: [Your Name]
日期: [Date]
版本: 1.0
"""

import os
import json
import numpy as np
from collections import defaultdict
import matplotlib.pyplot as plt
import seaborn as sns

class MaterialAnalyzer:
    """
    材质分析器类
    
    主要职责：
    1. 扫描和分析场景中的材质使用情况
    2. 识别可合批的材质组
    3. 生成分析报告和可视化图表
    
    属性:
        materials: 存储所有材质信息的字典
        material_stats: 材质使用统计信息
        batch_groups: 可合批的材质组信息
    """

    def __init__(self):
        """
        初始化材质分析器
        设置基础数据结构和配置
        """
        self.materials = defaultdict(list)
        self.material_stats = {}
        self.batch_groups = defaultdict(list)
        
    def scan_scene(self, scene_path):
        """
        扫描场景中的材质使用情况
        
        参数:
            scene_path: 场景文件夹路径
            
        功能:
            - 递归扫描场景文件夹
            - 识别和分析材质文件
            - 收集材质使用统计
        """
        print(f"Scanning scene: {scene_path}")
        
        for root, _, files in os.walk(scene_path):
            for file in files:
                if file.endswith(('.mat', '.material')):
                    self._analyze_material(os.path.join(root, file))
    
    def _analyze_material(self, material_path):
        """
        分析单个材质文件
        
        参数:
            material_path: 材质文件路径
            
        功能:
            - 解析材质属性
            - 收集材质信息
            - 统计使用情况
        """
        try:
            with open(material_path, 'r') as f:
                material_data = json.load(f)
                
            material_name = material_data.get('name', 'unknown')
            shader_name = material_data.get('shader', 'unknown')
            
            self.materials[shader_name].append({
                'path': material_path,
                'name': material_name,
                'properties': material_data.get('properties', {}),
                'usage_count': 0
            })
            
        except Exception as e:
            print(f"Error analyzing material {material_path}: {e}")
    
    def analyze_batching_potential(self):
        """
        分析材质合批潜力
        
        功能:
            - 根据材质属性分组
            - 识别可合批的材质组
            - 计算潜在的性能提升
        """
        for shader_name, materials in self.materials.items():
            property_groups = defaultdict(list)
            
            for material in materials:
                prop_key = self._get_property_hash(material['properties'])
                property_groups[prop_key].append(material)
            
            for group_id, group in enumerate(property_groups.values()):
                if len(group) > 1:
                    self.batch_groups[shader_name].append({
                        'group_id': group_id,
                        'materials': group,
                        'count': len(group)
                    })
    
    def _get_property_hash(self, properties):
        """
        生成材质属性的哈希值
        
        参数:
            properties: 材质属性字典
            
        返回:
            str: 属性哈希值
            
        用途:
            用于识别具有相同属性的材质
        """
        sorted_props = sorted(properties.items())
        return str(sorted_props)
    
    def generate_report(self, output_path):
        """
        生成分析报告
        
        参数:
            output_path: 报告输出路径
            
        功能:
            - 生成材质使用统计
            - 输出合批建议
            - 保存JSON格式报告
        """
        report = {
            'summary': {
                'total_materials': sum(len(mats) for mats in self.materials.values()),
                'shader_count': len(self.materials),
                'batch_groups': sum(len(groups) for groups in self.batch_groups.values())
            },
            'shader_stats': {},
            'batch_recommendations': []
        }
        
        # 生成详细统计
        for shader_name, materials in self.materials.items():
            report['shader_stats'][shader_name] = {
                'material_count': len(materials),
                'batch_groups': len(self.batch_groups[shader_name])
            }
        
        # 生成优化建议
        for shader_name, groups in self.batch_groups.items():
            for group in groups:
                report['batch_recommendations'].append({
                    'shader': shader_name,
                    'material_count': group['count'],
                    'materials': [m['name'] for m in group['materials']]
                })
        
        with open(output_path, 'w') as f:
            json.dump(report, f, indent=2)
        
        return report
    
    def visualize_stats(self, output_dir):
        """
        生成可视化统计图表
        
        参数:
            output_dir: 输出目录
            
        功能:
            - 生成材质分布饼图
            - 生成合批潜力条形图
            - 保存统计图表
        """
        os.makedirs(output_dir, exist_ok=True)
        
        # 材质分布饼图
        self._generate_distribution_pie(output_dir)
        
        # 合批潜力条形图
        self._generate_batch_potential_bar(output_dir)
    
    def _generate_distribution_pie(self, output_dir):
        """生成材质分布饼图"""
        plt.figure(figsize=(10, 8))
        materials_per_shader = [len(mats) for mats in self.materials.values()]
        plt.pie(materials_per_shader, labels=self.materials.keys(), autopct='%1.1f%%')
        plt.title('Material Distribution by Shader')
        plt.savefig(os.path.join(output_dir, 'material_distribution.png'))
        plt.close()
    
    def _generate_batch_potential_bar(self, output_dir):
        """生成合批潜力条形图"""
        plt.figure(figsize=(12, 6))
        shader_names = list(self.batch_groups.keys())
        batch_counts = [len(groups) for groups in self.batch_groups.values()]
        plt.bar(shader_names, batch_counts)
        plt.xticks(rotation=45)
        plt.title('Batching Potential by Shader')
        plt.ylabel('Number of Potential Batch Groups')
        plt.tight_layout()
        plt.savefig(os.path.join(output_dir, 'batch_potential.png'))
        plt.close()

def main():
    """
    主函数
    
    功能:
        - 初始化分析器
        - 执行分析流程
        - 生成报告和可视化
        - 输出优化建议
    """
    analyzer = MaterialAnalyzer()
    
    scene_path = "path/to/your/scene"
    analyzer.scan_scene(scene_path)
    analyzer.analyze_batching_potential()
    
    report = analyzer.generate_report("material_analysis_report.json")
    analyzer.visualize_stats("material_stats")
    
    # 打印分析摘要
    print("\nAnalysis Summary:")
    print(f"Total Materials: {report['summary']['total_materials']}")
    print(f"Shader Count: {report['summary']['shader_count']}")
    print(f"Potential Batch Groups: {report['summary']['batch_groups']}")
    
    # 打印优化建议
    print("\nOptimization Recommendations:")
    for rec in report['batch_recommendations']:
        print(f"\nShader: {rec['shader']}")
        print(f"Can batch {rec['material_count']} materials:")
        for mat in rec['materials']:
            print(f"  - {mat}")

if __name__ == "__main__":
    main() 