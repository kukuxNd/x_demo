"""
Performance Analyzer Tool
------------------------

这个工具用于分析和模拟性能瓶颈，主要功能：

1. 分析功能:
   - CPU性能分析
   - 线程负载分析
   - 耗时操作定位
   - 内存使用分析

2. 优化目标:
   - 识别性能瓶颈
   - 多线程优化建议
   - 资源使用优化
   - 性能提升评估

3. 分析维度:
   - 函数调用耗时
   - 线程负载分布
   - 内存使用情况
   - CPU利用率

4. 使用方法:
   python performance_analyzer.py [profile_data_path]
"""

import time
import threading
import queue
import psutil
import json
import matplotlib.pyplot as plt
import numpy as np
from collections import defaultdict
import os
from typing import Dict, List, Tuple
import cProfile
import pstats
from concurrent.futures import ThreadPoolExecutor

class PerformanceAnalyzer:
    def __init__(self):
        self.profile_data = defaultdict(list)
        self.thread_stats = defaultdict(dict)
        self.cpu_usage = []
        self.memory_usage = []
        self.optimization_results = {}
        
    def start_monitoring(self, duration: int = 60):
        """开始性能监控"""
        self.monitoring = True
        self.monitor_thread = threading.Thread(target=self._monitor_system, args=(duration,))
        self.monitor_thread.start()
        
    def _monitor_system(self, duration: int):
        """系统资源监控"""
        start_time = time.time()
        while self.monitoring and time.time() - start_time < duration:
            # CPU使用率
            self.cpu_usage.append(psutil.cpu_percent(interval=1))
            
            # 内存使用
            mem = psutil.Process().memory_info()
            self.memory_usage.append(mem.rss / 1024 / 1024)  # MB
            
            time.sleep(1)
            
    def simulate_workload(self):
        """模拟工作负载"""
        # 模拟遮挡计算等耗时操作
        self.profile_data['occlusion_calc'] = self._profile_function(
            self._simulate_occlusion_calculation
        )
        
        # 模拟渲染管线
        self.profile_data['render_pipeline'] = self._profile_function(
            self._simulate_render_pipeline
        )
        
        # 模拟物理计算
        self.profile_data['physics_calc'] = self._profile_function(
            self._simulate_physics_calculation
        )
        
    def _profile_function(self, func) -> dict:
        """性能分析特定函数"""
        profiler = cProfile.Profile()
        profiler.enable()
        
        start_time = time.time()
        func()
        execution_time = time.time() - start_time
        
        profiler.disable()
        stats = pstats.Stats(profiler)
        
        return {
            'execution_time': execution_time,
            'calls': stats.total_calls,
            'cpu_time': stats.total_tt
        }
        
    def _simulate_occlusion_calculation(self):
        """模拟遮挡计算"""
        time.sleep(0.1)  # 模拟计算开销
        
    def _simulate_render_pipeline(self):
        """模拟渲染管线"""
        time.sleep(0.05)  # 模拟渲染开销
        
    def _simulate_physics_calculation(self):
        """模拟物理计算"""
        time.sleep(0.03)  # 模拟物理计算开销
        
    def optimize_workload(self):
        """优化工作负载"""
        # 创建线程池
        with ThreadPoolExecutor(max_workers=4) as executor:
            # 将遮挡计算移至独立线程
            future_occlusion = executor.submit(self._simulate_occlusion_calculation)
            
            # 主线程继续处理其他任务
            self._simulate_render_pipeline()
            self._simulate_physics_calculation()
            
            # 等待遮挡计算完成
            future_occlusion.result()
            
        # 记录优化后的性能数据
        self.optimization_results = {
            'before': self.profile_data,
            'after': {
                'execution_time': time.time(),
                'thread_count': 4,
                'cpu_usage': np.mean(self.cpu_usage)
            }
        }
        
    def analyze_bottlenecks(self) -> List[dict]:
        """分析性能瓶颈"""
        bottlenecks = []
        
        # 分析CPU密集操作
        for func_name, stats in self.profile_data.items():
            if stats['execution_time'] > 0.05:  # 设置阈值
                bottlenecks.append({
                    'type': 'cpu_intensive',
                    'function': func_name,
                    'execution_time': stats['execution_time'],
                    'recommendation': '考虑移至独立线程处理'
                })
                
        # 分析内存使用
        if self.memory_usage:
            avg_memory = np.mean(self.memory_usage)
            if avg_memory > 1000:  # 1GB阈值
                bottlenecks.append({
                    'type': 'memory_usage',
                    'average_usage': avg_memory,
                    'recommendation': '检查内存泄漏或优化内存使用'
                })
                
        return bottlenecks
        
    def generate_report(self, output_path: str):
        """生成性能分析报告"""
        report = {
            'performance_stats': {
                'cpu_usage': {
                    'average': np.mean(self.cpu_usage),
                    'max': max(self.cpu_usage)
                },
                'memory_usage': {
                    'average': np.mean(self.memory_usage),
                    'max': max(self.memory_usage)
                }
            },
            'bottlenecks': self.analyze_bottlenecks(),
            'optimization_results': {
                'cpu_reduction': self._calculate_optimization_impact(),
                'thread_utilization': self._analyze_thread_utilization()
            },
            'recommendations': self._generate_recommendations()
        }
        
        with open(output_path, 'w') as f:
            json.dump(report, f, indent=2)
            
        return report
        
    def _calculate_optimization_impact(self) -> float:
        """计算优化效果"""
        if not self.optimization_results:
            return 0.0
            
        before = self.profile_data['occlusion_calc']['execution_time']
        after = self.optimization_results['after']['execution_time']
        
        return ((before - after) / before) * 100
        
    def _analyze_thread_utilization(self) -> dict:
        """分析线程利用率"""
        return {
            'thread_count': self.optimization_results.get('after', {}).get('thread_count', 1),
            'efficiency': 'high' if self._calculate_optimization_impact() > 20 else 'medium'
        }
        
    def _generate_recommendations(self) -> List[dict]:
        """生成优化建议"""
        recommendations = []
        
        # 分析CPU使用情况
        if np.mean(self.cpu_usage) > 70:
            recommendations.append({
                'type': 'cpu_usage',
                'message': '考虑进一步的多线程优化',
                'priority': 'high'
            })
            
        # 分析内存使用
        if np.mean(self.memory_usage) > 800:
            recommendations.append({
                'type': 'memory_usage',
                'message': '建议进行内存优化',
                'priority': 'medium'
            })
            
        return recommendations
        
    def visualize_stats(self, output_dir: str):
        """生成可视化统计图表"""
        os.makedirs(output_dir, exist_ok=True)
        
        # CPU使用率趋势图
        self._generate_cpu_usage_plot(output_dir)
        
        # 内存使用趋势图
        self._generate_memory_usage_plot(output_dir)
        
        # 优化效果对比图
        self._generate_optimization_comparison_plot(output_dir)
        
    def _generate_cpu_usage_plot(self, output_dir: str):
        """生成CPU使用率图表"""
        plt.figure(figsize=(10, 6))
        plt.plot(self.cpu_usage)
        plt.title('CPU Usage Over Time')
        plt.xlabel('Time (s)')
        plt.ylabel('CPU Usage (%)')
        plt.savefig(os.path.join(output_dir, 'cpu_usage.png'))
        plt.close()
        
    def _generate_memory_usage_plot(self, output_dir: str):
        """生成内存使用图表"""
        plt.figure(figsize=(10, 6))
        plt.plot(self.memory_usage)
        plt.title('Memory Usage Over Time')
        plt.xlabel('Time (s)')
        plt.ylabel('Memory Usage (MB)')
        plt.savefig(os.path.join(output_dir, 'memory_usage.png'))
        plt.close()
        
    def _generate_optimization_comparison_plot(self, output_dir: str):
        """生成优化效果对比图"""
        plt.figure(figsize=(8, 6))
        
        if self.optimization_results:
            labels = ['Before', 'After']
            times = [
                self.profile_data['occlusion_calc']['execution_time'],
                self.optimization_results['after']['execution_time']
            ]
            
            plt.bar(labels, times)
            plt.title('Performance Optimization Comparison')
            plt.ylabel('Execution Time (s)')
            
            for i, v in enumerate(times):
                plt.text(i, v, f'{v:.3f}s', ha='center')
                
        plt.savefig(os.path.join(output_dir, 'optimization_comparison.png'))
        plt.close()

def main():
    """主函数"""
    analyzer = PerformanceAnalyzer()
    
    # 开始监控
    analyzer.start_monitoring(duration=30)
    
    # 模拟工作负载
    print("Simulating workload...")
    analyzer.simulate_workload()
    
    # 执行优化
    print("Optimizing workload...")
    analyzer.optimize_workload()
    
    # 生成报告
    report = analyzer.generate_report("performance_analysis_report.json")
    
    # 生成可视化
    analyzer.visualize_stats("performance_stats")
    
    # 打印优化结果
    print("\nPerformance Analysis Results:")
    print(f"CPU Usage Reduction: {analyzer._calculate_optimization_impact():.1f}%")
    print("\nBottlenecks Found:")
    for bottleneck in report['bottlenecks']:
        print(f"- {bottleneck['type']}: {bottleneck['recommendation']}")
        
    print("\nOptimization Recommendations:")
    for rec in report['recommendations']:
        print(f"- [{rec['priority']}] {rec['message']}")

if __name__ == "__main__":
    main() 