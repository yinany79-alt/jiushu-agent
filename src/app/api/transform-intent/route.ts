import { NextRequest } from 'next/server';

const config = {
  baseUrl: process.env.DEEPSEEK_API_BASE_URL || 'http://llm-gw.jd.local/v1',
  apiKey: process.env.DEEPSEEK_API_KEY || 'b382250fef694e0dbadca99148a5acaa',
  model: process.env.DEEPSEEK_MODEL || 'DeepSeek-V3-2',
};

const TRANSFORMER_PROMPT = `[System Context]
你是一个算法任务转译专家。

[Task]
请分析以下对话中的技术路径，将其转化为一句话的执行指令。

[Constraints]
1. 必须以"帮我..."开头。
2. 必须包含核心参数：任务类型（推理/微调）、资源要求、模型名称。
3. 剔除解释性文字，只保留动作指令。
4. 输出格式：直接输出执行指令，不要包含任何其他内容。`;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const { messages } = await req.json();

    // Format conversation history
    const conversationText = messages
      .map((msg: Message) => `${msg.role === 'user' ? '用户' : 'AI'}: ${msg.content}`)
      .join('\n\n');

    const requestBody = {
      model: config.model,
      messages: [
        {
          role: 'system',
          content: TRANSFORMER_PROMPT,
        },
        {
          role: 'user',
          content: `请分析以下对话并生成执行指令：\n\n${conversationText}`,
        },
      ],
      stream: false,
      temperature: 0.3,
      max_tokens: 500,
    };

    console.log('[Transform Intent API] Calling DeepSeek:', {
      url: `${config.baseUrl}/chat/completions`,
      model: config.model,
      messagesLength: messages.length,
    });

    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    console.log('[Transform Intent API] Response status:', response.status, 'time:', Date.now() - startTime, 'ms');

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Transform Intent API] Error:', errorText);
      return new Response(`API error: ${response.status} - ${errorText}`, { status: response.status });
    }

    const data = await response.json();
    const transformedPrompt = data.choices?.[0]?.message?.content || '';

    // Clean up the prompt (remove any extra whitespace)
    const cleanPrompt = transformedPrompt.trim();

    console.log('[Transform Intent API] Success:', {
      promptLength: cleanPrompt.length,
      totalTime: Date.now() - startTime + 'ms',
    });

    return new Response(JSON.stringify({ prompt: cleanPrompt }), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    const totalTime = Date.now() - startTime;
    console.error('[Transform Intent API] Error after', totalTime + 'ms:', error);
    return new Response(`Internal server error: ${error}`, { status: 500 });
  }
}
