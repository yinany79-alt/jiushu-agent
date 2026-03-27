import { NextRequest } from 'next/server';

const config = {
  baseUrl: process.env.AUTOBOATS_API_BASE_URL || 'http://autobots-bk.jd.local',
  agentId: process.env.AUTOBOATS_AGENT_ID || '',
  token: process.env.AUTOBOATS_TOKEN || '',
  erp: process.env.AUTOBOATS_ERP || 'bjwangjuntao',
};

function generateTraceId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'trace-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

function generateReqId(): string {
  return String(Date.now());
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const { message } = await req.json();

    const traceId = generateTraceId();
    const reqId = generateReqId();

    const body = {
      traceId,
      reqId,
      erp: config.erp,
      keyword: message,
    };

    console.log('[Autobots API] Calling with:', {
      url: `${config.baseUrl}/autobots/api/v1/searchAiSse`,
      agentId: config.agentId ? (config.agentId.substring(0, 8) + '...') : 'NOT SET',
      erp: config.erp,
      keyword: message,
    });

    const response = await fetch(`${config.baseUrl}/autobots/api/v1/searchAiSse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'autobots-agent-id': config.agentId,
        'autobots-token': config.token,
      },
      body: JSON.stringify(body),
    });

    console.log('[Autobots API] Response status:', response.status, 'time to first byte:', Date.now() - startTime, 'ms');

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Autobots API] Error response:', errorText);
      return new Response(`API error: ${response.status} - ${errorText}`, { status: response.status });
    }

    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    const reader = response.body?.getReader();

    if (!reader) {
      return new Response('No response body', { status: 500 });
    }

    let lastSentLength = 0;
    let finalContent = '';

    const stream = new ReadableStream({
      async start(controller) {
        let buffer = '';
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmedLine = line.trim();
              if (!trimmedLine) continue;
              if (trimmedLine.startsWith(':')) continue;

              let dataStr = trimmedLine;
              if (trimmedLine.startsWith('data: ')) {
                dataStr = trimmedLine.slice(6);
              } else if (trimmedLine.startsWith('data:')) {
                dataStr = trimmedLine.slice(5);
              }

              if (dataStr === '[DONE]') continue;
              if (!dataStr.trim()) continue;

              try {
                const parsed = JSON.parse(dataStr);

                let content = '';
                if (parsed.data && parsed.data.responseAll) {
                  content = parsed.data.responseAll;
                } else if (parsed.data && parsed.data.response) {
                  content = parsed.data.response;
                } else if (parsed.responseAll) {
                  content = parsed.responseAll;
                } else if (parsed.response) {
                  content = parsed.response;
                }

                if (content && content.length > lastSentLength) {
                  const newContent = content.slice(lastSentLength);
                  controller.enqueue(encoder.encode(newContent));
                  lastSentLength = content.length;
                  finalContent = content;
                }
              } catch (e) {
                // 忽略解析错误
              }
            }
          }
        } finally {
          reader.releaseLock();
          controller.close();
        }
      },
    });

    console.log('[Autobots API] Streaming done:', {
      contentLength: finalContent.length,
      totalTime: (Date.now() - startTime) + 'ms',
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error: any) {
    const totalTime = Date.now() - startTime;
    console.error('[Autobots API] Error after', totalTime + 'ms:', error);
    return new Response(`Internal server error: ${error}`, { status: 500 });
  }
}
