#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import sys
import json
import time
import datetime
import random
import logging
from typing import List, Dict, Tuple, Optional

# 基础数据类型示例
def basic_types_demo():
    # 数值类型
    integer = 42
    float_num = 3.14
    complex_num = 1 + 2j
    
    # 字符串
    string = "你好，Python"
    multi_line = """
    这是多行
    字符串示例
    """
    
    # 列表
    list_demo = [1, 2, 3, "混合类型", True]
    
    # 元组（不可变列表）
    tuple_demo = (1, 2, 3)
    
    # 字典
    dict_demo = {
        "name": "张三",
        "age": 25,
        "skills": ["Python", "Java"]
    }
    
    # 集合
    set_demo = {1, 2, 3, 3}  # 重复元素会被去除
    
    # 布尔值
    bool_demo = True
    
    # None类型
    none_demo = None

# 字符串操作示例
def string_operations():
    text = "Hello, Python!"
    
    # 字符串方法
    print(text.upper())          # 转大写
    print(text.lower())          # 转小写
    print(text.split(","))       # 分割字符串
    print(text.strip())          # 去除首尾空格
    print(text.replace("o", "0")) # 替换字符
    print(len(text))             # 字符串长度
    
    # 字符串格式化
    name = "世界"
    # f-string (推荐)
    print(f"你好，{name}！")
    # format方法
    print("你好，{}！".format(name))
    # %-formatting
    print("你好，%s！" % name)

# 列表操作示例
def list_operations():
    numbers = [1, 2, 3, 4, 5]
    
    # 基本操作
    numbers.append(6)        # 添加元素
    numbers.insert(0, 0)     # 插入元素
    numbers.remove(3)        # 删除元素
    popped = numbers.pop()   # 弹出最后一个元素
    numbers.extend([7, 8])   # 扩展列表
    
    # 列表推导式
    squares = [x**2 for x in range(10)]
    even_numbers = [x for x in range(10) if x % 2 == 0]
    
    # 切片操作
    print(numbers[1:4])      # 切片
    print(numbers[::-1])     # 反转
    
    # 排序
    numbers.sort()           # 原地排序
    sorted_nums = sorted(numbers, reverse=True)  # 返回新列表

# 字典操作示例
def dict_operations():
    person = {
        "name": "李四",
        "age": 30,
        "city": "北京"
    }
    
    # 基本操作
    person["job"] = "程序员"     # 添加/更新键值对
    del person["age"]            # 删除键值对
    
    # 字典方法
    print(person.keys())         # 所有键
    print(person.values())       # 所有值
    print(person.items())        # 所有键值对
    
    # 字典推导式
    square_dict = {x: x**2 for x in range(5)}
    
    # 安全获取值
    age = person.get("age", 0)   # 获取值，不存在返回默认值

# 文件操作示例
def file_operations():
    # 写文件
    with open("test.txt", "w", encoding="utf-8") as f:
        f.write("你好，Python！\n")
        f.writelines(["第一行\n", "第二行\n"])
    
    # 读文件
    with open("test.txt", "r", encoding="utf-8") as f:
        content = f.read()           # 读取全部内容
        # f.seek(0)                  # 重置文件指针
        # lines = f.readlines()      # 读取所有行
        # line = f.readline()        # 读取一行
    
    # JSON操作
    data = {"name": "王五", "age": 28}
    with open("data.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    with open("data.json", "r", encoding="utf-8") as f:
        loaded_data = json.load(f)

# 异常处理示例
def error_handling():
    try:
        result = 10 / 0
    except ZeroDivisionError as e:
        print(f"发生错误：{e}")
    except Exception as e:
        print(f"发生未知错误：{e}")
    else:
        print("没有发生错误")
    finally:
        print("清理工作")

# 类定义示例
class Person:
    def __init__(self, name: str, age: int):
        self.name = name
        self.age = age
    
    def greet(self) -> str:
        return f"你好，我是{self.name}，今年{self.age}岁"
    
    @property
    def is_adult(self) -> bool:
        return self.age >= 18
    
    @classmethod
    def create_child(cls, name: str) -> 'Person':
        return cls(name, 0)
    
    @staticmethod
    def is_valid_age(age: int) -> bool:
        return 0 <= age <= 150

# 装饰器示例
def timer_decorator(func):
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        print(f"函数 {func.__name__} 执行时间：{end_time - start_time:.2f}秒")
        return result
    return wrapper

@timer_decorator
def slow_function():
    time.sleep(1)
    return "完成"

# 生成器示例
def fibonacci(n: int):
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b

# 上下文管理器示例
class Timer:
    def __enter__(self):
        self.start = time.time()
        return self
    
    def __exit__(self, *args):
        self.end = time.time()
        self.duration = self.end - self.start

# 日志配置示例
def setup_logging():
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler('app.log'),
            logging.StreamHandler()
        ]
    )

def main():
    # 设置日志
    setup_logging()
    logger = logging.getLogger(__name__)
    
    # 演示基础类型
    basic_types_demo()
    
    # 演示字符串操作
    string_operations()
    
    # 演示列表操作
    list_operations()
    
    # 演示字典操作
    dict_operations()
    
    # 演示文件操作
    file_operations()
    
    # 演示异常处理
    error_handling()
    
    # 演示类的使用
    person = Person("赵六", 20)
    print(person.greet())
    print(f"是否成年：{person.is_adult}")
    
    # 演示装饰器
    slow_function()
    
    # 演示生成器
    for num in fibonacci(10):
        print(num, end=" ")
    print()
    
    # 演示上下文管理器
    with Timer() as timer:
        time.sleep(1)
    print(f"代码块执行时间：{timer.duration:.2f}秒")
    
    # 记录日志
    logger.info("程序执行完成")

if __name__ == "__main__":
    main() 