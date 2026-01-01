
/**
 * 使用 DeepSeek 官方 API 获取烹饪指导
 * API Base: https://api.deepseek.com
 * Model: deepseek-chat
 */
export const fetchCookingInstructions = async (recipeName: string, apiKey: string) => {
  if (!apiKey) {
    throw new Error('请先在设置中填写 DeepSeek API Key');
  }

  // 优化 Prompt：强调一人份、精确到克
  const prompt = `我是厨房新手，请告诉我【${recipeName}】的**一人份**详细做法。
要求：
1. 食材和调料用量必须**精确到克(g)或毫升(ml)**，不要用"适量"、"少许"。
2. 步骤简明扼要。
3. 提供1个核心避坑点。

请严格按照以下格式回答：
【一人份食材】
- ... (精确重量)
【步骤】
1. ...
2. ...
【避坑】
...`;

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: '你是一位严谨的专业大厨，擅长量化烹饪。' },
          { role: 'user', content: prompt }
        ],
        stream: false,
        max_tokens: 1024,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'DeepSeek API 请求失败');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error: any) {
    console.error('DeepSeek API Error:', error);
    throw error;
  }
};

/**
 * AI 探索厨房：根据输入判断是食材推荐还是具体菜谱
 */
export const exploreAiKitchen = async (input: string, apiKey: string) => {
  if (!apiKey) {
    throw new Error('请先在设置中填写 DeepSeek API Key');
  }

  const prompt = `分析用户输入: "${input}"。
  
  任务逻辑：
  1. 如果输入像是**食材列表**（如"土豆 牛肉"、"鸡蛋"）：
     请推荐 3-5 道适合用这些食材制作的菜名。
     返回格式：JSON Object { "type": "list", "items": ["菜名1", "菜名2", ...] }
     
  2. 如果输入像是**具体菜名**（如"红烧肉"、"清蒸鱼"）：
     请直接提供一人份的精确烹饪步骤（要求同上：精确到克，简明步骤）。
     返回格式：JSON Object { "type": "instruction", "content": "...(烹饪步骤文本)..." }

  注意：**必须只返回 JSON 字符串**，不要包含 markdown 标记或其他文本。`;

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: '你是一个智能厨房助手。请严格输出 JSON 格式。' },
          { role: 'user', content: prompt }
        ],
        stream: false,
        max_tokens: 1500,
        temperature: 0.7,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'DeepSeek API 请求失败');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    try {
        return JSON.parse(content);
    } catch (e) {
        console.error("JSON Parse Error", e, content);
        throw new Error("AI 返回格式异常，请重试");
    }
  } catch (error: any) {
    console.error('DeepSeek Explore API Error:', error);
    throw error;
  }
};
