#include <stdio.h>
#include <cuda_runtime.h>

// 错误检查宏
#define CHECK_CUDA_ERROR(call) \
    do { \
        cudaError_t err = call; \
        if (err != cudaSuccess) { \
            printf("CUDA Error: %s at line %d\n", cudaGetErrorString(err), __LINE__); \
            exit(1); \
        } \
    } while (0)

// 向量加法的 CUDA kernel
__global__ void vectorAdd(const float *A, const float *B, float *C, int n) {
    int i = blockDim.x * blockIdx.x + threadIdx.x;
    if (i < n) {
        C[i] = A[i] + B[i];
    }
}

// 矩阵乘法的 CUDA kernel
__global__ void matrixMul(const float *A, const float *B, float *C, 
                         int numARows, int numAColumns, int numBColumns) {
    int row = blockIdx.y * blockDim.y + threadIdx.y;
    int col = blockIdx.x * blockDim.x + threadIdx.x;

    if (row < numARows && col < numBColumns) {
        float sum = 0.0f;
        for (int i = 0; i < numAColumns; i++) {
            sum += A[row * numAColumns + i] * B[i * numBColumns + col];
        }
        C[row * numBColumns + col] = sum;
    }
}

// 向量加法示例
void vectorAddExample() {
    printf("\n=== Vector Addition Example ===\n");
    
    const int N = 1000000;
    size_t size = N * sizeof(float);

    // 分配主机内存
    float *h_A = (float *)malloc(size);
    float *h_B = (float *)malloc(size);
    float *h_C = (float *)malloc(size);

    // 初始化输入数据
    for (int i = 0; i < N; i++) {
        h_A[i] = rand() / (float)RAND_MAX;
        h_B[i] = rand() / (float)RAND_MAX;
    }

    // 分配设备内存
    float *d_A, *d_B, *d_C;
    CHECK_CUDA_ERROR(cudaMalloc((void **)&d_A, size));
    CHECK_CUDA_ERROR(cudaMalloc((void **)&d_B, size));
    CHECK_CUDA_ERROR(cudaMalloc((void **)&d_C, size));

    // 将数据复制到设备
    CHECK_CUDA_ERROR(cudaMemcpy(d_A, h_A, size, cudaMemcpyHostToDevice));
    CHECK_CUDA_ERROR(cudaMemcpy(d_B, h_B, size, cudaMemcpyHostToDevice));

    // 启动 kernel
    int threadsPerBlock = 256;
    int blocksPerGrid = (N + threadsPerBlock - 1) / threadsPerBlock;
    vectorAdd<<<blocksPerGrid, threadsPerBlock>>>(d_A, d_B, d_C, N);

    // 检查kernel执行错误
    CHECK_CUDA_ERROR(cudaGetLastError());
    
    // 将结果复制回主机
    CHECK_CUDA_ERROR(cudaMemcpy(h_C, d_C, size, cudaMemcpyDeviceToHost));

    // 验证结果
    float maxError = 0.0f;
    for (int i = 0; i < N; i++) {
        maxError = max(maxError, abs(h_C[i] - (h_A[i] + h_B[i])));
    }
    printf("Max error: %f\n", maxError);

    // 清理
    cudaFree(d_A);
    cudaFree(d_B);
    cudaFree(d_C);
    free(h_A);
    free(h_B);
    free(h_C);
}

// 矩阵乘法示例
void matrixMulExample() {
    printf("\n=== Matrix Multiplication Example ===\n");
    
    const int numARows = 1000;
    const int numAColumns = 1000;
    const int numBRows = numAColumns;
    const int numBColumns = 1000;
    const int numCRows = numARows;
    const int numCColumns = numBColumns;

    size_t sizeA = numARows * numAColumns * sizeof(float);
    size_t sizeB = numBRows * numBColumns * sizeof(float);
    size_t sizeC = numCRows * numCColumns * sizeof(float);

    // 分配主机内存
    float *h_A = (float *)malloc(sizeA);
    float *h_B = (float *)malloc(sizeB);
    float *h_C = (float *)malloc(sizeC);

    // 初始化输入矩阵
    for (int i = 0; i < numARows * numAColumns; i++) {
        h_A[i] = rand() / (float)RAND_MAX;
    }
    for (int i = 0; i < numBRows * numBColumns; i++) {
        h_B[i] = rand() / (float)RAND_MAX;
    }

    // 分配设备内存
    float *d_A, *d_B, *d_C;
    CHECK_CUDA_ERROR(cudaMalloc((void **)&d_A, sizeA));
    CHECK_CUDA_ERROR(cudaMalloc((void **)&d_B, sizeB));
    CHECK_CUDA_ERROR(cudaMalloc((void **)&d_C, sizeC));

    // 将数据复制到设备
    CHECK_CUDA_ERROR(cudaMemcpy(d_A, h_A, sizeA, cudaMemcpyHostToDevice));
    CHECK_CUDA_ERROR(cudaMemcpy(d_B, h_B, sizeB, cudaMemcpyHostToDevice));

    // 设置 kernel 配置
    dim3 threadsPerBlock(16, 16);
    dim3 blocksPerGrid((numCColumns + threadsPerBlock.x - 1) / threadsPerBlock.x,
                       (numCRows + threadsPerBlock.y - 1) / threadsPerBlock.y);

    // 启动 kernel
    matrixMul<<<blocksPerGrid, threadsPerBlock>>>(d_A, d_B, d_C,
                                                 numARows, numAColumns,
                                                 numBColumns);

    // 检查kernel执行错误
    CHECK_CUDA_ERROR(cudaGetLastError());

    // 将结果复制回主机
    CHECK_CUDA_ERROR(cudaMemcpy(h_C, d_C, sizeC, cudaMemcpyDeviceToHost));

    printf("Matrix multiplication completed\n");

    // 清理
    cudaFree(d_A);
    cudaFree(d_B);
    cudaFree(d_C);
    free(h_A);
    free(h_B);
    free(h_C);
}

int main() {
    // 打印 CUDA 设备信息
    cudaDeviceProp prop;
    CHECK_CUDA_ERROR(cudaGetDeviceProperties(&prop, 0));
    printf("Device: %s\n", prop.name);
    printf("Compute capability: %d.%d\n", prop.major, prop.minor);
    
    // 运行示例
    vectorAddExample();
    matrixMulExample();
    
    return 0;
} 