@echo off
REM SVN Diff检查脚本

REM 检查参数
if "%1"=="" (
    echo 请提供要检查的关键字
    goto :eof
)

REM 设置关键字

set keyword=%1

REM 执行SVN diff并保存到临时文件
svn diff > temp_diff.txt

REM 查找包含关键字的行
findstr /i /n "%keyword%" temp_diff.txt > filtered_results.txt

REM 检查是否找到匹配项
for %%A in (filtered_results.txt) do set size=%%~zA
if %size% gtr 0 (
    echo 警告！发现包含 "%keyword%" 的修改:
    type filtered_results.txt
    echo.
    echo 请检查以上修改是否合规！
) else (
    echo 未发现包含 "%keyword%" 的修改。
)

REM 清理临时文件
del temp_diff.txt
del filtered_results.txt

pause


REM ===== 批处理命令调用示例 =====

REM 文件和目录操作示例
dir /s /b *.txt                    REM 递归显示所有txt文件
cd /d D:\workspace                 REM 切换到D盘workspace目录
mkdir "new folder"                 REM 创建新文件夹
rmdir /s /q temp                   REM 强制删除temp目录及其内容
del /f /q *.tmp                    REM 强制删除所有tmp文件
copy src.txt dst.txt               REM 复制文件
move *.doc D:\docs                 REM 移动所有doc文件
rename old.txt new.txt             REM 重命名文件
type file.txt                      REM 显示文件内容
tree /f                            REM 显示包含文件的目录结构

REM 系统命令示例
tasklist | findstr "chrome"        REM 查找chrome相关进程
taskkill /f /im notepad.exe        REM 强制结束记事本进程
shutdown /s /t 60                  REM 60秒后关机
ipconfig /all                      REM 显示详细网络配置
ping -n 4 www.baidu.com           REM ping百度4次

REM 文本处理示例
find "error" log.txt              REM 在日志中查找error
findstr /i /c:"warning" *.log     REM 在所有日志中查找warning
sort < input.txt > output.txt     REM 对文件内容排序
type long.txt | more              REM 分页显示长文本

REM 流程控制示例
if exist file.txt (
    echo 文件存在
) else (
    echo 文件不存在
)

for %%i in (*.txt) do (
    echo 处理文件: %%i
)

:LABEL
echo 这是一个标签
goto LABEL

call other.bat arg1 arg2          REM 调用其他批处理并传参

choice /c YN /m "是否继续?"       REM 用户选择
timeout /t 5                      REM 等待5秒

REM 变量操作示例
set name=value                    REM 设置变量
echo %name%                       REM 显示变量值
setlocal
set local_var=test
endlocal

REM 文件属性示例
attrib +r file.txt               REM 设置只读属性
comp file1.txt file2.txt         REM 比较两个文件
fc /n file1.txt file2.txt        REM 显示文件差异

REM 网络命令示例
net use Z: \\server\share        REM 映射网络驱动器
netstat -an | findstr "80"       REM 查看80端口状态
nslookup www.baidu.com           REM 解析域名
route print                      REM 显示路由表

REM 其他实用命令示例
xcopy /s /e /i src dst           REM 复制整个目录结构
robocopy source dest /mir        REM 镜像目录
where notepad                    REM 查找notepad位置
whoami /all                      REM 显示当前用户详细信息


