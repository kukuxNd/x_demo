const fs = require('fs').promises;
const crypto = require('crypto');
const path = require('path');
const util = require('util');

class StringUtils {
    /**
     * 反转字符串
     */
    static reverse(str) {
        return String(str).split('').reverse().join('');
    }

    /**
     * 计算MD5
     */
    static md5(str) {
        return crypto.createHash('md5').update(String(str)).digest('hex');
    }

    /**
     * 验证邮箱
     */
    static isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }

    /**
     * 驼峰转下划线
     */
    static camelToSnake(str) {
        return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    }
}

class FileUtils {
    /**
     * 异步读取文本文件
     */
    static async readText(filePath) {
        try {
            return await fs.readFile(filePath, 'utf8');
        } catch (err) {
            console.error('读取文件错误:', err);
            throw err;
        }
    }

    /**
     * 异步写入文本文件
     */
    static async writeText(filePath, content) {
        try {
            await fs.writeFile(filePath, content, 'utf8');
            return true;
        } catch (err) {
            console.error('写入文件错误:', err);
            return false;
        }
    }

    /**
     * 递归获取目录下所有文件
     */
    static async getAllFiles(dir, pattern = null) {
        const files = await fs.readdir(dir);
        const result = [];

        for (const file of files) {
            const filePath = path.join(dir, file);
            const stat = await fs.stat(filePath);

            if (stat.isDirectory()) {
                result.push(...await FileUtils.getAllFiles(filePath, pattern));
            } else if (!pattern || file.match(pattern)) {
                result.push(filePath);
            }
        }

        return result;
    }
}

class DateTimeUtils {
    /**
     * 获取当前时间戳（毫秒）
     */
    static timestamp() {
        return Date.now();
    }

    /**
     * 格式化日期
     */
    static formatDate(date = new Date()) {
        return date.toISOString().replace('T', ' ').substr(0, 19);
    }

    /**
     * 解析日期字符串
     */
    static parseDate(dateStr) {
        try {
            return new Date(dateStr);
        } catch (err) {
            console.error('解析日期错误:', err);
            return null;
        }
    }
}

class ArrayUtils {
    /**
     * 随机打乱数组
     */
    static shuffle(arr) {
        const result = [...arr];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }

    /**
     * 数组去重
     */
    static unique(arr) {
        return [...new Set(arr)];
    }

    /**
     * 按键分组
     */
    static groupBy(arr, key) {
        return arr.reduce((groups, item) => {
            const group = groups[item[key]] || [];
            group.push(item);
            groups[item[key]] = group;
            return groups;
        }, {});
    }
}

class MathUtils {
    /**
     * 计算最大公约数
     */
    static gcd(a, b) {
        while (b !== 0) {
            [a, b] = [b, a % b];
        }
        return a;
    }

    /**
     * 计算最小公倍数
     */
    static lcm(a, b) {
        return (a * b) / MathUtils.gcd(a, b);
    }

    /**
     * 判断是否是质数
     */
    static isPrime(num) {
        if (num <= 1) return false;
        for (let i = 2; i * i <= num; i++) {
            if (num % i === 0) return false;
        }
        return true;
    }
}

class PerformanceTimer {
    constructor(name) {
        this.name = name;
        this.startTime = process.hrtime();
    }

    stop() {
        const diff = process.hrtime(this.startTime);
        console.log(`${this.name} 耗时: ${diff[0]}s ${diff[1]/1000000}ms`);
    }
}

// 示例使用
async function runExamples() {
    try {
        console.log('=== 字符串工具示例 ===');
        const str = 'Hello, Node.js!';
        console.log('原始字符串:', str);
        console.log('反转:', StringUtils.reverse(str));
        console.log('MD5:', StringUtils.md5(str));
        console.log('邮箱验证:', StringUtils.isValidEmail('test@example.com'));

        console.log('\n=== 文件操作示例 ===');
        await FileUtils.writeText('test.txt', '测试内容');
        const content = await FileUtils.readText('test.txt');
        console.log('文件内容:', content);

        console.log('\n=== 日期时间示例 ===');
        console.log('当前时间戳:', DateTimeUtils.timestamp());
        console.log('格式化日期:', DateTimeUtils.formatDate());

        console.log('\n=== 数组操作示例 ===');
        const arr = [1, 2, 3, 4, 5];
        console.log('打乱数组:', ArrayUtils.shuffle(arr));
        console.log('去重:', ArrayUtils.unique([1, 1, 2, 2, 3]));

        console.log('\n=== 数学工具示例 ===');
        console.log('GCD(12,18):', MathUtils.gcd(12, 18));
        console.log('是否质数(17):', MathUtils.isPrime(17));

        console.log('\n=== 性能测试示例 ===');
        const timer = new PerformanceTimer('休眠测试');
        await new Promise(resolve => setTimeout(resolve, 1000));
        timer.stop();

    } catch (err) {
        console.error('发生错误:', err);
    }
}

// 如果直接运行此文件
if (require.main === module) {
    runExamples();
}

module.exports = {
    StringUtils,
    FileUtils,
    DateTimeUtils,
    ArrayUtils,
    MathUtils,
    PerformanceTimer
}; 