#include "demo_utils.h"

// 字符串操作函数实现
char* string_reverse(char* str) {
    int len = strlen(str);
    for (int i = 0; i < len / 2; i++) {
        char temp = str[i];
        str[i] = str[len - 1 - i];
        str[len - 1 - i] = temp;
    }
    return str;
}

char* string_concat(const char* str1, const char* str2) {
    char* result = (char*)malloc(strlen(str1) + strlen(str2) + 1);
    HANDLE_ERROR(result == NULL, "内存分配失败");
    strcpy(result, str1);
    strcat(result, str2);
    return result;
}

int string_count_char(const char* str, char ch) {
    int count = 0;
    while (*str) {
        if (*str == ch) count++;
        str++;
    }
    return count;
}

// 数组操作函数实现
void array_reverse(int arr[], int size) {
    for (int i = 0; i < size / 2; i++) {
        int temp = arr[i];
        arr[i] = arr[size - 1 - i];
        arr[size - 1 - i] = temp;
    }
}

void array_sort(int arr[], int size) {
    quick_sort(arr, 0, size - 1);
}

double array_average(const int arr[], int size) {
    if (size == 0) return 0.0;
    double sum = 0;
    for (int i = 0; i < size; i++) {
        sum += arr[i];
    }
    return sum / size;
}

// 文件操作函数实现
bool file_write_text(const char* filename, const char* content) {
    FILE* file = fopen(filename, "w");
    if (!file) return false;
    
    bool success = fprintf(file, "%s", content) >= 0;
    fclose(file);
    return success;
}

char* file_read_text(const char* filename) {
    FILE* file = fopen(filename, "r");
    if (!file) return NULL;
    
    fseek(file, 0, SEEK_END);
    long size = ftell(file);
    rewind(file);
    
    char* content = (char*)malloc(size + 1);
    if (!content) {
        fclose(file);
        return NULL;
    }
    
    fread(content, 1, size, file);
    content[size] = '\0';
    fclose(file);
    return content;
}

// 链表操作函数实现
Node* list_create_node(int data) {
    Node* node = (Node*)malloc(sizeof(Node));
    HANDLE_ERROR(node == NULL, "内存分配失败");
    node->data = data;
    node->next = NULL;
    return node;
}

void list_append(Node** head, int data) {
    Node* new_node = list_create_node(data);
    if (*head == NULL) {
        *head = new_node;
        return;
    }
    
    Node* current = *head;
    while (current->next != NULL) {
        current = current->next;
    }
    current->next = new_node;
}

// 排序算法实现
void quick_sort(int arr[], int low, int high) {
    if (low < high) {
        int pivot = arr[high];
        int i = low - 1;
        
        for (int j = low; j < high; j++) {
            if (arr[j] <= pivot) {
                i++;
                int temp = arr[i];
                arr[i] = arr[j];
                arr[j] = temp;
            }
        }
        
        int temp = arr[i + 1];
        arr[i + 1] = arr[high];
        arr[high] = temp;
        
        int pi = i + 1;
        quick_sort(arr, low, pi - 1);
        quick_sort(arr, pi + 1, high);
    }
}

// 搜索算法实现
int binary_search(const int arr[], int size, int target) {
    int left = 0;
    int right = size - 1;
    
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    
    return -1;
}

// 数学工具函数实现
int math_gcd(int a, int b) {
    while (b != 0) {
        int temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}

bool math_is_prime(int n) {
    if (n <= 1) return false;
    for (int i = 2; i * i <= n; i++) {
        if (n % i == 0) return false;
    }
    return true;
}

// 时间相关函数实现
char* time_get_current(void) {
    time_t now = time(NULL);
    return ctime(&now);
}

double time_measure_function(void (*func)(void)) {
    clock_t start = clock();
    func();
    clock_t end = clock();
    return ((double)(end - start)) / CLOCKS_PER_SEC;
}

// 示例使用函数
void demo_string_operations(void) {
    char str[] = "Hello, World!";
    printf("原始字符串: %s\n", str);
    printf("反转后: %s\n", string_reverse(str));
    
    char* concat = string_concat("Hello, ", "World!");
    printf("连接结果: %s\n", concat);
    free(concat);
}

void demo_array_operations(void) {
    int arr[] = {1, 5, 3, 8, 2, 9, 4};
    int size = sizeof(arr) / sizeof(arr[0]);
    
    printf("原始数组: ");
    for (int i = 0; i < size; i++) {
        printf("%d ", arr[i]);
    }
    printf("\n");
    
    array_sort(arr, size);
    printf("排序后: ");
    for (int i = 0; i < size; i++) {
        printf("%d ", arr[i]);
    }
    printf("\n");
}

void demo_list_operations(void) {
    Node* head = NULL;
    for (int i = 1; i <= 5; i++) {
        list_append(&head, i);
    }
    
    printf("链表内容: ");
    list_print(head);
    printf("\n");
    
    list_free(head);
}

// 主函数示例
int main() {
    printf("=== 字符串操作演示 ===\n");
    demo_string_operations();
    
    printf("\n=== 数组操作演示 ===\n");
    demo_array_operations();
    
    printf("\n=== 链表操作演示 ===\n");
    demo_list_operations();
    
    printf("\n=== 文件操作演示 ===\n");
    file_write_text("test.txt", "Hello, C!");
    char* content = file_read_text("test.txt");
    if (content) {
        printf("文件内容: %s\n", content);
        free(content);
    }
    
    printf("\n=== 时间测量演示 ===\n");
    printf("当前时间: %s", time_get_current());
    
    return 0;
} 