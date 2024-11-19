import requests
import json

url = 'http://127.0.0.1:11434/api/generate'
data = {
    'model': 'phi3',
    'prompt': 'Hello, this is a test.',
    'max_tokens': 50
}

def process_response(response):
    # 按行处理返回的数据
    for line in response.iter_lines():
        if line:
            try:
                result = json.loads(line)
                if 'response' in result:
                    print(result['response'], end='')
            except json.JSONDecodeError as e:
                print(f"JSON 解析错误: {e}")
    print()  # 打印换行

while True:
    try:
        response = requests.post(url, json=data, stream=True)
        process_response(response)
        
        user_input = input("\n请输入问题(输入'q'退出):")
        if user_input.lower() == 'q':
            break
            
        data['prompt'] = user_input
        
    except Exception as e:
        print(f"发生错误: {e}")
        break