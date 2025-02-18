"""
Performance Profiler Manager
--------------------------

这个工具用于统一管理和调用所有性能分析工具，主要功能：

1. 功能整合:
   - 材质分析
   - 贴图分析
   - Shader分析
   - 实例化分析
   - 遮挡分析
   - 网格分析
   - 性能分析

2. 分析流程:
   - 自动扫描项目
   - 批量分析处理
   - 生成综合报告
   - 可视化展示

3. 优化建议:
   - 智能优化建议
   - 自动化处理
   - 性能评估
   - 优化验证

4. 使用方法:
   python profiler_manager.py [project_path]
"""

import os
import json
import time
from typing import Dict, List
import matplotlib.pyplot as plt
from concurrent.futures import ThreadPoolExecutor

# 导入所有分析器
from material_analyzer import MaterialAnalyzer
from texture_analyzer import TextureAnalyzer
from shader_analyzer import ShaderAnalyzer
from instance_analyzer import InstanceAnalyzer
from occlusion_analyzer import OcclusionAnalyzer
from mesh_analyzer import MeshAnalyzer
from performance_analyzer import PerformanceAnalyzer

class ProfilerManager:
    def __init__(self):
        self.analyzers = {}
        self.reports = {}
        self.optimization_suggestions = []
        self.project_path = ""
        
    def initialize_analyzers(self):
        """初始化所有分析器"""
        self.analyzers = {
            'material': MaterialAnalyzer(),
            'texture': TextureAnalyzer(),
            'shader': ShaderAnalyzer(),
            'instance': InstanceAnalyzer(),
            'occlusion': OcclusionAnalyzer(),
            'mesh': MeshAnalyzer(),
            'performance': PerformanceAnalyzer()
        }
        
    def analyze_project(self, project_path: str):
        """分析整个项目"""
        self.project_path = project_path
        print(f"Starting project analysis: {project_path}")
        
        # 初始化分析器
        self.initialize_analyzers()
        
        # 并行执行分析
        with ThreadPoolExecutor() as executor:
            futures = {
                name: executor.submit(self._run_analyzer, name, analyzer)
                for name, analyzer in self.analyzers.items()
            }
            
            # 收集结果
            for name, future in futures.items():
                try:
                    self.reports[name] = future.result()
                except Exception as e:
                    print(f"Error in {name} analyzer: {e}")
                    
    def _run_analyzer(self, name: str, analyzer) -> dict:
        """运行单个分析器"""
        print(f"Running {name} analyzer...")
        
        # 设置分析路径
        analysis_path = os.path.join(self.project_path, name)
        if not os.path.exists(analysis_path):
            analysis_path = self.project_path
            
        # 执行分析
        if name == 'material':
            analyzer.scan_scene(analysis_path)
            analyzer.analyze_materials()
        elif name == 'texture':
            analyzer.scan_textures(analysis_path)
            analyzer.analyze_optimization_potential()
        elif name == 'shader':
            analyzer.scan_shaders(analysis_path)
            analyzer.analyze_variants()
        elif name == 'instance':
            analyzer.scan_scene(analysis_path)
            analyzer.analyze_instance_potential()
        elif name == 'occlusion':
            analyzer.scan_scene(analysis_path)
            analyzer.analyze_occlusion([])  # 需要提供相机位置
        elif name == 'mesh':
            analyzer.scan_models(analysis_path)
            analyzer.analyze_optimization_potential()
        elif name == 'performance':
            analyzer.simulate_workload()
            analyzer.optimize_workload()
            
        # 生成报告
        return analyzer.generate_report(f"{name}_analysis_report.json")
        
    def generate_comprehensive_report(self, output_path: str):
        """生成综合分析报告"""
        comprehensive_report = {
            'project_summary': {
                'path': self.project_path,
                'analysis_time': time.strftime('%Y-%m-%d %H:%M:%S'),
                'analyzers_run': list(self.reports.keys())
            },
            'performance_issues': self._collect_performance_issues(),
            'optimization_suggestions': self._generate_optimization_suggestions(),
            'resource_stats': self._collect_resource_stats(),
            'optimization_potential': self._calculate_optimization_potential()
        }
        
        with open(output_path, 'w') as f:
            json.dump(comprehensive_report, f, indent=2)
            
        return comprehensive_report
        
    def _collect_performance_issues(self) -> List[Dict]:
        """收集所有性能问题"""
        issues = []
        
        # 收集各个分析器的问题
        if 'material' in self.reports:
            issues.extend(self._get_material_issues())
        if 'shader' in self.reports:
            issues.extend(self._get_shader_issues())
        if 'texture' in self.reports:
            issues.extend(self._get_texture_issues())
            
        return issues
        
    def _generate_optimization_suggestions(self) -> List[Dict]:
        """生成优化建议"""
        suggestions = []
        
        # 材质优化建议
        if 'material' in self.reports:
            suggestions.append({
                'category': 'Material',
                'suggestions': self._get_material_suggestions()
            })
            
        # Shader优化建议
        if 'shader' in self.reports:
            suggestions.append({
                'category': 'Shader',
                'suggestions': self._get_shader_suggestions()
            })
            
        # 贴图优化建议
        if 'texture' in self.reports:
            suggestions.append({
                'category': 'Texture',
                'suggestions': self._get_texture_suggestions()
            })
            
        return suggestions
        
    def _collect_resource_stats(self) -> Dict:
        """收集资源统计信息"""
        stats = {
            'materials': self._get_material_stats(),
            'textures': self._get_texture_stats(),
            'shaders': self._get_shader_stats(),
            'meshes': self._get_mesh_stats()
        }
        return stats
        
    def _calculate_optimization_potential(self) -> Dict:
        """计算优化潜力"""
        potential = {
            'memory_save': self._calculate_memory_optimization(),
            'performance_improvement': self._calculate_performance_improvement(),
            'load_time_reduction': self._calculate_load_time_reduction()
        }
        return potential
        
    def visualize_results(self, output_dir: str):
        """生成可视化结果"""
        os.makedirs(output_dir, exist_ok=True)
        
        # 生成综合性能图表
        self._generate_performance_overview(output_dir)
        
        # 生成资源使用图表
        self._generate_resource_usage_charts(output_dir)
        
        # 生成优化潜力图表
        self._generate_optimization_potential_charts(output_dir)
        
    def _generate_performance_overview(self, output_dir: str):
        """生成性能概览图"""
        plt.figure(figsize=(12, 6))
        
        # 收集各个方面的性能得分
        categories = ['Material', 'Shader', 'Texture', 'Mesh', 'Instance']
        scores = self._calculate_performance_scores()
        
        plt.bar(categories, scores)
        plt.title('Performance Analysis Overview')
        plt.ylabel('Performance Score')
        plt.xticks(rotation=45)
        
        plt.tight_layout()
        plt.savefig(os.path.join(output_dir, 'performance_overview.png'))
        plt.close()
        
    def _generate_resource_usage_charts(self, output_dir: str):
        """生成资源使用图表"""
        plt.figure(figsize=(10, 10))
        
        # 收集资源使用数据
        resources = ['Memory', 'CPU', 'GPU', 'Loading']
        usage = self._calculate_resource_usage()
        
        plt.pie(usage, labels=resources, autopct='%1.1f%%')
        plt.title('Resource Usage Distribution')
        
        plt.savefig(os.path.join(output_dir, 'resource_usage.png'))
        plt.close()
        
    def _generate_optimization_potential_charts(self, output_dir: str):
        """生成优化潜力图表"""
        plt.figure(figsize=(12, 6))
        
        categories = ['Memory', 'Performance', 'Loading Time']
        potential = [
            self._calculate_memory_optimization(),
            self._calculate_performance_improvement(),
            self._calculate_load_time_reduction()
        ]
        
        plt.bar(categories, potential)
        plt.title('Optimization Potential')
        plt.ylabel('Improvement Potential (%)')
        
        plt.savefig(os.path.join(output_dir, 'optimization_potential.png'))
        plt.close()
        
    def export_optimization_tasks(self, output_path: str):
        """导出优化任务列表"""
        tasks = {
            'high_priority': self._get_high_priority_tasks(),
            'medium_priority': self._get_medium_priority_tasks(),
            'low_priority': self._get_low_priority_tasks()
        }
        
        with open(output_path, 'w') as f:
            json.dump(tasks, f, indent=2)
            
        return tasks

def main():
    """主函数"""
    profiler = ProfilerManager()
    
    # 分析项目
    project_path = "path/to/your/project"
    profiler.analyze_project(project_path)
    
    # 生成综合报告
    report = profiler.generate_comprehensive_report("comprehensive_analysis_report.json")
    
    # 生成可视化
    profiler.visualize_results("analysis_results")
    
    # 导出优化任务
    tasks = profiler.export_optimization_tasks("optimization_tasks.json")
    
    # 打印摘要
    print("\nAnalysis Summary:")
    print(f"Project Path: {report['project_summary']['path']}")
    print(f"Analysis Time: {report['project_summary']['analysis_time']}")
    print(f"Analyzers Run: {', '.join(report['project_summary']['analyzers_run'])}")
    
    print("\nOptimization Potential:")
    potential = report['optimization_potential']
    print(f"Memory Save: {potential['memory_save']}%")
    print(f"Performance Improvement: {potential['performance_improvement']}%")
    print(f"Load Time Reduction: {potential['load_time_reduction']}%")
    
    print("\nHigh Priority Tasks:")
    for task in tasks['high_priority']:
        print(f"- {task['description']}")

if __name__ == "__main__":
    main() 