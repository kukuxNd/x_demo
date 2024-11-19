using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.IO;
using System.Text.RegularExpressions;

namespace CSharpUtilsDemo
{
    public class Utils
    {
        // 字符串处理方法
        public static class StringUtils
        {
            // 检查字符串是否为空
            public static bool IsNullOrEmpty(string str) => string.IsNullOrEmpty(str);

            // 字符串反转
            public static string Reverse(string str)
            {
                if (string.IsNullOrEmpty(str)) return str;
                return new string(str.Reverse().ToArray());
            }

            // 检查是否为有效邮箱
            public static bool IsValidEmail(string email)
            {
                string pattern = @"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$";
                return Regex.IsMatch(email, pattern);
            }
        }

        // 日期时间处理方法
        public static class DateTimeUtils
        {
            // 获取当前时间戳
            public static long GetTimestamp() => 
                DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

            // 格式化日期时间
            public static string FormatDateTime(DateTime date, string format = "yyyy-MM-dd HH:mm:ss") => 
                date.ToString(format);

            // 计算两个日期之间的天数
            public static int DaysBetween(DateTime start, DateTime end) => 
                (end - start).Days;
        }

        // 文件操作方法
        public static class FileUtils
        {
            // 安全读取文件内容
            public static string ReadFileContent(string path)
            {
                try
                {
                    return File.ReadAllText(path);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"读取文件失败: {ex.Message}");
                    return string.Empty;
                }
            }

            // 安全写入文件
            public static bool WriteFileContent(string path, string content)
            {
                try
                {
                    File.WriteAllText(path, content);
                    return true;
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"写入文件失败: {ex.Message}");
                    return false;
                }
            }
        }

        // 集合操作方法
        public static class CollectionUtils
        {
            // 列表去重
            public static List<T> RemoveDuplicates<T>(List<T> list) => 
                list.Distinct().ToList();

            // 数组转字符串
            public static string ArrayToString<T>(T[] array, string separator = ",") => 
                string.Join(separator, array);

            // 安全获取列表元素
            public static T GetSafeValue<T>(List<T> list, int index, T defaultValue = default)
            {
                if (list == null || index < 0 || index >= list.Count)
                    return defaultValue;
                return list[index];
            }
        }

        // 数值处理方法
        public static class NumberUtils
        {
            // 安全转换为整数
            public static int ParseInt(string value, int defaultValue = 0)
            {
                return int.TryParse(value, out int result) ? result : defaultValue;
            }

            // 生成随机数
            public static int RandomNumber(int min, int max)
            {
                Random random = new Random();
                return random.Next(min, max + 1);
            }
        }

        // 加密解密方法
        public static class SecurityUtils
        {
            // 简单的MD5加密
            public static string MD5Hash(string input)
            {
                using (var md5 = System.Security.Cryptography.MD5.Create())
                {
                    byte[] inputBytes = Encoding.UTF8.GetBytes(input);
                    byte[] hashBytes = md5.ComputeHash(inputBytes);
                    return BitConverter.ToString(hashBytes).Replace("-", "").ToLower();
                }
            }
        }
    }

    // 示例使用
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("=== 字符串工具测试 ===");
            string testStr = "Hello World";
            Console.WriteLine($"原始字符串: {testStr}");
            Console.WriteLine($"反转后: {Utils.StringUtils.Reverse(testStr)}");
            Console.WriteLine($"邮箱验证: {Utils.StringUtils.IsValidEmail("test@example.com")}");

            Console.WriteLine("\n=== 日期时间工具测试 ===");
            Console.WriteLine($"当前时间戳: {Utils.DateTimeUtils.GetTimestamp()}");
            Console.WriteLine($"格式化日期: {Utils.DateTimeUtils.FormatDateTime(DateTime.Now)}");

            Console.WriteLine("\n=== 集合工具测试 ===");
            List<int> numbers = new List<int> { 1, 2, 2, 3, 3, 4 };
            Console.WriteLine($"去重前: {Utils.CollectionUtils.ArrayToString(numbers.ToArray())}");
            Console.WriteLine($"去重后: {Utils.CollectionUtils.ArrayToString(Utils.CollectionUtils.RemoveDuplicates(numbers).ToArray())}");

            Console.WriteLine("\n=== 数值工具测试 ===");
            Console.WriteLine($"随机数(1-100): {Utils.NumberUtils.RandomNumber(1, 100)}");
            Console.WriteLine($"字符串转数字: {Utils.NumberUtils.ParseInt("123")}");

            Console.WriteLine("\n=== 安全工具测试 ===");
            Console.WriteLine($"MD5加密: {Utils.SecurityUtils.MD5Hash("test123")}");
        }
    }
} 