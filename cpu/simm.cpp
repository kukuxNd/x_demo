#include <immintrin.h>
#include <iostream>
#include <chrono>

// 对齐分配
float* aligned_alloc_float(size_t size) {
    void* ptr = _mm_malloc(size * sizeof(float), 32);
    return static_cast<float*>(ptr);
}

void aligned_free(void* ptr) {
    _mm_free(ptr);
}

// 普通加法
void vector_add_normal(float* a, float* b, float* c, int n) {
    for (int i = 0; i < n; i++) {
        c[i] = a[i] + b[i];
    }
}

// AVX加法
void vector_add_avx(float* a, float* b, float* c, int n) {
    for (int i = 0; i < n; i += 8) {
        __m256 va = _mm256_load_ps(&a[i]);
        __m256 vb = _mm256_load_ps(&b[i]);
        __m256 vc = _mm256_add_ps(va, vb);
        _mm256_store_ps(&c[i], vc);
    }
}

// 性能测试函数
template<typename Func>
double measure_time(Func f, float* a, float* b, float* c, int n, int iterations) {
    auto start = std::chrono::high_resolution_clock::now();

    for (int i = 0; i < iterations; i++) {
        f(a, b, c, n);
    }

    auto end = std::chrono::high_resolution_clock::now();
    std::chrono::duration<double, std::milli> duration = end - start;
    return duration.count() / iterations;
}

int main() {
    // 使用更大的数据集来测试
    const int size = 1024 * 1024;  // 1M个float
    const int iterations = 1000;    // 重复1000次取平均

    // 分配对齐的内存
    float* a = aligned_alloc_float(size);
    float* b = aligned_alloc_float(size);
    float* c = aligned_alloc_float(size);

    // 初始化数据
    for (int i = 0; i < size; i++) {
        a[i] = i % 100;  // 避免数据太大
        b[i] = (i * 2) % 100;
    }

    // 测试普通加法
    double normal_time = measure_time(vector_add_normal, a, b, c, size, iterations);
    std::cout << "普通加法平均耗时: " << normal_time << " ms\n";

    // 测试AVX加法
    double avx_time = measure_time(vector_add_avx, a, b, c, size, iterations);
    std::cout << "AVX加法平均耗时: " << avx_time << " ms\n";

    // 计算加速比
    std::cout << "加速比: " << normal_time / avx_time << "x\n";

    // 验证结果正确性
    bool correct = true;
    vector_add_normal(a, b, c, size);
    float* c_verify = aligned_alloc_float(size);
    vector_add_avx(a, b, c_verify, size);

    for (int i = 0; i < size; i++) {
        if (std::abs(c[i] - c_verify[i]) > 1e-5) {
            correct = false;
            break;
        }
    }
    std::cout << "结果验证: " << (correct ? "正确" : "错误") << "\n";

    // 释放内存
    aligned_free(a);
    aligned_free(b);
    aligned_free(c);
    aligned_free(c_verify);

    return 0;
}