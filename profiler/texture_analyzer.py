"""
Texture Resource Analyzer Tool
----------------------------

这个工具用于分析和优化贴图资源，主要功能：

1. 分析功能:
   - 贴图尺寸分析
   - 格式检查
   - 内存占用统计
   - 压缩状态检查

2. 优化目标:
   - 识别过大贴图
   - 检查压缩格式
   - 优化内存使用
   - 规范化贴图标准

3. 分析维度:
   - 分辨率
   - 文件大小
   - 压缩格式
   - 内存占用

4. 使用方法:
   python texture_analyzer.py [texture_folder_path]
"""

import os
import json
from PIL import Image
import numpy as np
import matplotlib.pyplot as plt
from collections import defaultdict
import shutil
from typing import Dict, List, Tuple
import sys

class TextureAnalyzer:
    def __init__(self):
        self.textures = {}
        self.stats = defaultdict(int)
        self.optimization_suggestions = []
        self.memory_usage = 0
        
        # 定义标准
        self.MAX_TEXTURE_SIZE = 2048
        self.RECOMMENDED_FORMATS = {'.png', '.jpg', '.dds', '.tga'}
        self.SIZE_CATEGORIES = {
            'small': 512,
            'medium': 1024,
            'large': 2048,
            'oversized': 4096
        }
        
    def scan_textures(self, texture_path: str):
        """扫描贴图资源"""
        print(f"Scanning textures in: {texture_path}")
        
        for root, _, files in os.walk(texture_path):
            for file in files:
                if self._is_texture_file(file):
                    self._analyze_texture(os.path.join(root, file))
                    
    def _is_texture_file(self, filename: str) -> bool:
        """检查是否为贴图文件"""
        return any(filename.lower().endswith(ext) for ext in 
                  ('.png', '.jpg', '.jpeg', '.tga', '.dds', '.psd'))
                  
    def _analyze_texture(self, texture_path: str):
        """分析单个贴图文件"""
        try:
            with Image.open(texture_path) as img:
                size = os.path.getsize(texture_path)
                width, height = img.size
                format_name = img.format
                
                texture_info = {
                    'path': texture_path,
                    'size': size,
                    'dimensions': (width, height),
                    'format': format_name,
                    'memory': self._calculate_memory_usage(width, height, format_name),
                    'compressed': self._is_compressed_format(format_name)
                }
                
                self.textures[texture_path] = texture_info
                self.memory_usage += texture_info['memory']
                
                # 更新统计信息
                self._update_stats(texture_info)
                
        except Exception as e:
            print(f"Error analyzing texture {texture_path}: {e}")
            
    def _calculate_memory_usage(self, width: int, height: int, format_name: str) -> int:
        """计算贴图内存占用"""
        bytes_per_pixel = 4  # 默认RGBA
        if format_name in ['L', 'P']:
            bytes_per_pixel = 1
        elif format_name in ['RGB']:
            bytes_per_pixel = 3
            
        return width * height * bytes_per_pixel
        
    def _is_compressed_format(self, format_name: str) -> bool:
        """检查是否为压缩格式"""
        return format_name.lower() in ['dds', 'pvr', 'ktx']
        
    def _update_stats(self, texture_info: dict):
        """更新统计信息"""
        width, height = texture_info['dimensions']
        max_dim = max(width, height)
        
        # 更新尺寸分类统计
        for category, size in self.SIZE_CATEGORIES.items():
            if max_dim <= size:
                self.stats[f'{category}_count'] += 1
                break
        else:
            self.stats['oversized_count'] += 1
            
        # 更新格���统计
        self.stats[f'format_{texture_info["format"].lower()}_count'] += 1
        
        # 更新压缩状态统计
        if texture_info['compressed']:
            self.stats['compressed_count'] += 1
        else:
            self.stats['uncompressed_count'] += 1
            
    def analyze_optimization_potential(self):
        """分析优化潜力"""
        for path, info in self.textures.items():
            width, height = info['dimensions']
            
            # 检查过大的贴图
            if max(width, height) > self.MAX_TEXTURE_SIZE:
                self.optimization_suggestions.append({
                    'texture': path,
                    'type': 'oversized',
                    'current_size': f"{width}x{height}",
                    'suggested_size': f"{self.MAX_TEXTURE_SIZE}x{self.MAX_TEXTURE_SIZE}",
                    'memory_save': info['memory'] - self._calculate_memory_usage(
                        self.MAX_TEXTURE_SIZE, 
                        self.MAX_TEXTURE_SIZE, 
                        info['format']
                    )
                })
                
            # 检查未压缩的贴图
            if not info['compressed'] and info['size'] > 1024 * 1024:  # 1MB
                self.optimization_suggestions.append({
                    'texture': path,
                    'type': 'uncompressed',
                    'current_size': self._format_size(info['size']),
                    'suggested_format': 'DDS/BC7',
                    'memory_save': info['memory'] * 0.75  # 估计压缩后可节省75%
                })
                
    def _format_size(self, size_in_bytes: int) -> str:
        """格式化文件大小"""
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size_in_bytes < 1024:
                return f"{size_in_bytes:.2f}{unit}"
            size_in_bytes /= 1024
        return f"{size_in_bytes:.2f}TB"
        
    def generate_report(self, output_path: str):
        """生成分析报告"""
        report = {
            'texture_stats': {
                'total_textures': len(self.textures),
                'total_memory': self._format_size(self.memory_usage),
                'size_distribution': {
                    category: self.stats[f'{category}_count']
                    for category in self.SIZE_CATEGORIES.keys()
                },
                'format_distribution': {
                    format_name: self.stats[f'format_{format_name.lower()}_count']
                    for format_name in ['PNG', 'JPG', 'DDS', 'TGA']
                },
                'compression_stats': {
                    'compressed': self.stats['compressed_count'],
                    'uncompressed': self.stats['uncompressed_count']
                }
            },
            'optimization_potential': {
                'total_suggestions': len(self.optimization_suggestions),
                'potential_memory_save': self._format_size(
                    sum(s['memory_save'] for s in self.optimization_suggestions)
                ),
                'suggestions': self.optimization_suggestions
            }
        }
        
        with open(output_path, 'w') as f:
            json.dump(report, f, indent=2)
            
        return report
        
    def visualize_stats(self, output_dir: str):
        """生成可视化统计图表"""
        os.makedirs(output_dir, exist_ok=True)
        
        # 尺寸分布图
        self._generate_size_distribution_plot(output_dir)
        
        # 格式分布图
        self._generate_format_distribution_plot(output_dir)
        
        # 内存使用分布图
        self._generate_memory_usage_plot(output_dir)
        
    def _generate_size_distribution_plot(self, output_dir: str):
        """生成尺寸分布图"""
        plt.figure(figsize=(10, 6))
        
        categories = list(self.SIZE_CATEGORIES.keys())
        counts = [self.stats[f'{cat}_count'] for cat in categories]
        
        plt.bar(categories, counts)
        plt.title('Texture Size Distribution')
        plt.xlabel('Size Category')
        plt.ylabel('Number of Textures')
        
        plt.savefig(os.path.join(output_dir, 'size_distribution.png'))
        plt.close()
        
    def _generate_format_distribution_plot(self, output_dir: str):
        """生成格式分布图"""
        plt.figure(figsize=(8, 8))
        
        formats = ['PNG', 'JPG', 'DDS', 'TGA']
        counts = [self.stats[f'format_{fmt.lower()}_count'] for fmt in formats]
        
        plt.pie(counts, labels=formats, autopct='%1.1f%%')
        plt.title('Texture Format Distribution')
        
        plt.savefig(os.path.join(output_dir, 'format_distribution.png'))
        plt.close()
        
    def _generate_memory_usage_plot(self, output_dir: str):
        """生成内存使用分布图"""
        plt.figure(figsize=(12, 6))
        
        memory_sizes = [info['memory'] / (1024 * 1024) for info in self.textures.values()]  # Convert to MB
        plt.hist(memory_sizes, bins=50)
        plt.title('Texture Memory Usage Distribution')
        plt.xlabel('Memory Usage (MB)')
        plt.ylabel('Number of Textures')
        
        plt.savefig(os.path.join(output_dir, 'memory_usage.png'))
        plt.close()
        
    def suggest_optimization_pipeline(self) -> List[str]:
        """生成优化流程建议"""
        pipeline = []
        
        # 检查是否需要批量压缩
        if self.stats['uncompressed_count'] > self.stats['compressed_count']:
            pipeline.append("1. 实现批量压缩流程，将未压缩贴图转换为DDS格式")
            
        # 检查是否需要尺寸标准化
        if self.stats['oversized_count'] > 0:
            pipeline.append(
                f"2. 建立贴图尺寸标准，将过大贴图限制在{self.MAX_TEXTURE_SIZE}x{self.MAX_TEXTURE_SIZE}"
            )
            
        # 检查格式统一性
        if len([k for k in self.stats.keys() if k.startswith('format_')]) > 3:
            pipeline.append("3. 统一贴图格式，优先使用DDS/BC7压缩格式")
            
        return pipeline

def main():
    """主函数"""
    analyzer = TextureAnalyzer()
    
    # 扫描贴图
    texture_path = "path/to/your/textures"
    analyzer.scan_textures(texture_path)
    
    # 分析优化潜力
    analyzer.analyze_optimization_potential()
    
    # 生成报告
    report = analyzer.generate_report("texture_analysis_report.json")
    
    # 生成可视化
    analyzer.visualize_stats("texture_stats")
    
    # 打印分析摘要
    print("\nTexture Analysis Summary:")
    print(f"Total Textures: {report['texture_stats']['total_textures']}")
    print(f"Total Memory Usage: {report['texture_stats']['total_memory']}")
    print(f"Potential Memory Save: {report['optimization_potential']['potential_memory_save']}")
    
    # 打印优化建议
    print("\nOptimization Pipeline:")
    for step in analyzer.suggest_optimization_pipeline():
        print(step)
        
    # 打印具体优化建议
    print("\nDetailed Optimization Suggestions:")
    for suggestion in report['optimization_potential']['suggestions'][:5]:  # 显示前5个建议
        print(f"\nTexture: {os.path.basename(suggestion['texture'])}")
        print(f"Type: {suggestion['type']}")
        if 'current_size' in suggestion:
            print(f"Current Size: {suggestion['current_size']}")
            print(f"Suggested Size: {suggestion['suggested_size']}")
        print(f"Potential Memory Save: {analyzer._format_size(suggestion['memory_save'])}")

if __name__ == "__main__":
    main() 