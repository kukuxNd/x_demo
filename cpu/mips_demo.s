# MIPS 汇编示例程序
.data
    # 数据段定义
    msg:        .asciiz     "Hello from MIPS Assembly!\n"
    prompt:     .asciiz     "Enter a number: "
    result_msg: .asciiz     "Result is: "
    newline:    .asciiz     "\n"
    number1:    .word       42
    number2:    .word       18
    array:      .word       1, 2, 3, 4, 5    # 示例数组
    array_size: .word       5

.text
.globl main

main:
    # 保存返回地址
    addi    $sp, $sp, -4       # 调整栈指针
    sw      $ra, 0($sp)        # 保存返回地址

    # 示例1: 打印字符串
    li      $v0, 4             # syscall: print_string
    la      $a0, msg           # 加载字符串地址
    syscall

    # 示例2: 数学运算
    lw      $t0, number1       # 加载第一个数
    lw      $t1, number2       # 加载第二个数
    
    # 加法运算
    add     $t2, $t0, $t1      # t2 = t0 + t1
    
    # 打印结果
    li      $v0, 4             # syscall: print_string
    la      $a0, result_msg    # 加载结果消息
    syscall
    
    li      $v0, 1             # syscall: print_int
    move    $a0, $t2           # 移动结果到 a0
    syscall
    
    # 打印换行
    li      $v0, 4
    la      $a0, newline
    syscall

    # 示例3: 循环结构
    li      $t0, 5             # 循环计数器
    la      $t1, array         # 数组基址

loop:
    # 加载并打印数组元素
    lw      $a0, 0($t1)        # 加载数组元素
    li      $v0, 1             # syscall: print_int
    syscall
    
    # 打印空格
    li      $v0, 11            # syscall: print_char
    li      $a0, 32            # 空格的 ASCII 码
    syscall
    
    addi    $t1, $t1, 4        # 移动到下一个元素
    addi    $t0, $t0, -1       # 递减计数器
    bgtz    $t0, loop          # 如果计数器>0则继续循环

    # 示例4: 函数调用
    jal     print_newline      # 调用换行函数
    
    # 示例5: 条件分支
    lw      $t0, number1
    lw      $t1, number2
    bgt     $t0, $t1, greater  # 如果 number1 > number2
    j       less_equal         # 否则跳转到 less_equal

greater:
    li      $v0, 4
    la      $a0, msg_greater
    syscall
    j       end_compare

less_equal:
    li      $v0, 4
    la      $a0, msg_less
    syscall

end_compare:
    # 程序结束
    lw      $ra, 0($sp)        # 恢复返回地址
    addi    $sp, $sp, 4        # 恢复栈指针
    
    li      $v0, 10            # syscall: exit
    syscall

# 函数：打印换行
print_newline:
    li      $v0, 4             # syscall: print_string
    la      $a0, newline       # 加载换行符
    syscall
    jr      $ra                # 返回

.data
    msg_greater: .asciiz   "First number is greater\n"
    msg_less:   .asciiz   "First number is less or equal\n" 