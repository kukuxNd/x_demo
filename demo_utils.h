#ifndef DEMO_UTILS_H
#define DEMO_UTILS_H

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <stdbool.h>

// 常量定义
#define MAX_STRING_LENGTH 256
#define MAX_ARRAY_SIZE 100

// 基础数据类型示例
typedef struct {
    char name[MAX_STRING_LENGTH];
    int age;
} Person;

// 字符串操作函数
char* string_reverse(char* str);
char* string_concat(const char* str1, const char* str2);
int string_count_char(const char* str, char ch);

// 数组操作函数
void array_reverse(int arr[], int size);
void array_sort(int arr[], int size);
double array_average(const int arr[], int size);
int array_find(const int arr[], int size, int target);

// 文件操作函数
bool file_write_text(const char* filename, const char* content);
char* file_read_text(const char* filename);
bool file_append_text(const char* filename, const char* content);

// 动态内存管理
int* create_dynamic_array(int size);
void free_dynamic_array(int* arr);

// 链表结构定义
typedef struct Node {
    int data;
    struct Node* next;
} Node;

// 链表操作函数
Node* list_create_node(int data);
void list_append(Node** head, int data);
void list_print(Node* head);
void list_free(Node* head);
Node* list_reverse(Node* head);

// 二叉树结构定义
typedef struct TreeNode {
    int data;
    struct TreeNode* left;
    struct TreeNode* right;
} TreeNode;

// 二叉树操作函数
TreeNode* tree_create_node(int data);
void tree_insert(TreeNode** root, int data);
void tree_inorder(TreeNode* root);
void tree_free(TreeNode* root);

// 排序算法
void bubble_sort(int arr[], int size);
void quick_sort(int arr[], int low, int high);
void merge_sort(int arr[], int left, int right);

// 搜索算法
int binary_search(const int arr[], int size, int target);
int linear_search(const int arr[], int size, int target);

// 数学工具函数
int math_gcd(int a, int b);
int math_lcm(int a, int b);
bool math_is_prime(int n);
long long math_factorial(int n);

// 时间相关函数
char* time_get_current(void);
double time_measure_function(void (*func)(void));

// 错误处理宏
#define HANDLE_ERROR(condition, message) \
    do { \
        if (condition) { \
            fprintf(stderr, "Error: %s\n", message); \
            exit(1); \
        } \
    } while (0)

#endif // DEMO_UTILS_H 