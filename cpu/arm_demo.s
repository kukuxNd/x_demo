/* ARM 汇编示例程序 */
.global _start      @ 程序入口点

/* 数据段 */
.data
    msg:        .ascii      "Hello from ARM Assembly!\n"
    msg_len     =          .-msg
    number1:    .word      42
    number2:    .word      18
    result:     .word      0
    newline:    .ascii     "\n"

/* 代码段 */
.text
_start:
    /* 保存链接寄存器 */
    push    {lr}

    /* 示例1: 打印字符串 */
    ldr     r0, =msg       @ 加载消息地址
    ldr     r1, =msg_len   @ 加载消息长度
    bl      print_string   @ 调用打印函数

    /* 示例2: 数字运算 */
    ldr     r0, =number1   @ 加载第一个数的地址
    ldr     r0, [r0]      @ 加载第一个数的值
    ldr     r1, =number2   @ 加载第二个数的地址
    ldr     r1, [r1]      @ 加载第二个数的值
    
    /* 执行加法 */
    add     r2, r0, r1    @ r2 = r0 + r1
    
    /* 保存结果 */
    ldr     r0, =result
    str     r2, [r0]

    /* 示例3: 循环结构 */
    mov     r4, #5        @ 循环计数器
loop:
    /* 保存寄存器 */
    push    {r4}
    
    /* 执行循环体 */
    bl      print_newline
    
    /* 恢复寄存器并递减计数器 */
    pop     {r4}
    subs    r4, r4, #1    @ 递减计数器
    bne     loop          @ 如果不为零则继续循环

    /* 示例4: 条件分支 */
    ldr     r0, =number1
    ldr     r0, [r0]
    ldr     r1, =number2
    ldr     r1, [r1]
    cmp     r0, r1        @ 比较两个数
    bgt     greater       @ 如果大于则跳转
    ble     less_equal    @ 如果小于等于则跳转

greater:
    /* 处理大于的情况 */
    b       end_compare

less_equal:
    /* 处理小于等于的情况 */
    b       end_compare

end_compare:
    /* 退出程序 */
    pop     {lr}
    mov     r7, #1        @ exit syscall
    mov     r0, #0        @ return code 0
    swi     0            @ 触发系统调用

/* 函数：打印字符串 */
print_string:
    push    {r7, lr}      @ 保存寄存器
    mov     r7, #4        @ write syscall
    mov     r0, #1        @ stdout
    swi     0            @ 触发系统调用
    pop     {r7, pc}      @ 恢复寄存器并返回

/* 函数：打印换行 */
print_newline:
    push    {r7, lr}
    mov     r7, #4        @ write syscall
    mov     r0, #1        @ stdout
    ldr     r1, =newline  @ 换行符地址
    mov     r2, #1        @ 长度为1
    swi     0
    pop     {r7, pc}

/* ��据对齐 */
.align 4 