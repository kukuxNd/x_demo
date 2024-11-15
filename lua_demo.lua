-- 基础数据类型和变量
local num = 42                -- 数值
local str = "Hello"          -- 字符串
local bool = true            -- 布尔值
local t = nil               -- nil值
local arr = {1, 2, 3}       -- 数组/表
local dict = {              -- 字典/表
    name = "张三",
    age = 25
}

-- 字符串操作
local str1 = "Hello"
local str2 = "World"
local concat = str1 .. " " .. str2  -- 字符串连接
print(string.len(str1))            -- 字符串长度
print(string.upper(str1))          -- 转大写
print(string.lower(str1))          -- 转小写
print(string.sub(str1, 1, 2))      -- 子字符串
print(string.find(str1, "ll"))     -- 查找子串
print(string.gsub(str1, "l", "L")) -- 替换

-- 数学运算
local math_demo = function()
    print(math.abs(-5))        -- 绝对值
    print(math.ceil(3.2))      -- 向上取整
    print(math.floor(3.8))     -- 向下取整
    print(math.max(1, 2, 3))   -- 最大值
    print(math.min(1, 2, 3))   -- 最小值
    print(math.random())       -- 随机数
    print(math.sqrt(16))       -- 平方根
    print(math.pi)             -- 圆周率
end

-- 表(数组/字典)操作
local table_demo = function()
    local t = {10, 20, 30}
    table.insert(t, 40)        -- 插入元素
    table.remove(t, 1)         -- 删除元素
    table.sort(t)              -- 排序
    print(table.concat(t, ",")) -- 连接成字符串
    
    -- 遍历数组
    for i, v in ipairs(t) do
        print(i, v)
    end
    
    -- 遍历字典
    local dict = {name="李四", age=30}
    for k, v in pairs(dict) do
        print(k, v)
    end
end

-- 条件控制
local if_demo = function(score)
    if score >= 90 then
        return "优秀"
    elseif score >= 60 then
        return "及格"
    else
        return "不及格"
    end
end

-- 循环结构
local loop_demo = function()
    -- for循环
    for i = 1, 5 do
        print(i)
    end
    
    -- while循环
    local count = 0
    while count < 5 do
        count = count + 1
        print(count)
    end
    
    -- repeat-until循环
    local num = 0
    repeat
        num = num + 1
        print(num)
    until num >= 5
end

-- 函数定义
local function add(a, b)
    return a + b
end

-- 闭包示例
local function counter()
    local count = 0
    return function()
        count = count + 1
        return count
    end
end

-- 面向对象示例
local Person = {}
Person.__index = Person

function Person.new(name, age)
    local self = setmetatable({}, Person)
    self.name = name
    self.age = age
    return self
end

function Person:sayHello()
    print(string.format("你好，我是%s，今年%d岁", self.name, self.age))
end

-- 文件操作
local file_demo = function()
    -- 写文件
    local file = io.open("test.txt", "w")
    if file then
        file:write("Hello Lua!\n")
        file:close()
    end
    
    -- 读文件
    local file = io.open("test.txt", "r")
    if file then
        local content = file:read("*all")
        print(content)
        file:close()
    end
end

-- 错误处理
local error_demo = function()
    local status, err = pcall(function()
        error("发生错误")
    end)
    if not status then
        print("捕获到错误:", err)
    end
end

-- 模块定义示例
local M = {}

M.version = "1.0"

function M.greet(name)
    print("你好, " .. name)
end

-- 调用示例
local function main()
    -- 基础数据类型
    print("数值:", num)
    print("字符串:", str)
    
    -- 函数调用
    print("加法结果:", add(10, 20))
    
    -- 计数器闭包
    local count = counter()
    print(count())  -- 1
    print(count())  -- 2
    
    -- 面向对象
    local person = Person.new("王五", 28)
    person:sayHello()
    
    -- 表操作演示
    table_demo()
    
    -- 数学运算演示
    math_demo()
    
    -- 文件操作演示
    file_demo()
    
    -- 错误处理演示
    error_demo()
end

-- 执行主函数
main()

return M  -- 返回模块 