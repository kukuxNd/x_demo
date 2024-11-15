-module(demo_utils).
-export([
    % 字符串工具
    reverse_string/1,
    to_upper/1,
    to_lower/1,
    split_string/2,
    join_string/2,
    
    % 列表操作
    list_sum/1,
    list_average/1,
    list_shuffle/1,
    list_unique/1,
    
    % 数学工具
    gcd/2,
    lcm/2,
    is_prime/1,
    factorial/1,
    
    % 文件操作
    read_file/1,
    write_file/2,
    list_dir/1,
    
    % 日期时间
    timestamp/0,
    format_datetime/0,
    format_datetime/1,
    
    % 进程工具
    spawn_monitor_process/1,
    process_info_collector/0,
    
    % 示例运行
    run_examples/0
]).

%% ===== 字符串工具 =====

reverse_string(String) ->
    lists:reverse(String).

to_upper(String) ->
    string:uppercase(String).

to_lower(String) ->
    string:lowercase(String).

split_string(String, Delimiter) ->
    string:split(String, Delimiter, all).

join_string(List, Delimiter) ->
    string:join(List, Delimiter).

%% ===== 列表操作 =====

list_sum(List) ->
    lists:sum(List).

list_average(List) ->
    Sum = list_sum(List),
    Length = length(List),
    case Length of
        0 -> 0;
        _ -> Sum / Length
    end.

list_shuffle(List) ->
    [X || {_, X} <- lists:sort([{rand:uniform(), N} || N <- List])].

list_unique(List) ->
    sets:to_list(sets:from_list(List)).

%% ===== 数学工具 =====

gcd(A, 0) -> A;
gcd(A, B) -> gcd(B, A rem B).

lcm(A, B) ->
    abs(A * B) div gcd(A, B).

is_prime(N) when N < 2 -> false;
is_prime(2) -> true;
is_prime(N) ->
    Sqrt = trunc(math:sqrt(N)),
    not lists:any(fun(I) -> N rem I =:= 0 end, lists:seq(2, Sqrt)).

factorial(0) -> 1;
factorial(N) when N > 0 -> N * factorial(N-1).

%% ===== 文件操作 =====

read_file(Filename) ->
    case file:read_file(Filename) of
        {ok, Binary} -> {ok, binary_to_list(Binary)};
        Error -> Error
    end.

write_file(Filename, Content) ->
    file:write_file(Filename, Content).

list_dir(Dir) ->
    case file:list_dir(Dir) of
        {ok, Files} -> {ok, Files};
        Error -> Error
    end.

%% ===== 日期时间 =====

timestamp() ->
    erlang:system_time(second).

format_datetime() ->
    format_datetime(calendar:local_time()).

format_datetime({{Year, Month, Day}, {Hour, Minute, Second}}) ->
    lists:flatten(io_lib:format("~4..0w-~2..0w-~2..0w ~2..0w:~2..0w:~2..0w",
                               [Year, Month, Day, Hour, Minute, Second])).

%% ===== 进程工具 =====

spawn_monitor_process(Fun) ->
    spawn_monitor(Fun).

process_info_collector() ->
    receive
        {get_info, Pid, Ref} ->
            Info = erlang:process_info(self()),
            Pid ! {Ref, Info},
            process_info_collector();
        stop ->
            ok
    end.

%% ===== 性能计时器 =====

measure_time(Fun) ->
    Start = erlang:monotonic_time(microsecond),
    Result = Fun(),
    End = erlang:monotonic_time(microsecond),
    {Result, End - Start}.

%% ===== 示例运行 =====

run_examples() ->
    io:format("=== 字符串工具示例 ===~n"),
    String = "Hello, Erlang!",
    io:format("原始字符串: ~p~n", [String]),
    io:format("反转: ~p~n", [reverse_string(String)]),
    io:format("大写: ~p~n", [to_upper(String)]),
    io:format("分割: ~p~n", [split_string(String, ", ")]),
    
    io:format("~n=== 列表操作示例 ===~n"),
    List = [1, 2, 3, 4, 5],
    io:format("列表: ~p~n", [List]),
    io:format("求和: ~p~n", [list_sum(List)]),
    io:format("平均值: ~p~n", [list_average(List)]),
    io:format("打乱: ~p~n", [list_shuffle(List)]),
    
    io:format("~n=== 数学工具示例 ===~n"),
    io:format("GCD(12,18): ~p~n", [gcd(12, 18)]),
    io:format("LCM(12,18): ~p~n", [lcm(12, 18)]),
    io:format("是否质数(17): ~p~n", [is_prime(17)]),
    io:format("阶乘(5): ~p~n", [factorial(5)]),
    
    io:format("~n=== 文件操作示例 ===~n"),
    write_file("test.txt", "测试内容"),
    case read_file("test.txt") of
        {ok, Content} ->
            io:format("文件内容: ~p~n", [Content]);
        _ ->
            io:format("读取文件失败~n")
    end,
    
    io:format("~n=== 日期时间示例 ===~n"),
    io:format("当前时间戳: ~p~n", [timestamp()]),
    io:format("格式化日期: ~p~n", [format_datetime()]),
    
    io:format("~n=== 性能测试示例 ===~n"),
    {_, Time} = measure_time(fun() -> timer:sleep(1000) end),
    io:format("休眠测试耗时: ~p 微秒~n", [Time]),
    
    io:format("~n=== 进程示例 ===~n"),
    {Pid, _} = spawn_monitor_process(fun() -> 
        io:format("子进程PID: ~p~n", [self()]),
        timer:sleep(100)
    end),
    io:format("创建的进程ID: ~p~n", [Pid]),
    
    ok. 