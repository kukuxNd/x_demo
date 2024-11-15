section .data
    ; 常量定义
    msg_hello    db 'Hello, Assembly!', 0xA, 0    ; 带换行符的字符串
    len_hello    equ $ - msg_hello
    num1         dd 10                            ; 32位整数
    num2         dd 20
    fmt_int      db '%d', 0xA, 0                 ; 整数打印格式
    fmt_str      db '%s', 0                      ; 字符串打印格式
    
section .bss
    buffer      resb 64                          ; 64字节的缓冲区
    result      resd 1                           ; 32位结果存储

section .text
    global main
    extern printf                                ; 声明外部C函数
    extern scanf

main:
    push rbp
    mov rbp, rsp

    ; === 示例1：打印字符串 ===
    mov rdi, fmt_str                            ; 格式字符串
    mov rsi, msg_hello                          ; 要打印的字符串
    xor rax, rax                                ; AL = 0 (没有浮点数参数)
    call printf

    ; === 示例2：基本算术运算 ===
    mov eax, [num1]
    add eax, [num2]                             ; 加法
    mov [result], eax
    
    mov rdi, fmt_int                            ; 打印结果
    mov rsi, [result]
    xor rax, rax
    call printf

    ; === 示例3：循环示例 ===
    mov ecx, 5                                  ; 循环计数器
loop_start:
    push rcx                                    ; 保存计数器
    
    mov rdi, fmt_int                            ; 打印当前数字
    mov rsi, rcx
    xor rax, rax
    call printf
    
    pop rcx                                     ; 恢复计数器
    loop loop_start                             ; 循环直到ECX为0

    ; === 示例4：条件判断 ===
    mov eax, [num1]
    cmp eax, [num2]
    jge number_greater
    
number_less:
    mov rdi, fmt_str
    mov rsi, msg_less                           ; 数字较小
    jmp print_result
    
number_greater:
    mov rdi, fmt_str
    mov rsi, msg_greater                        ; 数字较大
    
print_result:
    xor rax, rax
    call printf

    ; === 示例5：函数调用 ===
    call my_function

    ; 程序退出
    mov rsp, rbp
    pop rbp
    xor eax, eax                                ; 返回值0
    ret

; 自定义函数示例
my_function:
    push rbp
    mov rbp, rsp
    
    ; 函数体
    mov rdi, fmt_str
    mov rsi, msg_func
    xor rax, rax
    call printf
    
    mov rsp, rbp
    pop rbp
    ret

section .data
    msg_less     db 'Number is less', 0xA, 0
    msg_greater  db 'Number is greater or equal', 0xA, 0
    msg_func     db 'Inside custom function', 0xA, 0 