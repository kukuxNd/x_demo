#ifndef DEMO_UTILS_HPP
#define DEMO_UTILS_HPP

#include <iostream>
#include <string>
#include <vector>
#include <map>
#include <memory>
#include <chrono>
#include <functional>
#include <algorithm>
#include <stdexcept>
#include <fstream>
#include <sstream>

namespace demo {

// 智能指针类型别名
template<typename T>
using UniquePtr = std::unique_ptr<T>;
template<typename T>
using SharedPtr = std::shared_ptr<T>;

// 基础类
class Person {
public:
    Person(const std::string& name, int age);
    virtual ~Person() = default;
    
    // Getter/Setter
    std::string getName() const { return name_; }
    int getAge() const { return age_; }
    void setName(const std::string& name) { name_ = name; }
    void setAge(int age) { age_ = age; }
    
    // 虚函数示例
    virtual std::string toString() const;

private:
    std::string name_;
    int age_;
};

// 继承示例
class Student : public Person {
public:
    Student(const std::string& name, int age, const std::string& studentId);
    
    std::string getStudentId() const { return studentId_; }
    std::string toString() const override;

private:
    std::string studentId_;
};

// 模板类示例
template<typename T>
class Container {
public:
    void add(const T& item);
    bool remove(const T& item);
    bool contains(const T& item) const;
    std::vector<T> getItems() const;

private:
    std::vector<T> items_;
};

// 字符串工具类
class StringUtils {
public:
    static std::string reverse(const std::string& str);
    static std::vector<std::string> split(const std::string& str, char delimiter);
    static std::string join(const std::vector<std::string>& parts, const std::string& delimiter);
    static std::string trim(const std::string& str);
};

// 文件操作类
class FileUtils {
public:
    static bool writeText(const std::string& filename, const std::string& content);
    static std::string readText(const std::string& filename);
    static bool appendText(const std::string& filename, const std::string& content);
    static bool exists(const std::string& filename);
};

// 时间工具类
class TimeUtils {
public:
    static std::string getCurrentTime();
    static double measureExecutionTime(const std::function<void()>& func);
};

// 数学工具类
class MathUtils {
public:
    static int gcd(int a, int b);
    static int lcm(int a, int b);
    static bool isPrime(int n);
    static long long factorial(int n);
    
    template<typename T>
    static T min(const std::vector<T>& values) {
        if (values.empty()) throw std::runtime_error("Empty vector");
        return *std::min_element(values.begin(), values.end());
    }
    
    template<typename T>
    static T max(const std::vector<T>& values) {
        if (values.empty()) throw std::runtime_error("Empty vector");
        return *std::max_element(values.begin(), values.end());
    }
};

// 异常类
class DemoException : public std::runtime_error {
public:
    explicit DemoException(const std::string& message);
};

} // namespace demo

#endif // DEMO_UTILS_HPP 