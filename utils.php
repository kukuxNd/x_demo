<?php

class Utils {
    /**
     * 字符串处理工具类
     */
    class StringUtils {
        /**
         * 检查字符串是否为空
         */
        public static function isNullOrEmpty($str) {
            return empty($str) || trim($str) === '';
        }

        /**
         * 字符串反转
         */
        public static function reverse($str) {
            return strrev($str);
        }

        /**
         * 检查是否为有效邮箱
         */
        public static function isValidEmail($email) {
            return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
        }

        /**
         * 生成随机字符串
         */
        public static function randomString($length = 10) {
            $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
            $randomString = '';
            for ($i = 0; $i < $length; $i++) {
                $randomString .= $characters[rand(0, strlen($characters) - 1)];
            }
            return $randomString;
        }
    }

    /**
     * 日期时间处理工具类
     */
    class DateTimeUtils {
        /**
         * 获取当前时间戳（毫秒）
         */
        public static function getTimestamp() {
            return round(microtime(true) * 1000);
        }

        /**
         * 格式化日期时间
         */
        public static function formatDateTime($date, $format = 'Y-m-d H:i:s') {
            return date($format, strtotime($date));
        }

        /**
         * 计算两个日期之间的天数
         */
        public static function daysBetween($start, $end) {
            $start = strtotime($start);
            $end = strtotime($end);
            return round(($end - $start) / (60 * 60 * 24));
        }
    }

    /**
     * 文件操作工具类
     */
    class FileUtils {
        /**
         * 安全读取文件内容
         */
        public static function readFileContent($path) {
            try {
                if (!file_exists($path)) {
                    throw new Exception("文件不存在");
                }
                return file_get_contents($path);
            } catch (Exception $e) {
                error_log("读取文件失败: " . $e->getMessage());
                return '';
            }
        }

        /**
         * 安全写入文件
         */
        public static function writeFileContent($path, $content) {
            try {
                return file_put_contents($path, $content) !== false;
            } catch (Exception $e) {
                error_log("写入文件失败: " . $e->getMessage());
                return false;
            }
        }
    }

    /**
     * 数组操作工具类
     */
    class ArrayUtils {
        /**
         * 数组去重
         */
        public static function removeDuplicates($array) {
            return array_values(array_unique($array));
        }

        /**
         * 数组转字符串
         */
        public static function arrayToString($array, $separator = ',') {
            return implode($separator, $array);
        }

        /**
         * 安全获取数组值
         */
        public static function getSafeValue($array, $key, $default = null) {
            return isset($array[$key]) ? $array[$key] : $default;
        }
    }

    /**
     * 数值处理工具类
     */
    class NumberUtils {
        /**
         * 安全转换为整数
         */
        public static function parseInt($value, $default = 0) {
            return filter_var($value, FILTER_VALIDATE_INT) !== false ? (int)$value : $default;
        }

        /**
         * 生成随机数
         */
        public static function randomNumber($min, $max) {
            return rand($min, $max);
        }
    }

    /**
     * 安全工具类
     */
    class SecurityUtils {
        /**
         * MD5加密
         */
        public static function md5Hash($input) {
            return md5($input);
        }

        /**
         * 生成安全的密码哈希
         */
        public static function hashPassword($password) {
            return password_hash($password, PASSWORD_DEFAULT);
        }

        /**
         * 验证密码
         */
        public static function verifyPassword($password, $hash) {
            return password_verify($password, $hash);
        }
    }
}

// 测试代码
function runTests() {
    echo "=== 字符串工具测试 ===\n";
    $testStr = "Hello World";
    echo "原始字符串: " . $testStr . "\n";
    echo "反转后: " . Utils\StringUtils::reverse($testStr) . "\n";
    echo "邮箱验证: " . (Utils\StringUtils::isValidEmail("test@example.com") ? "有效" : "无效") . "\n";
    echo "随机字符串: " . Utils\StringUtils::randomString(8) . "\n";

    echo "\n=== 日期时间工具测试 ===\n";
    echo "当前时间戳: " . Utils\DateTimeUtils::getTimestamp() . "\n";
    echo "格式化日期: " . Utils\DateTimeUtils::formatDateTime('now') . "\n";
    echo "日期差异: " . Utils\DateTimeUtils::daysBetween('2023-01-01', '2023-12-31') . " 天\n";

    echo "\n=== 数组工具测试 ===\n";
    $numbers = [1, 2, 2, 3, 3, 4];
    echo "去重前: " . Utils\ArrayUtils::arrayToString($numbers) . "\n";
    echo "去重后: " . Utils\ArrayUtils::arrayToString(Utils\ArrayUtils::removeDuplicates($numbers)) . "\n";

    echo "\n=== 数值工具测试 ===\n";
    echo "随机数(1-100): " . Utils\NumberUtils::randomNumber(1, 100) . "\n";
    echo "字符串转数字: " . Utils\NumberUtils::parseInt("123") . "\n";

    echo "\n=== 安全工具测试 ===\n";
    $password = "test123";
    $hash = Utils\SecurityUtils::hashPassword($password);
    echo "MD5加密: " . Utils\SecurityUtils::md5Hash($password) . "\n";
    echo "密码哈希: " . $hash . "\n";
    echo "密码验证: " . (Utils\SecurityUtils::verifyPassword($password, $hash) ? "成功" : "失败") . "\n";
}

// 运行测试
runTests(); 