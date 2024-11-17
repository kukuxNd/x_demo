Imports System
Imports System.IO
Imports System.Text
Imports System.Security.Cryptography
Imports System.Collections.Generic
Imports System.Threading.Tasks

Public Class VBUtilsDemo
    ' ===== 字符串工具 =====
    Public Shared Function ReverseString(ByVal str As String) As String
        Dim charArray() As Char = str.ToCharArray()
        Array.Reverse(charArray)
        Return New String(charArray)
    End Function

    Public Shared Function Capitalize(ByVal str As String) As String
        If String.IsNullOrEmpty(str) Then Return str
        Return Char.ToUpper(str.Chars(0)) & str.Substring(1)
    End Function

    ' ===== 集合操作 =====
    Public Shared Function RemoveDuplicates(Of T)(ByVal list As List(Of T)) As List(Of T)
        Return New List(Of T)(New HashSet(Of T)(list))
    End Function

    Public Shared Function ShuffleList(Of T)(ByVal list As List(Of T)) As List(Of T)
        Dim rng As New Random()
        Dim shuffled As New List(Of T)(list)
        Dim n As Integer = shuffled.Count
        While n > 1
            n -= 1
            Dim k As Integer = rng.Next(n + 1)
            Dim temp As T = shuffled(k)
            shuffled(k) = shuffled(n)
            shuffled(n) = temp
        End While
        Return shuffled
    End Function

    ' ===== 文件操作 =====
    Public Shared Function ReadFile(ByVal filePath As String) As String
        Return File.ReadAllText(filePath)
    End Function

    Public Shared Sub WriteFile(ByVal filePath As String, ByVal content As String)
        File.WriteAllText(filePath, content)
    End Sub

    ' ===== 日期时间工具 =====
    Public Shared Function FormatDate(ByVal dt As DateTime, ByVal format As String) As String
        Return dt.ToString(format)
    End Function

    Public Shared Function ParseDate(ByVal dateStr As String, ByVal format As String) As DateTime
        Return DateTime.ParseExact(dateStr, format, Nothing)
    End Function

    ' ===== 加密工具 =====
    Public Shared Function MD5Hash(ByVal input As String) As String
        Using md5 As MD5 = MD5.Create()
            Dim inputBytes As Byte() = Encoding.UTF8.GetBytes(input)
            Dim hashBytes As Byte() = md5.ComputeHash(inputBytes)
            Return BitConverter.ToString(hashBytes).Replace("-", "").ToLower()
        End Using
    End Function

    ' ===== 异步操作 =====
    Public Shared Async Function AsyncOperation() As Task(Of String)
        Await Task.Delay(1000)
        Return "异步操作完成"
    End Function

    ' ===== 数学工具 =====
    Public Shared Function GCD(ByVal a As Integer, ByVal b As Integer) As Integer
        While b <> 0
            Dim temp As Integer = b
            b = a Mod b
            a = temp
        End While
        Return a
    End Function

    Public Shared Function LCM(ByVal a As Integer, ByVal b As Integer) As Integer
        Return Math.Abs(a * b) \ GCD(a, b)
    End Function

    ' ===== 主程序 =====
    Public Shared Sub Main()
        Try
            ' 字符串操作示例
            Console.WriteLine("=== 字符串操作 ===")
            Dim text As String = "Hello, VB.NET!"
            Console.WriteLine($"原始字符串: {text}")
            Console.WriteLine($"反转: {ReverseString(text)}")
            Console.WriteLine($"首字母大写: {Capitalize("vb.net")}")

            ' 集合操作示例
            Console.WriteLine(vbNewLine & "=== 集合操作 ===")
            Dim numbers As New List(Of Integer) From {1, 2, 2, 3, 3, 4, 5}
            Console.WriteLine($"原始列表: {String.Join(", ", numbers)}")
            Console.WriteLine($"去重后: {String.Join(", ", RemoveDuplicates(numbers))}")
            Console.WriteLine($"打乱后: {String.Join(", ", ShuffleList(numbers))}")

            ' 文件操作示例
            Console.WriteLine(vbNewLine & "=== 文件操作 ===")
            WriteFile("test.txt", "Hello, File!")
            Console.WriteLine($"文件内容: {ReadFile("test.txt")}")

            ' 日期时间示例
            Console.WriteLine(vbNewLine & "=== 日期时间 ===")
            Console.WriteLine($"当前时间: {FormatDate(DateTime.Now, "yyyy-MM-dd HH:mm:ss")}")

            ' 加密示例
            Console.WriteLine(vbNewLine & "=== 加密 ===")
            Console.WriteLine($"MD5 hash: {MD5Hash("test")}")

            ' 异步操作示例
            Console.WriteLine(vbNewLine & "=== 异步操作 ===")
            Dim result = AsyncOperation().Result
            Console.WriteLine(result)

            ' 数学运算示例
            Console.WriteLine(vbNewLine & "=== 数学运算 ===")
            Console.WriteLine($"GCD(12,18): {GCD(12, 18)}")
            Console.WriteLine($"LCM(12,18): {LCM(12, 18)}")

        Catch ex As Exception
            Console.WriteLine($"错误: {ex.Message}")
        End Try
    End Sub
End Class 