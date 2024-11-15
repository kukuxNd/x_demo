section .data
    msg db 'Hello, World!', 0xA, 0    ; 字符串和换行符
    len equ $ - msg                   ; 字符串长度

section .text
    global main
    extern printf

main:
    push rbp
    mov rbp, rsp

    ; 调用 printf 打印字符串
    mov rdi, fmt
    mov rsi, msg
    xor rax, rax
    call printf

    ; 退出程序
    mov rsp, rbp
    pop rbp
    xor eax, eax
    ret

section .data
    fmt db '%s', 0