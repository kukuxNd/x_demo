import java.io.*;
import java.util.*;
import java.text.SimpleDateFormat;
import java.security.MessageDigest;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.*;

public class JavaUtilsDemo {
    
    // ===== 字符串工具 =====
    public static String reverseString(String str) {
        return new StringBuilder(str).reverse().toString();
    }
    
    public static String capitalize(String str) {
        if (str == null || str.isEmpty()) {
            return str;
        }
        return Character.toUpperCase(str.charAt(0)) + str.substring(1);
    }
    
    // ===== 集合操作 =====
    public static <T> List<T> removeDuplicates(List<T> list) {
        return new ArrayList<>(new LinkedHashSet<>(list));
    }
    
    public static <T> List<T> shuffle(List<T> list) {
        List<T> shuffled = new ArrayList<>(list);
        Collections.shuffle(shuffled);
        return shuffled;
    }
    
    // ===== 文件操作 =====
    public static String readFile(String filePath) throws IOException {
        StringBuilder content = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new FileReader(filePath))) {
            String line;
            while ((line = reader.readLine()) != null) {
                content.append(line).append("\n");
            }
        }
        return content.toString();
    }
    
    public static void writeFile(String filePath, String content) throws IOException {
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(filePath))) {
            writer.write(content);
        }
    }
    
    // ===== 日期时间工具 =====
    public static String formatDate(Date date, String pattern) {
        SimpleDateFormat sdf = new SimpleDateFormat(pattern);
        return sdf.format(date);
    }
    
    public static Date parseDate(String dateStr, String pattern) throws Exception {
        SimpleDateFormat sdf = new SimpleDateFormat(pattern);
        return sdf.parse(dateStr);
    }
    
    // ===== 加密工具 =====
    public static String md5Hash(String input) throws Exception {
        MessageDigest md = MessageDigest.getInstance("MD5");
        byte[] hashBytes = md.digest(input.getBytes(StandardCharsets.UTF_8));
        
        StringBuilder sb = new StringBuilder();
        for (byte b : hashBytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
    
    // ===== 并发工具 =====
    public static <T> Future<T> asyncTask(Callable<T> task) {
        ExecutorService executor = Executors.newSingleThreadExecutor();
        Future<T> future = executor.submit(task);
        executor.shutdown();
        return future;
    }
    
    // ===== 数学工具 =====
    public static int gcd(int a, int b) {
        return b == 0 ? a : gcd(b, a % b);
    }
    
    public static int lcm(int a, int b) {
        return Math.abs(a * b) / gcd(a, b);
    }
    
    // ===== JSON 工具 =====
    public static Map<String, Object> parseJson(String json) throws Exception {
        // 简单的 JSON 解析示例
        // 实际项目中建议使用 Jackson 或 Gson
        return new HashMap<>(); // 简化实现
    }
    
    // ===== 示例运行 =====
    public static void main(String[] args) {
        try {
            // 字符串操作示例
            System.out.println("=== 字符串操作 ===");
            String text = "Hello, Java!";
            System.out.println("原始字符串: " + text);
            System.out.println("反转: " + reverseString(text));
            System.out.println("首字母大写: " + capitalize("java"));
            
            // 集合操作示例
            System.out.println("\n=== 集合操作 ===");
            List<Integer> numbers = Arrays.asList(1, 2, 2, 3, 3, 4, 5);
            System.out.println("原始列表: " + numbers);
            System.out.println("去重后: " + removeDuplicates(numbers));
            System.out.println("打乱后: " + shuffle(numbers));
            
            // 文件操作示例
            System.out.println("\n=== 文件操作 ===");
            writeFile("test.txt", "Hello, File!");
            System.out.println("文件内容: " + readFile("test.txt"));
            
            // 日期时间示例
            System.out.println("\n=== 日期时间 ===");
            String now = formatDate(new Date(), "yyyy-MM-dd HH:mm:ss");
            System.out.println("当前时间: " + now);
            
            // 加密示例
            System.out.println("\n=== 加密 ===");
            System.out.println("MD5 hash: " + md5Hash("test"));
            
            // 并发示例
            System.out.println("\n=== 并发 ===");
            Future<String> future = asyncTask(() -> {
                Thread.sleep(1000);
                return "异步任务完成";
            });
            System.out.println(future.get());
            
            // 数学运算示例
            System.out.println("\n=== 数学运算 ===");
            System.out.println("GCD(12,18): " + gcd(12, 18));
            System.out.println("LCM(12,18): " + lcm(12, 18));
            
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
} 