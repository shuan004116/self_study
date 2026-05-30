import requests

# ------------ 这里换成你自己的信息 ------------
API_KEY = "ark-832ec373-390b-4507-a1b6-9ee2c55a2dc9-27387"  # 你在火山方舟生成的API Key
MODEL_ID = "doubao-seed-2-0-mini-260215"
API_URL = "https://ark.cn-beijing.volces.com/api/v3/chat/completions"
# --------------------------------------------

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

data = {
    "model": MODEL_ID,
    "messages": [
        {"role": "system", "content": "你是一个专业的Python程序员，写简洁、可运行的代码。"},
        {"role": "user", "content": "帮我写一个Python冒泡排序的代码"}
    ]
}

response = requests.post(API_URL, headers=headers, json=data)

if response.status_code == 200:
    result = response.json()
    print("=== 豆包API返回结果 ===")
    print(result["choices"][0]["message"]["content"])
else:
    print(f"请求失败，状态码：{response.status_code}")
    print("错误信息：", response.text)