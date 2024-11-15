#!/usr/bin/env ruby
# encoding: utf-8

require 'json'
require 'digest'
require 'fileutils'
require 'date'
require 'benchmark'

module DemoUtils
  # 字符串工具模块
  module StringUtils
    def self.reverse(str)
      str.to_s.reverse
    end

    def self.md5(str)
      Digest::MD5.hexdigest(str.to_s)
    end

    def self.valid_email?(email)
      email =~ /\A[\w+\-.]+@[a-z\d\-]+(\.[a-z\d\-]+)*\.[a-z]+\z/i
    end

    def self.to_camel_case(str)
      str.split('_').map(&:capitalize).join
    end
  end

  # 文件工具模块
  module FileUtils
    def self.read_text(path)
      File.read(path)
    rescue => e
      puts "读取文件错误: #{e.message}"
      nil
    end

    def self.write_text(path, content)
      File.write(path, content)
      true
    rescue => e
      puts "写入文件错误: #{e.message}"
      false
    end

    def self.list_files(dir, pattern = '*')
      Dir.glob(File.join(dir, '**', pattern))
    end
  end

  # 日期时间工具模块
  module DateTimeUtils
    def self.timestamp
      Time.now.to_i
    end

    def self.format_date(date = Time.now)
      date.strftime('%Y-%m-%d %H:%M:%S')
    end

    def self.parse_date(str)
      DateTime.parse(str)
    rescue => e
      puts "解析日期错误: #{e.message}"
      nil
    end
  end

  # 数组工具模块
  module ArrayUtils
    def self.shuffle(arr)
      arr.shuffle
    end

    def self.unique(arr)
      arr.uniq
    end

    def self.group_by_key(arr, key)
      arr.group_by { |item| item[key] }
    end
  end

  # 数学工具模块
  module MathUtils
    def self.gcd(a, b)
      b.zero? ? a : gcd(b, a % b)
    end

    def self.lcm(a, b)
      (a * b) / gcd(a, b)
    end

    def self.prime?(num)
      return false if num <= 1
      2.upto(Math.sqrt(num).to_i) do |i|
        return false if num % i == 0
      end
      true
    end
  end

  # JSON工具模块
  module JsonUtils
    def self.to_json(obj)
      JSON.generate(obj)
    rescue => e
      puts "JSON序列化错误: #{e.message}"
      nil
    end

    def self.from_json(json_str)
      JSON.parse(json_str)
    rescue => e
      puts "JSON解析错误: #{e.message}"
      nil
    end
  end

  # 性能测试模块
  module BenchmarkUtils
    def self.measure(title)
      result = Benchmark.measure { yield }
      puts "#{title}: #{result.real.round(3)}s"
      result
    end
  end

  # 示例类
  class Person
    attr_accessor :name, :age

    def initialize(name, age)
      @name = name
      @age = age
    end

    def to_s
      "Person(name=#{@name}, age=#{@age})"
    end
  end
end

# 使用示例
if __FILE__ == $0
  include DemoUtils

  puts "=== 字符串工具示例 ==="
  str = "Hello, Ruby!"
  puts "原始字符串: #{str}"
  puts "反转: #{StringUtils.reverse(str)}"
  puts "MD5: #{StringUtils.md5(str)}"
  puts "邮箱验证: #{StringUtils.valid_email?('test@example.com')}"

  puts "\n=== 文件操作示例 ==="
  FileUtils.write_text('test.txt', '测试内容')
  content = FileUtils.read_text('test.txt')
  puts "文件内容: #{content}"

  puts "\n=== 日期时间示例 ==="
  puts "当前时间戳: #{DateTimeUtils.timestamp}"
  puts "格式化日期: #{DateTimeUtils.format_date}"

  puts "\n=== 数组操作示例 ==="
  arr = [1, 2, 3, 4, 5]
  puts "打乱数组: #{ArrayUtils.shuffle(arr)}"
  puts "去重: #{ArrayUtils.unique([1, 1, 2, 2, 3])}"

  puts "\n=== 数学工具示例 ==="
  puts "GCD(12,18): #{MathUtils.gcd(12, 18)}"
  puts "是否质数(17): #{MathUtils.prime?(17)}"

  puts "\n=== JSON操作示例 ==="
  person = Person.new("张三", 25)
  json = JsonUtils.to_json({ person: person })
  puts "JSON序列化: #{json}"

  puts "\n=== 性能测试示例 ==="
  BenchmarkUtils.measure("休眠测试") { sleep(1) }
end 