"""
Mesh Data Analyzer Tool
----------------------

这个工具用于分析和优化3D模型网格数据，主要功能：

1. 分析功能:
   - 面数统计分析
   - 网格复杂度评估
   - 内存布局分析
   - LOD需求分析

2. 优化目标:
   - 自动生成LOD
   - 优化网格数据
   - 减少内存碎片
   - 提升加载性能

3. 分析维度:
   - 顶点数量
   - 面数统计
   - 内存布局
   - 渲染性能

4. 使用方法:
   python mesh_analyzer.py [model_folder_path]
"""

import os
import json
import numpy as np
import trimesh
import matplotlib.pyplot as plt
from collections import defaultdict
from typing import Dict, List, Tuple
import struct

class MeshAnalyzer:
    def __init__(self):
        self.meshes = {}
        self.stats = defaultdict(int)
        self.memory_layout = {}
        self.lod_suggestions = []
        
        # LOD级别设置
        self.LOD_LEVELS = {
            'high': 1.0,    # 原始面数
            'medium': 0.5,  # 50%面数
            'low': 0.25,    # 25%面数
            'very_low': 0.1 # 10%面数
        }
        
    def scan_models(self, model_path: str):
        """扫描模型文件"""
        print(f"Scanning models in: {model_path}")
        
        for root, _, files in os.walk(model_path):
            for file in files:
                if file.endswith(('.obj', '.fbx', '.gltf', '.glb')):
                    self._analyze_mesh(os.path.join(root, file))
                    
    def _analyze_mesh(self, mesh_path: str):
        """分析单个模型文件"""
        try:
            mesh = trimesh.load(mesh_path)
            
            # 基础网格信息
            mesh_info = {
                'path': mesh_path,
                'vertices': len(mesh.vertices),
                'faces': len(mesh.faces),
                'memory_size': self._calculate_memory_size(mesh),
                'complexity': self._calculate_complexity(mesh),
                'bounds': mesh.bounds.tolist(),
                'volume': mesh.volume if mesh.is_watertight else 0
            }
            
            # 分析内存布局
            self._analyze_memory_layout(mesh, mesh_info)
            
            # 评估LOD需求
            self._evaluate_lod_requirements(mesh_info)
            
            self.meshes[mesh_path] = mesh_info
            self._update_stats(mesh_info)
            
        except Exception as e:
            print(f"Error analyzing mesh {mesh_path}: {e}")
            
    def _calculate_memory_size(self, mesh) -> int:
        """计算网格数据内存占用"""
        vertex_size = len(mesh.vertices) * 3 * 4  # xyz * float32
        face_size = len(mesh.faces) * 3 * 4       # 三角形索引 * int32
        normal_size = len(mesh.vertices) * 3 * 4  # 法线数据
        uv_size = len(mesh.vertices) * 2 * 4 if hasattr(mesh, 'visual') else 0  # UV数据
        
        return vertex_size + face_size + normal_size + uv_size
        
    def _calculate_complexity(self, mesh) -> float:
        """计算网格复杂度分数"""
        # 基于面数、顶点数和体积的复杂度评分
        vertex_score = len(mesh.vertices) / 1000  # 每1000个顶点1分
        face_score = len(mesh.faces) / 1000      # 每1000个面1分
        volume_score = mesh.volume / 1000 if mesh.is_watertight else 0
        
        return vertex_score + face_score + volume_score
        
    def _analyze_memory_layout(self, mesh, mesh_info: dict):
        """分析内存布局"""
        # 分析数据对齐和内存碎片
        vertex_data = mesh.vertices.flatten()
        face_data = mesh.faces.flatten()
        
        # 检查数据对齐
        vertex_alignment = len(vertex_data) % 16  # 检查16字节对齐
        face_alignment = len(face_data) % 16
        
        mesh_info['memory_layout'] = {
            'vertex_alignment': vertex_alignment,
            'face_alignment': face_alignment,
            'fragmentation': self._calculate_fragmentation(vertex_data, face_data)
        }
        
    def _calculate_fragmentation(self, vertex_data: np.ndarray, face_data: np.ndarray) -> float:
        """计算内存碎片率"""
        total_size = len(vertex_data) + len(face_data)
        aligned_size = ((total_size + 15) // 16) * 16
        return (aligned_size - total_size) / aligned_size
        
    def _evaluate_lod_requirements(self, mesh_info: dict):
        """评估LOD需求"""
        faces = mesh_info['faces']
        
        # 根据面数决定是否需要LOD
        if faces > 10000:  # 高面数模型
            mesh_info['lod_required'] = True
            mesh_info['suggested_lods'] = self._calculate_lod_levels(faces)
        else:
            mesh_info['lod_required'] = False
            mesh_info['suggested_lods'] = {}
            
    def _calculate_lod_levels(self, face_count: int) -> Dict[str, int]:
        """计算建议的LOD级别面数"""
        return {
            level: int(face_count * ratio)
            for level, ratio in self.LOD_LEVELS.items()
        }
        
    def _update_stats(self, mesh_info: dict):
        """更新统计信息"""
        self.stats['total_vertices'] += mesh_info['vertices']
        self.stats['total_faces'] += mesh_info['faces']
        self.stats['total_memory'] += mesh_info['memory_size']
        
        # 面数分类统计
        if mesh_info['faces'] < 1000:
            self.stats['low_poly_count'] += 1
        elif mesh_info['faces'] < 10000:
            self.stats['medium_poly_count'] += 1
        else:
            self.stats['high_poly_count'] += 1
            
    def analyze_optimization_potential(self):
        """分析优化潜力"""
        for path, info in self.meshes.items():
            # 检查高面数模型
            if info['faces'] > 10000:
                self.lod_suggestions.append({
                    'mesh': path,
                    'type': 'high_poly',
                    'current_faces': info['faces'],
                    'suggested_lods': info['suggested_lods'],
                    'memory_save': self._estimate_lod_memory_save(info)
                })
                
            # 检查内存布局问题
            if info['memory_layout']['fragmentation'] > 0.2:  # 20%碎片率
                self.lod_suggestions.append({
                    'mesh': path,
                    'type': 'fragmentation',
                    'current_fragmentation': info['memory_layout']['fragmentation'],
                    'suggested_action': 'optimize_layout',
                    'memory_save': info['memory_size'] * info['memory_layout']['fragmentation']
                })
                
    def _estimate_lod_memory_save(self, mesh_info: dict) -> int:
        """估算LOD系统节省的内存"""
        original_size = mesh_info['memory_size']
        lod_sizes = sum(original_size * ratio for ratio in self.LOD_LEVELS.values())
        return original_size - (lod_sizes / len(self.LOD_LEVELS))
        
    def generate_report(self, output_path: str):
        """生成分析报告"""
        report = {
            'mesh_stats': {
                'total_models': len(self.meshes),
                'total_vertices': self.stats['total_vertices'],
                'total_faces': self.stats['total_faces'],
                'total_memory': self._format_size(self.stats['total_memory']),
                'poly_count_distribution': {
                    'low': self.stats['low_poly_count'],
                    'medium': self.stats['medium_poly_count'],
                    'high': self.stats['high_poly_count']
                }
            },
            'optimization_potential': {
                'total_suggestions': len(self.lod_suggestions),
                'potential_memory_save': self._format_size(
                    sum(s['memory_save'] for s in self.lod_suggestions)
                ),
                'suggestions': self.lod_suggestions
            },
            'memory_layout_analysis': self._analyze_overall_memory_layout()
        }
        
        with open(output_path, 'w') as f:
            json.dump(report, f, indent=2)
            
        return report
        
    def _format_size(self, size_in_bytes: int) -> str:
        """格式化文件大小"""
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size_in_bytes < 1024:
                return f"{size_in_bytes:.2f}{unit}"
            size_in_bytes /= 1024
        return f"{size_in_bytes:.2f}TB"
        
    def _analyze_overall_memory_layout(self) -> Dict:
        """分析整体内存布局"""
        total_fragmentation = 0
        misaligned_count = 0
        
        for info in self.meshes.values():
            total_fragmentation += info['memory_layout']['fragmentation']
            if (info['memory_layout']['vertex_alignment'] != 0 or 
                info['memory_layout']['face_alignment'] != 0):
                misaligned_count += 1
                
        return {
            'average_fragmentation': total_fragmentation / len(self.meshes),
            'misaligned_models': misaligned_count,
            'optimization_needed': misaligned_count > len(self.meshes) * 0.2
        }
        
    def visualize_stats(self, output_dir: str):
        """生成可视化统计图表"""
        os.makedirs(output_dir, exist_ok=True)
        
        # 面数分布图
        self._generate_poly_count_plot(output_dir)
        
        # 内存使用分布图
        self._generate_memory_usage_plot(output_dir)
        
        # LOD优化效果图
        self._generate_lod_impact_plot(output_dir)
        
    def _generate_poly_count_plot(self, output_dir: str):
        """生成面数分布图"""
        plt.figure(figsize=(10, 6))
        
        categories = ['Low Poly', 'Medium Poly', 'High Poly']
        counts = [
            self.stats['low_poly_count'],
            self.stats['medium_poly_count'],
            self.stats['high_poly_count']
        ]
        
        plt.bar(categories, counts)
        plt.title('Model Polygon Count Distribution')
        plt.xlabel('Polygon Category')
        plt.ylabel('Number of Models')
        
        plt.savefig(os.path.join(output_dir, 'poly_count_distribution.png'))
        plt.close()
        
    def _generate_memory_usage_plot(self, output_dir: str):
        """生成内存使用分布图"""
        plt.figure(figsize=(12, 6))
        
        memory_sizes = [info['memory_size'] / (1024 * 1024) for info in self.meshes.values()]
        plt.hist(memory_sizes, bins=50)
        plt.title('Model Memory Usage Distribution')
        plt.xlabel('Memory Usage (MB)')
        plt.ylabel('Number of Models')
        
        plt.savefig(os.path.join(output_dir, 'memory_usage.png'))
        plt.close()
        
    def _generate_lod_impact_plot(self, output_dir: str):
        """生成LOD优化效果图"""
        plt.figure(figsize=(10, 6))
        
        if self.lod_suggestions:
            original = sum(s['current_faces'] for s in self.lod_suggestions 
                         if s['type'] == 'high_poly')
            optimized = sum(s['suggested_lods']['medium'] for s in self.lod_suggestions 
                          if s['type'] == 'high_poly')
            
            plt.bar(['Original', 'Optimized'], [original, optimized])
            plt.title('Potential LOD Optimization Impact')
            plt.ylabel('Total Face Count')
            
            # 添加优化比例标签
            reduction = (original - optimized) / original * 100
            plt.text(0.5, optimized, f'-{reduction:.1f}%', ha='center', va='bottom')
            
        plt.savefig(os.path.join(output_dir, 'lod_impact.png'))
        plt.close()

def main():
    """主函数"""
    analyzer = MeshAnalyzer()
    
    # 扫描模型
    model_path = "path/to/your/models"
    analyzer.scan_models(model_path)
    
    # 分析优化潜力
    analyzer.analyze_optimization_potential()
    
    # 生成报告
    report = analyzer.generate_report("mesh_analysis_report.json")
    
    # 生成可视化
    analyzer.visualize_stats("mesh_stats")
    
    # 打印分析摘要
    print("\nMesh Analysis Summary:")
    print(f"Total Models: {report['mesh_stats']['total_models']}")
    print(f"Total Vertices: {report['mesh_stats']['total_vertices']}")
    print(f"Total Faces: {report['mesh_stats']['total_faces']}")
    print(f"Total Memory Usage: {report['mesh_stats']['total_memory']}")
    
    # 打印优化建议
    print("\nOptimization Suggestions:")
    for suggestion in report['optimization_potential']['suggestions'][:5]:
        print(f"\nMesh: {os.path.basename(suggestion['mesh'])}")
        print(f"Type: {suggestion['type']}")
        if suggestion['type'] == 'high_poly':
            print(f"Current Faces: {suggestion['current_faces']}")
            print("Suggested LODs:")
            for level, faces in suggestion['suggested_lods'].items():
                print(f"  {level}: {faces} faces")
        elif suggestion['type'] == 'fragmentation':
            print(f"Current Fragmentation: {suggestion['current_fragmentation']:.2%}")
            print(f"Suggested Action: {suggestion['suggested_action']}")
        print(f"Potential Memory Save: {analyzer._format_size(suggestion['memory_save'])}")

if __name__ == "__main__":
    main() 