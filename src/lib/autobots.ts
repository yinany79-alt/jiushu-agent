// Autobots API 类型定义
export interface AutobotsRequest {
  traceId: string;
  reqId: string;
  erp: string;
  keyword: string;
}

export interface AutobotsConfig {
  baseUrl: string;
  agentId: string;
  token: string;
  erp: string;
}

// 生成 traceId
export function generateTraceId(): string {
  return crypto.randomUUID();
}

// 生成 reqId
export function generateReqId(): string {
  return String(Date.now());
}

// SSE 解析
export function parseSSEChunk(chunk: string): string | null {
  const lines = chunk.split('\n');
  let data = '';

  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const content = line.slice(6);
      if (content === '[DONE]') continue;
      try {
        const parsed = JSON.parse(content);
        if (parsed.content) {
          data += parsed.content;
        }
      } catch {
        data += content;
      }
    } else if (line.trim() && !line.startsWith(':')) {
      data += line;
    }
  }

  return data || null;
}
