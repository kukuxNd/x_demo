#include "demo_utils.hpp"
#include <ctime>
#include <regex>

namespace demo {

// Person 实现
Person::Person(const std::string& name, int age) 
    : name_(name), age_(age) {}

std::string Person::toString() const {
    return "Person[name=" + name_ + ", age=" + std::to_string(age_) + "]";
}

// Student 实现
Student::Student(const std::string& name, int age, const std::string& studentId)
    : Person(name, age), studentId_(studentId) {}

std::string Student::toString() const {
    return "Student[name=" + getName() + 
           ", age=" + std::to_string(getAge()) + 
           ", studentId=" + studentId_ + "]";
}

// Container 模板类实现
template<typename T>
void Container<T>::add(const T& item) {
    items_.push_back(item);
}

template<typename T>
bool Container<T>::remove(const T& item) {
    auto it = std::find(items_.begin(), items_.end(), item);
    if (it != items_.end()) {
        items_.erase(it);
        return true;
    }
    return false;
}

template<typename T>
bool Container<T>::contains(const T& item) const {
    return std::find(items_.begin(), items_.end(), item) != items_.end();
}

template<typename T>
std::vector<T> Container<T>::getItems() const {
    return items_;
}

// StringUtils 实现
std::string StringUtils::reverse(const std::string& str) {
    return std::string(str.rbegin(), str.rend());
}

std::vector<std::string> StringUtils::split(const std::string& str, char delimiter) {
    std::vector<std::string> tokens;
    std::stringstream ss(str);
    std::string token;
    while (std::getline(ss, token, delimiter)) {
        tokens.push_back(token);
    }
    return tokens;
}

std::string StringUtils::join(const std::vector<std::string>& parts, 
                            const std::string& delimiter) {
    std::string result;
    for (size_t i = 0; i < parts.size(); ++i) {
        if (i > 0) result += delimiter;
        result += parts[i];
    }
    return result;
}

std::string StringUtils::trim(const std::string& str) {
    auto start = str.find_first_not_of(" \t\n\r");
    if (start == std::string::npos) return "";
    
    auto end = str.find_last_not_of(" \t\n\r");
    return str.substr(start, end - start + 1);
}

// FileUtils 实现
bool FileUtils::writeText(const std::string& filename, const std::string& content) {
    std::ofstream file(filename);
    if (!file) return false;
    file << content;
    return true;
}

std::string FileUtils::readText(const std::string& filename) {
    std::ifstream file(filename);
    if (!file) throw DemoException("Cannot open file: " + filename);
    
    std::stringstream buffer;
    buffer << file.rdbuf();
    return buffer.str();
}

bool FileUtils::exists(const std::string& filename) {
    std::ifstream file(filename);
    return file.good();
}

// TimeUtils 实现
std::string TimeUtils::getCurrentTime() {
    auto now = std::chrono::system_clock::now();
    auto time = std::chrono::system_clock::to_time_t(now);
    std::string result = std::ctime(&time);
    return result.substr(0, result.length() - 1); // 移除末尾换行符
}

double TimeUtils::measureExecutionTime(const std::function<void()>& func) {
    auto start = std::chrono::high_resolution_clock::now();
    func();
    auto end = std::chrono::high_resolution_clock::now();
    
    std::chrono::duration<double> diff = end - start;
    return diff.count();
}

// MathUtils 实现
int MathUtils::gcd(int a, int b) {
    while (b != 0) {
        int temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}

int MathUtils::lcm(int a, int b) {
    return (a / gcd(a, b)) * b;
}

bool MathUtils::isPrime(int n) {
    if (n <= 1) return false;
    for (int i = 2; i * i <= n; ++i) {
        if (n % i == 0) return false;
    }
    return true;
}

long long MathUtils::factorial(int n) {
    if (n < 0) throw DemoException("Factorial of negative number");
    if (n == 0) return 1;
    return n * factorial(n - 1);
}

// DemoException 实现
DemoException::DemoException(const std::string& message)
    : std::runtime_error(message) {}

// 使用示例
void runExamples() {
    try {
        // Person类示例
        Person person("张三", 25);
        std::cout << person.toString() << std::endl;
        
        // Student类示例
        Student student("李四", 20, "2023001");
        std::cout << student.toString() << std::endl;
        
        // Container示例
        Container<int> numbers;
        numbers.add(1);
        numbers.add(2);
        numbers.add(3);
        
        // StringUtils示例
        std::string text = "Hello, World!";
        std::cout << "反转: " << StringUtils::reverse(text) << std::endl;
        
        // FileUtils示例
        FileUtils::writeText("test.txt", "测试内容");
        std::cout << "文件内容: " << FileUtils::readText("test.txt") << std::endl;
        
        // TimeUtils示例
        std::cout << "当前时间: " << TimeUtils::getCurrentTime() << std::endl;
        
        // MathUtils示例
        std::cout << "GCD(12,18): " << MathUtils::gcd(12, 18) << std::endl;
        std::cout << "是否质数(17): " << MathUtils::isPrime(17) << std::endl;
        
    } catch (const DemoException& e) {
        std::cerr << "错误: " << e.what() << std::endl;
    }
}

} // namespace demo

int main() {
    demo::runExamples();
    return 0;
} 