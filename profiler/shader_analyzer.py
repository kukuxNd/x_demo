"""
Shader Performance Analyzer Tool
------------------------------

这个工具用于分析和优化Shader性能，主要功能：

1. 分析功能:
   - Shader分支分析
   - 变体性能测试
   - 特性依赖分析
   - 编译开销评估

2. 优化目标:
   - 减少Shader分支
   - 优化变体管理
   - 自动特性开关
   - 提升渲染性能

3. 分析维度:
   - 分支复杂度
   - 编译时间
   - 运行时开销
   - 内存占用

4. 使用方法:
   python shader_analyzer.py [shader_folder_path]
"""

import os
import json
import re
import time
from collections import defaultdict
import matplotlib.pyplot as plt
import numpy as np
from typing import Dict, List, Set
import hashlib

class ShaderAnalyzer:
    def __init__(self):
        self.shaders = {}
        self.variants = defaultdict(list)
        self.features = set()
        self.dependencies = defaultdict(set)
        self.performance_data = {}
        
    def scan_shaders(self, shader_path: str):
        """扫描Shader文件"""
        print(f"Scanning shaders in: {shader_path}")
        
        for root, _, files in os.walk(shader_path):
            for file in files:
                if file.endswith(('.shader', '.frag', '.vert')):
                    self._analyze_shader(os.path.join(root, file))
                    
    def _analyze_shader(self, shader_path: str):
        """分析单个Shader文件"""
        try:
            with open(shader_path, 'r') as f:
                content = f.read()
                
            shader_info = {
                'path': shader_path,
                'name': os.path.basename(shader_path),
                'features': self._extract_features(content),
                'branches': self._analyze_branches(content),
                'complexity': self._calculate_complexity(content)
            }
            
            self.shaders[shader_path] = shader_info
            self.features.update(shader_info['features'])
            
        except Exception as e:
            print(f"Error analyzing shader {shader_path}: {e}")
            
    def _extract_features(self, content: str) -> Set[str]:
        """提取Shader特性标记"""
        features = set()
        # 查找 #pragma multi_compile 和 #define 定义
        for line in content.split('\n'):
            if '#pragma multi_compile' in line:
                features.update(re.findall(r'_(\w+)', line))
            elif '#define' in line:
                features.update(re.findall(r'#define\s+(\w+)', line))
        return features
        
    def _analyze_branches(self, content: str) -> Dict[str, int]:
        """分析条件分支"""
        branches = {
            'if': len(re.findall(r'\bif\b', content)),
            'else': len(re.findall(r'\belse\b', content)),
            'switch': len(re.findall(r'\bswitch\b', content)),
            'for': len(re.findall(r'\bfor\b', content))
        }
        return branches
        
    def _calculate_complexity(self, content: str) -> float:
        """计算Shader复杂度"""
        # 基于分支数量、特性数量等计算复杂度分数
        branch_count = sum(self._analyze_branches(content).values())
        feature_count = len(self._extract_features(content))
        loc = len(content.split('\n'))
        
        return (branch_count * 2 + feature_count * 1.5 + loc * 0.1)
        
    def analyze_variants(self):
        """分析Shader变体"""
        for shader_path, info in self.shaders.items():
            variants = self._generate_variant_combinations(info['features'])
            self.variants[shader_path] = variants
            
            # 分析变体间的依赖关系
            self._analyze_feature_dependencies(info['features'])
            
    def _generate_variant_combinations(self, features: Set[str]) -> List[Dict]:
        """生成特性组合的变体列表"""
        variants = []
        feature_list = list(features)
        
        # 生成所有可能的特性组合
        for i in range(2 ** len(feature_list)):
            variant = {
                'features': set(),
                'hash': ''
            }
            
            for j in range(len(feature_list)):
                if i & (1 << j):
                    variant['features'].add(feature_list[j])
                    
            variant['hash'] = self._calculate_variant_hash(variant['features'])
            variants.append(variant)
            
        return variants
        
    def _calculate_variant_hash(self, features: Set[str]) -> str:
        """计算变体哈希值"""
        feature_str = ','.join(sorted(features))
        return hashlib.md5(feature_str.encode()).hexdigest()[:8]
        
    def _analyze_feature_dependencies(self, features: Set[str]):
        """分析特性之间的依赖关系"""
        for feature in features:
            # 模拟特性依赖分析
            if feature.startswith('USE_'):
                base_feature = feature[4:]
                self.dependencies[base_feature].add(feature)
                
    def simulate_performance(self):
        """模拟Shader性能测试"""
        for shader_path, variants in self.variants.items():
            shader_perf = []
            
            for variant in variants:
                # 模拟编译和运行时开销
                compile_time = self._simulate_compile_time(len(variant['features']))
                runtime_cost = self._simulate_runtime_cost(variant['features'])
                
                shader_perf.append({
                    'variant_hash': variant['hash'],
                    'features': variant['features'],
                    'compile_time': compile_time,
                    'runtime_cost': runtime_cost
                })
                
            self.performance_data[shader_path] = shader_perf
            
    def _simulate_compile_time(self, feature_count: int) -> float:
        """模拟编译时间"""
        base_time = 0.1  # 基础编译时间
        return base_time * (1 + feature_count * 0.2) * (1 + np.random.random() * 0.1)
        
    def _simulate_runtime_cost(self, features: Set[str]) -> float:
        """模拟运行时开销"""
        base_cost = 0.05  # 基础运行时开销
        return base_cost * (1 + len(features) * 0.15) * (1 + np.random.random() * 0.1)
        
    def optimize_variants(self) -> Dict[str, List[str]]:
        """优化Shader变体"""
        optimizations = {}
        
        for shader_path, perf_data in self.performance_data.items():
            # 分析性能数据
            high_cost_variants = [v for v in perf_data 
                                if v['runtime_cost'] > 0.1]  # 设置阈值
            
            if high_cost_variants:
                optimizations[shader_path] = self._generate_optimization_plan(
                    high_cost_variants
                )
                
        return optimizations
        
    def _generate_optimization_plan(self, high_cost_variants: List[Dict]) -> List[str]:
        """生成优化建议"""
        recommendations = []
        
        # 分析高开销变体的共同特性
        common_features = set.intersection(
            *[v['features'] for v in high_cost_variants]
        )
        
        if common_features:
            recommendations.append(
                f"Consider pre-compiling variants with features: {', '.join(common_features)}"
            )
            
        # 建议移除不必要的特性
        all_features = set.union(*[v['features'] for v in high_cost_variants])
        if len(all_features) > 5:  # 特性数量阈值
            recommendations.append(
                "Too many features enabled. Consider reducing feature combinations."
            )
            
        return recommendations
        
    def generate_report(self, output_path: str):
        """生成分析报告"""
        report = {
            'shader_stats': {
                'total_shaders': len(self.shaders),
                'total_variants': sum(len(v) for v in self.variants.values()),
                'total_features': len(self.features)
            },
            'complexity_analysis': self._analyze_complexity_stats(),
            'performance_analysis': self._analyze_performance_stats(),
            'optimization_suggestions': self.optimize_variants()
        }
        
        with open(output_path, 'w') as f:
            json.dump(report, f, indent=2)
            
        return report
        
    def _analyze_complexity_stats(self) -> Dict:
        """分析复杂度统计"""
        complexities = [info['complexity'] for info in self.shaders.values()]
        return {
            'average_complexity': np.mean(complexities),
            'max_complexity': max(complexities),
            'high_complexity_shaders': [
                path for path, info in self.shaders.items()
                if info['complexity'] > np.mean(complexities) * 1.5
            ]
        }
        
    def _analyze_performance_stats(self) -> Dict:
        """分析性能统计"""
        compile_times = []
        runtime_costs = []
        
        for shader_perf in self.performance_data.values():
            for variant in shader_perf:
                compile_times.append(variant['compile_time'])
                runtime_costs.append(variant['runtime_cost'])
                
        return {
            'average_compile_time': np.mean(compile_times),
            'average_runtime_cost': np.mean(runtime_costs),
            'total_compile_time': sum(compile_times),
            'worst_variants': self._identify_worst_variants()
        }
        
    def _identify_worst_variants(self) -> List[Dict]:
        """识别最差变体"""
        worst_variants = []
        
        for shader_path, perf_data in self.performance_data.items():
            # 按运行时开销排序
            sorted_variants = sorted(
                perf_data, 
                key=lambda x: x['runtime_cost'], 
                reverse=True
            )
            
            if sorted_variants:
                worst_variants.append({
                    'shader': shader_path,
                    'variant_hash': sorted_variants[0]['variant_hash'],
                    'runtime_cost': sorted_variants[0]['runtime_cost'],
                    'features': list(sorted_variants[0]['features'])
                })
                
        return worst_variants[:5]  # 返回前5个最差变体
        
    def visualize_stats(self, output_dir: str):
        """生成可视化统计图表"""
        os.makedirs(output_dir, exist_ok=True)
        
        # 复杂度分布图
        self._generate_complexity_plot(output_dir)
        
        # 变体性能对比图
        self._generate_variant_performance_plot(output_dir)
        
        # 特性影响图
        self._generate_feature_impact_plot(output_dir)
        
    def _generate_complexity_plot(self, output_dir: str):
        """生成复杂度分布图"""
        plt.figure(figsize=(10, 6))
        
        complexities = [info['complexity'] for info in self.shaders.values()]
        plt.hist(complexities, bins=20)
        plt.title('Shader Complexity Distribution')
        plt.xlabel('Complexity Score')
        plt.ylabel('Number of Shaders')
        
        plt.savefig(os.path.join(output_dir, 'complexity_distribution.png'))
        plt.close()
        
    def _generate_variant_performance_plot(self, output_dir: str):
        """生成变体性能对比图"""
        plt.figure(figsize=(12, 6))
        
        compile_times = []
        runtime_costs = []
        
        for perf_data in self.performance_data.values():
            for variant in perf_data:
                compile_times.append(variant['compile_time'])
                runtime_costs.append(variant['runtime_cost'])
                
        plt.scatter(compile_times, runtime_costs, alpha=0.5)
        plt.title('Variant Performance Distribution')
        plt.xlabel('Compile Time (s)')
        plt.ylabel('Runtime Cost (ms)')
        
        plt.savefig(os.path.join(output_dir, 'variant_performance.png'))
        plt.close()
        
    def _generate_feature_impact_plot(self, output_dir: str):
        """生成特性影响图"""
        plt.figure(figsize=(12, 6))
        
        feature_impacts = defaultdict(list)
        for perf_data in self.performance_data.values():
            for variant in perf_data:
                for feature in variant['features']:
                    feature_impacts[feature].append(variant['runtime_cost'])
                    
        features = list(feature_impacts.keys())
        impacts = [np.mean(costs) for costs in feature_impacts.values()]
        
        plt.bar(range(len(features)), impacts)
        plt.xticks(range(len(features)), features, rotation=45)
        plt.title('Feature Performance Impact')
        plt.xlabel('Features')
        plt.ylabel('Average Runtime Cost (ms)')
        
        plt.tight_layout()
        plt.savefig(os.path.join(output_dir, 'feature_impact.png'))
        plt.close()

def main():
    """主函数"""
    analyzer = ShaderAnalyzer()
    
    # 扫描Shader文件
    shader_path = "path/to/your/shaders"
    analyzer.scan_shaders(shader_path)
    
    # 分析变体
    analyzer.analyze_variants()
    
    # 模拟性能测试
    analyzer.simulate_performance()
    
    # 生成报告
    report = analyzer.generate_report("shader_analysis_report.json")
    
    # 生成可视化
    analyzer.visualize_stats("shader_stats")
    
    # 打印分析摘要
    print("\nShader Analysis Summary:")
    print(f"Total Shaders: {report['shader_stats']['total_shaders']}")
    print(f"Total Variants: {report['shader_stats']['total_variants']}")
    print(f"Total Features: {report['shader_stats']['total_features']}")
    
    # 打印优化建议
    print("\nOptimization Suggestions:")
    for shader, suggestions in report['optimization_suggestions'].items():
        print(f"\nShader: {os.path.basename(shader)}")
        for suggestion in suggestions:
            print(f"- {suggestion}")

if __name__ == "__main__":
    main() 