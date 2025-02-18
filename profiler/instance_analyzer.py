"""
GPU Instancing Analyzer Tool
---------------------------

这个工具用于分析和优化场景中重复物件的渲染，主要功能：

1. 分析功能:
   - 自动检测场景中重复的Mesh
   - 识别可进行Instancing的物件组
   - 计算Draw Call优化潜力
   - 生成实例化建议

2. 优化目标:
   - 减少重复物件的Draw Call
   - 自动组织Instancing批次
   - 优化内存使用
   - 提升渲染性能

3. 输出内容:
   - 可实例化物件报告
   - 优化前后性能对比
   - 实例化分组可视化
   - 具体的优化建议

4. 使用方法:
   python instance_analyzer.py [scene_path]
"""

import os
import json
import numpy as np
from collections import defaultdict
import matplotlib.pyplot as plt
import hashlib
from typing import Dict, List, Tuple

class InstanceAnalyzer:
    def __init__(self):
        self.mesh_groups = defaultdict(list)
        self.instance_candidates = defaultdict(list)
        self.optimization_stats = {}
        
    def calculate_mesh_hash(self, mesh_data: dict) -> str:
        """
        计算Mesh的哈希值用于识别相同Mesh
        
        参数:
            mesh_data: Mesh的顶点和索引数据
            
        返回:
            str: Mesh的唯一哈希值
        """
        # 这里简化处理，实际应该比较顶点数据
        mesh_str = f"{mesh_data.get('vertices', '')}{mesh_data.get('indices', '')}"
        return hashlib.md5(mesh_str.encode()).hexdigest()
    
    def scan_scene(self, scene_path: str):
        """
        扫描场景中的所有Mesh物件
        
        参数:
            scene_path: 场景文件路径
        """
        print(f"Scanning scene for instance candidates: {scene_path}")
        
        # 模拟场景扫描
        try:
            with open(scene_path, 'r') as f:
                scene_data = json.load(f)
                
            # 处理场景中的每个物件
            for obj in scene_data.get('objects', []):
                mesh_data = obj.get('mesh', {})
                mesh_hash = self.calculate_mesh_hash(mesh_data)
                
                self.mesh_groups[mesh_hash].append({
                    'object_id': obj.get('id'),
                    'position': obj.get('position'),
                    'rotation': obj.get('rotation'),
                    'scale': obj.get('scale'),
                    'mesh_name': obj.get('mesh_name')
                })
                
        except Exception as e:
            print(f"Error scanning scene: {e}")
    
    def analyze_instance_potential(self, min_instance_count: int = 10):
        """
        分析可实例化的物件组
        
        参数:
            min_instance_count: 最小实例化数量阈值
        """
        total_draw_calls_before = 0
        total_draw_calls_after = 0
        
        for mesh_hash, objects in self.mesh_groups.items():
            if len(objects) >= min_instance_count:
                self.instance_candidates[mesh_hash] = objects
                
                # 计算优化效果
                total_draw_calls_before += len(objects)
                total_draw_calls_after += 1  # 实例化后每组只需一次Draw Call
        
        self.optimization_stats = {
            'draw_calls_before': total_draw_calls_before,
            'draw_calls_after': total_draw_calls_after,
            'reduction_percentage': ((total_draw_calls_before - total_draw_calls_after) 
                                   / total_draw_calls_before * 100 if total_draw_calls_before > 0 else 0)
        }
    
    def generate_instance_groups(self) -> Dict[str, List[dict]]:
        """
        生成实例化分组数据
        
        返回:
            Dict: 按Mesh分组的实例化数据
        """
        instance_groups = {}
        
        for mesh_hash, objects in self.instance_candidates.items():
            # 提取实例化所需的变换数据
            transforms = []
            for obj in objects:
                transforms.append({
                    'position': obj['position'],
                    'rotation': obj['rotation'],
                    'scale': obj['scale']
                })
                
            instance_groups[objects[0]['mesh_name']] = {
                'instance_count': len(objects),
                'transforms': transforms,
                'original_draw_calls': len(objects)
            }
            
        return instance_groups
    
    def generate_report(self, output_path: str):
        """
        生成分析报告
        
        参数:
            output_path: 报告输出路径
        """
        report = {
            'summary': {
                'total_objects': sum(len(group) for group in self.mesh_groups.values()),
                'instance_groups': len(self.instance_candidates),
                'optimization_stats': self.optimization_stats
            },
            'instance_groups': self.generate_instance_groups(),
            'recommendations': []
        }
        
        # 生成优化建议
        for mesh_name, group_data in report['instance_groups'].items():
            report['recommendations'].append({
                'mesh_name': mesh_name,
                'instance_count': group_data['instance_count'],
                'draw_call_reduction': group_data['instance_count'] - 1,
                'recommendation': f"Convert {mesh_name} to GPU Instancing to reduce {group_data['instance_count'] - 1} draw calls"
            })
            
        with open(output_path, 'w') as f:
            json.dump(report, f, indent=2)
            
        return report
    
    def visualize_stats(self, output_dir: str):
        """
        生成可视化统计图表
        
        参数:
            output_dir: 输出目录
        """
        os.makedirs(output_dir, exist_ok=True)
        
        # 绘制Draw Call优化对比图
        plt.figure(figsize=(10, 6))
        labels = ['Before', 'After']
        values = [self.optimization_stats['draw_calls_before'],
                 self.optimization_stats['draw_calls_after']]
        
        plt.bar(labels, values)
        plt.title('Draw Call Optimization')
        plt.ylabel('Number of Draw Calls')
        for i, v in enumerate(values):
            plt.text(i, v, str(v), ha='center')
            
        plt.savefig(os.path.join(output_dir, 'draw_call_optimization.png'))
        plt.close()
        
        # 绘制实例化组分布图
        if self.instance_candidates:
            plt.figure(figsize=(12, 6))
            groups = list(self.instance_candidates.keys())
            counts = [len(objects) for objects in self.instance_candidates.values()]
            
            plt.bar(range(len(groups)), counts)
            plt.title('Instance Groups Distribution')
            plt.xlabel('Mesh Groups')
            plt.ylabel('Instance Count')
            plt.xticks(rotation=45)
            plt.tight_layout()
            
            plt.savefig(os.path.join(output_dir, 'instance_distribution.png'))
            plt.close()

def main():
    """
    主函数
    """
    analyzer = InstanceAnalyzer()
    
    # 扫描场景
    scene_path = "path/to/your/scene.json"
    analyzer.scan_scene(scene_path)
    
    # 分析实例化潜力
    analyzer.analyze_instance_potential(min_instance_count=10)
    
    # 生成报告
    report = analyzer.generate_report("instance_analysis_report.json")
    
    # 生成可视化
    analyzer.visualize_stats("instance_stats")
    
    # 打印优化摘要
    print("\nOptimization Summary:")
    print(f"Total Draw Calls Before: {report['summary']['optimization_stats']['draw_calls_before']}")
    print(f"Total Draw Calls After: {report['summary']['optimization_stats']['draw_calls_after']}")
    print(f"Reduction: {report['summary']['optimization_stats']['reduction_percentage']:.2f}%")
    
    # 打印优化建议
    print("\nOptimization Recommendations:")
    for rec in report['recommendations']:
        print(f"\n{rec['recommendation']}")
        print(f"Instance Count: {rec['instance_count']}")
        print(f"Draw Call Reduction: {rec['draw_call_reduction']}")

if __name__ == "__main__":
    main() 