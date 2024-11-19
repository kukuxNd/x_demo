   section .text
       global _start

   _start:
       ; 设置视频模式为 13h（320x200 像素，256 色）
       mov ax, 0x0013      ; 视频模式 13h
       int 0x10            ; 调用 BIOS 中断

       ; 在屏幕上绘制一个简单的像素
       mov di, 100         ; 像素位置（行 * 320 + 列）
       mov al, 0x0F        ; 颜色（白色）
       mov [bx + di], al   ; 设置像素颜色

       ; 等待按键
       mov ah, 0x00        ; 功能：等待按键
       int 0x16            ; 调用 BIOS 中断

       ; 返回到文本模式
       mov ax, 0x0003      ; 视频模式 3（80x25 文本模式）
       int 0x10            ; 调用 BIOS 中断

       ; 退出程序
       mov ax, 0x4C00      ; 退出程序
       int 0x21            ; 调用 DOS 中断