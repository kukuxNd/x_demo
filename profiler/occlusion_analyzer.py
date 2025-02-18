"""
Occlusion Culling Analyzer Tool
------------------------------

这个工具用于分析和优化场景中的遮挡剔除效果，主要功能：

1. 分析功能:
   - 场景物件分层分析
   - 遮挡关系计算
   - 视锥体剔除测试
   - 性能开销评估

2. 优化目标:
   - 优化遮挡剔除策略
   - 降低剔除开销
   - 提高剔除效率
   - 平衡精度和性能

3. 剔除方案:
   - 大物件: 软光栅化遮挡
   - 小物件: 视锥体+包围盒
   - 动态物件: 分块视锥+四叉树

4. 使用方法:
   python occlusion_analyzer.py [scene_path]
"""

import numpy as np
import json
import matplotlib.pyplot as plt
from collections import defaultdict
import math
from typing import List, Dict, Tuple
import os

class OcclusionAnalyzer:
    def __init__(self):
        self.objects = []
        self.large_occluders = []
        self.small_objects = []
        self.dynamic_objects = []
        self.quadtree = None
        self.stats = {}
        
    def load_scene(self, scene_path: str):
        """加载场景数据并进行初始分类"""
        print(f"Loading scene: {scene_path}")
        try:
            with open(scene_path, 'r') as f:
                scene_data = json.load(f)
                
            # 根据物件大小和属性进行分类
            for obj in scene_data.get('objects', []):
                bounds = self._calculate_bounds(obj)
                volume = self._calculate_volume(bounds)
                
                obj_data = {
                    'id': obj.get('id'),
                    'bounds': bounds,
                    'volume': volume,
                    'position': obj.get('position'),
                    'is_static': obj.get('is_static', True),
                    'mesh_name': obj.get('mesh_name')
                }
                
                # 分类物件
                if volume > 1000:  # 大物件阈值
                    self.large_occluders.append(obj_data)
                elif not obj_data['is_static']:
                    self.dynamic_objects.append(obj_data)
                else:
                    self.small_objects.append(obj_data)
                    
                self.objects.append(obj_data)
                
        except Exception as e:
            print(f"Error loading scene: {e}")
            
    def _calculate_bounds(self, obj: dict) -> dict:
        """计算物件的包围盒"""
        # 简化的包围盒计算
        pos = obj.get('position', [0, 0, 0])
        size = obj.get('size', [1, 1, 1])
        return {
            'min': [p - s/2 for p, s in zip(pos, size)],
            'max': [p + s/2 for p, s in zip(pos, size)]
        }
        
    def _calculate_volume(self, bounds: dict) -> float:
        """计算包围盒体积"""
        size = [b_max - b_min for b_max, b_min in zip(bounds['max'], bounds['min'])]
        return size[0] * size[1] * size[2]
        
    def analyze_occlusion(self, camera_positions: List[List[float]]):
        """分析场景遮挡情况"""
        self.stats = {
            'total_objects': len(self.objects),
            'large_occluders': len(self.large_occluders),
            'small_objects': len(self.small_objects),
            'dynamic_objects': len(self.dynamic_objects),
            'culling_stats': []
        }
        
        for cam_pos in camera_positions:
            view_stats = self._analyze_view_position(cam_pos)
            self.stats['culling_stats'].append(view_stats)
            
    def _analyze_view_position(self, camera_pos: List[float]) -> dict:
        """分析特定视角的遮挡情况"""
        # 模拟视锥体剔除
        frustum_culled = self._simulate_frustum_culling(camera_pos)
        
        # 模拟软光栅化遮挡
        raster_culled = self._simulate_raster_occlusion(camera_pos, self.large_occluders)
        
        # 模拟四叉树加速
        quadtree_culled = self._simulate_quadtree_culling(camera_pos)
        
        return {
            'camera_position': camera_pos,
            'frustum_culled': len(frustum_culled),
            'raster_culled': len(raster_culled),
            'quadtree_culled': len(quadtree_culled),
            'total_culled': len(frustum_culled) + len(raster_culled) + len(quadtree_culled)
        }
        
    def _simulate_frustum_culling(self, camera_pos: List[float]) -> List[dict]:
        """模拟视锥体剔除"""
        culled_objects = []
        for obj in self.small_objects:
            if self._is_in_frustum(camera_pos, obj['bounds']):
                culled_objects.append(obj)
        return culled_objects
        
    def _simulate_raster_occlusion(self, camera_pos: List[float], 
                                 occluders: List[dict]) -> List[dict]:
        """模拟软光栅化遮挡"""
        culled_objects = []
        for obj in occluders:
            if self._is_occluded(camera_pos, obj['bounds']):
                culled_objects.append(obj)
        return culled_objects
        
    def _simulate_quadtree_culling(self, camera_pos: List[float]) -> List[dict]:
        """模拟四叉树加速的动态物件剔除"""
        culled_objects = []
        for obj in self.dynamic_objects:
            if self._is_in_quadtree_visible_area(camera_pos, obj['bounds']):
                culled_objects.append(obj)
        return culled_objects
        
    def _is_in_frustum(self, camera_pos: List[float], bounds: dict) -> bool:
        """简化的视锥体检测"""
        # 这里使用简化的视锥体检测逻辑
        return True
        
    def _is_occluded(self, camera_pos: List[float], bounds: dict) -> bool:
        """简化的遮挡检测"""
        # 这里使用简化的遮挡检测逻辑
        return True
        
    def _is_in_quadtree_visible_area(self, camera_pos: List[float], 
                                    bounds: dict) -> bool:
        """简化的四叉树可见性检测"""
        # 这里使用简化的四叉树检测逻辑
        return True
        
    def generate_report(self, output_path: str):
        """生成分析报告"""
        report = {
            'scene_stats': {
                'total_objects': self.stats['total_objects'],
                'large_occluders': self.stats['large_occluders'],
                'small_objects': self.stats['small_objects'],
                'dynamic_objects': self.stats['dynamic_objects']
            },
            'culling_performance': self.stats['culling_stats'],
            'recommendations': self._generate_recommendations()
        }
        
        with open(output_path, 'w') as f:
            json.dump(report, f, indent=2)
            
        return report
        
    def _generate_recommendations(self) -> List[dict]:
        """生成优化建议"""
        recommendations = []
        
        # 分析大物件密度
        large_density = len(self.large_occluders) / self.stats['total_objects']
        if large_density < 0.1:
            recommendations.append({
                'type': 'large_occluders',
                'message': '大型遮挡物较少，考虑合并小物件或添加遮挡体'
            })
            
        # 分析动态物件比例
        dynamic_ratio = len(self.dynamic_objects) / self.stats['total_objects']
        if dynamic_ratio > 0.3:
            recommendations.append({
                'type': 'dynamic_objects',
                'message': '动态物件比例过高，建议使用实例化或减少动态物件数量'
            })
            
        return recommendations
        
    def visualize_stats(self, output_dir: str):
        """生成可视化统计图表"""
        os.makedirs(output_dir, exist_ok=True)
        
        # 物件分类饼图
        self._generate_object_distribution_pie(output_dir)
        
        # 剔除效果柱状图
        self._generate_culling_performance_bar(output_dir)
        
    def _generate_object_distribution_pie(self, output_dir: str):
        """生成物件分布饼图"""
        plt.figure(figsize=(10, 8))
        labels = ['Large Occluders', 'Small Objects', 'Dynamic Objects']
        sizes = [len(self.large_occluders), 
                len(self.small_objects), 
                len(self.dynamic_objects)]
                
        plt.pie(sizes, labels=labels, autopct='%1.1f%%')
        plt.title('Scene Object Distribution')
        plt.savefig(os.path.join(output_dir, 'object_distribution.png'))
        plt.close()
        
    def _generate_culling_performance_bar(self, output_dir: str):
        """生成剔除性能柱状图"""
        plt.figure(figsize=(12, 6))
        
        if self.stats['culling_stats']:
            avg_stats = {
                'frustum': np.mean([s['frustum_culled'] for s in self.stats['culling_stats']]),
                'raster': np.mean([s['raster_culled'] for s in self.stats['culling_stats']]),
                'quadtree': np.mean([s['quadtree_culled'] for s in self.stats['culling_stats']])
            }
            
            methods = ['Frustum', 'Raster', 'Quadtree']
            values = [avg_stats['frustum'], avg_stats['raster'], avg_stats['quadtree']]
            
            plt.bar(methods, values)
            plt.title('Average Culling Performance')
            plt.ylabel('Objects Culled')
            
            for i, v in enumerate(values):
                plt.text(i, v, f'{int(v)}', ha='center')
                
        plt.savefig(os.path.join(output_dir, 'culling_performance.png'))
        plt.close()

def main():
    """主函数"""
    analyzer = OcclusionAnalyzer()
    
    # 加载场景
    scene_path = "path/to/your/scene.json"
    analyzer.load_scene(scene_path)
    
    # 分析遮挡情况
    camera_positions = [
        [0, 0, 0],
        [10, 5, 10],
        [-10, 5, -10]
    ]
    analyzer.analyze_occlusion(camera_positions)
    
    # 生成报告
    report = analyzer.generate_report("occlusion_analysis_report.json")
    
    # 生成可视化
    analyzer.visualize_stats("occlusion_stats")
    
    # 打印分析摘要
    print("\nScene Analysis Summary:")
    print(f"Total Objects: {report['scene_stats']['total_objects']}")
    print(f"Large Occluders: {report['scene_stats']['large_occluders']}")
    print(f"Small Objects: {report['scene_stats']['small_objects']}")
    print(f"Dynamic Objects: {report['scene_stats']['dynamic_objects']}")
    
    # 打印优化建议
    print("\nOptimization Recommendations:")
    for rec in report['recommendations']:
        print(f"\n{rec['message']}")

if __name__ == "__main__":
    main() 