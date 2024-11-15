using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Security.Cryptography;
using System.Diagnostics;
using Newtonsoft.Json;

namespace DemoUtils
{
    /// <summary>
    /// 字符串工具类
    /// </summary>
    public static class StringUtils
    {
        /// <summary>
        /// 检查字符串是否为空或空白
        /// </summary>
        public static bool IsNullOrEmpty(string str) => string.IsNullOrWhiteSpace(str);

        /// <summary>
        /// 反转字符串
        /// </summary>
        public static string Reverse(string str)
        {
            if (string.IsNullOrEmpty(str)) return str;
            return new string(str.Reverse().ToArray());
        }

        /// <summary>
        /// 获取字符串的MD5值
        /// </summary>
        public static string GetMD5(string input)
        {
            using (var md5 = MD5.Create())
            {
                var bytes = Encoding.UTF8.GetBytes(input);
                var hash = md5.ComputeHash(bytes);
                return BitConverter.ToString(hash).Replace("-", "").ToLower();
            }
        }

        /// <summary>
        /// 检查是否是有效的邮箱地址
        /// </summary>
        public static bool IsValidEmail(string email)
        {
            if (string.IsNullOrWhiteSpace(email)) return false;
            try
            {
                return Regex.IsMatch(email,
                    @"^[^@\s]+@[^@\s]+\.[^@\s]+$",
                    RegexOptions.IgnoreCase);
            }
            catch
            {
                return false;
            }
        }
    }

    /// <summary>
    /// 文件工具类
    /// </summary>
    public static class FileUtils
    {
        /// <summary>
        /// 异步读取文本文件
        /// </summary>
        public static async Task<string> ReadTextAsync(string path)
        {
            using var reader = new StreamReader(path);
            return await reader.ReadToEndAsync();
        }

        /// <summary>
        /// 异步写入文本文件
        /// </summary>
        public static async Task WriteTextAsync(string path, string content)
        {
            using var writer = new StreamWriter(path, false);
            await writer.WriteAsync(content);
        }

        /// <summary>
        /// 递归获取目录下所有文件
        /// </summary>
        public static IEnumerable<string> GetAllFiles(string path, string searchPattern = "*.*")
        {
            var files = Directory.GetFiles(path, searchPattern);
            var directories = Directory.GetDirectories(path);
            
            foreach (var file in files)
            {
                yield return file;
            }

            foreach (var dir in directories)
            {
                foreach (var file in GetAllFiles(dir, searchPattern))
                {
                    yield return file;
                }
            }
        }
    }

    /// <summary>
    /// 日期时间工具类
    /// </summary>
    public static class DateTimeUtils
    {
        /// <summary>
        /// 获取当前时间戳（毫秒）
        /// </summary>
        public static long GetTimestamp() =>
            DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

        /// <summary>
        /// 将时间戳转换为DateTime
        /// </summary>
        public static DateTime FromTimestamp(long timestamp) =>
            DateTimeOffset.FromUnixTimeMilliseconds(timestamp).LocalDateTime;

        /// <summary>
        /// 获取某月的第一天
        /// </summary>
        public static DateTime GetFirstDayOfMonth(DateTime date) =>
            new DateTime(date.Year, date.Month, 1);

        /// <summary>
        /// 获取某月的最后一天
        /// </summary>
        public static DateTime GetLastDayOfMonth(DateTime date) =>
            GetFirstDayOfMonth(date).AddMonths(1).AddDays(-1);
    }

    /// <summary>
    /// 数学工具类
    /// </summary>
    public static class MathUtils
    {
        /// <summary>
        /// 计算最大公约数
        /// </summary>
        public static int GCD(int a, int b)
        {
            while (b != 0)
            {
                var temp = b;
                b = a % b;
                a = temp;
            }
            return a;
        }

        /// <summary>
        /// 计算最小公倍数
        /// </summary>
        public static int LCM(int a, int b) => (a / GCD(a, b)) * b;

        /// <summary>
        /// 判断是否是质数
        /// </summary>
        public static bool IsPrime(int number)
        {
            if (number <= 1) return false;
            for (int i = 2; i * i <= number; i++)
            {
                if (number % i == 0) return false;
            }
            return true;
        }
    }

    /// <summary>
    /// 集合工具类
    /// </summary>
    public static class CollectionUtils
    {
        /// <summary>
        /// 随机打乱列表
        /// </summary>
        public static void Shuffle<T>(this IList<T> list)
        {
            var rng = new Random();
            int n = list.Count;
            while (n > 1)
            {
                n--;
                int k = rng.Next(n + 1);
                T value = list[k];
                list[k] = list[n];
                list[n] = value;
            }
        }

        /// <summary>
        /// 获取列表的随机元素
        /// </summary>
        public static T GetRandomElement<T>(this IList<T> list)
        {
            if (list == null || list.Count == 0)
                throw new ArgumentException("List is empty or null");
            
            return list[new Random().Next(list.Count)];
        }
    }

    /// <summary>
    /// JSON工具类
    /// </summary>
    public static class JsonUtils
    {
        /// <summary>
        /// 将对象序列化为JSON字符串
        /// </summary>
        public static string ToJson(object obj) =>
            JsonConvert.SerializeObject(obj);

        /// <summary>
        /// 将JSON字符串反序列化为对象
        /// </summary>
        public static T FromJson<T>(string json) =>
            JsonConvert.DeserializeObject<T>(json);
    }

    /// <summary>
    /// 性能计时器
    /// </summary>
    public class PerformanceTimer : IDisposable
    {
        private readonly string _operationName;
        private readonly Stopwatch _stopwatch;

        public PerformanceTimer(string operationName)
        {
            _operationName = operationName;
            _stopwatch = Stopwatch.StartNew();
        }

        public void Dispose()
        {
            _stopwatch.Stop();
            Console.WriteLine($"{_operationName} 耗时: {_stopwatch.ElapsedMilliseconds}ms");
        }
    }

    /// <summary>
    /// 示例使用类
    /// </summary>
    public class DemoExample
    {
        public async Task RunExamples()
        {
            try
            {
                // 字符串工具示例
                Console.WriteLine("=== 字符串工具示例 ===");
                var str = "Hello, World!";
                Console.WriteLine($"反转字符串: {StringUtils.Reverse(str)}");
                Console.WriteLine($"MD5值: {StringUtils.GetMD5(str)}");
                Console.WriteLine($"是否有效邮箱: {StringUtils.IsValidEmail("test@example.com")}");

                // 文件工具示例
                Console.WriteLine("\n=== 文件工具示例 ===");
                await FileUtils.WriteTextAsync("test.txt", "测试内容");
                var content = await FileUtils.ReadTextAsync("test.txt");
                Console.WriteLine($"文件内容: {content}");

                // 日期时间工具示例
                Console.WriteLine("\n=== 日期时间工具示例 ===");
                var timestamp = DateTimeUtils.GetTimestamp();
                var datetime = DateTimeUtils.FromTimestamp(timestamp);
                Console.WriteLine($"当前时间戳: {timestamp}");
                Console.WriteLine($"转换后时间: {datetime}");

                // 数学工具示例
                Console.WriteLine("\n=== 数学工具示例 ===");
                Console.WriteLine($"GCD(12,18): {MathUtils.GCD(12, 18)}");
                Console.WriteLine($"LCM(12,18): {MathUtils.LCM(12, 18)}");
                Console.WriteLine($"是否质数(17): {MathUtils.IsPrime(17)}");

                // 集合工具示例
                Console.WriteLine("\n=== 集合工具示例 ===");
                var list = new List<int> { 1, 2, 3, 4, 5 };
                list.Shuffle();
                Console.WriteLine($"打乱后的列表: {string.Join(", ", list)}");
                Console.WriteLine($"随机元素: {list.GetRandomElement()}");

                // 性能计时器示例
                Console.WriteLine("\n=== 性能计时器示例 ===");
                using (new PerformanceTimer("Sleep操作"))
                {
                    await Task.Delay(1000);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"发生错误: {ex.Message}");
            }
        }
    }
} 