type XfyunRole = 'system' | 'user' | 'assistant';

export interface XfyunMessage {
  role: XfyunRole;
  content: string;
}

interface XfyunChatResponse {
  code?: number;
  message?: string;
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

export class XfyunClient {
  private baseUrl: string;
  private apiPassword: string;
  private model: string;

  constructor() {
    this.baseUrl = process.env.XFYUN_BASE_URL || 'https://spark-api-open.xf-yun.com/x2/chat/completions';
    this.apiPassword = XfyunClient.getApiPassword();
    this.model = process.env.XFYUN_MODEL || 'spark-x';
  }

  static getApiPassword() {
    const apiKey = process.env.XFYUN_API_KEY || '';
    const apiSecret = process.env.XFYUN_API_SECRET || '';

    return process.env.XFYUN_API_PASSWORD || (apiKey && apiSecret ? `${apiKey}:${apiSecret}` : '');
  }

  static isConfigured() {
    return Boolean(XfyunClient.getApiPassword());
  }

  isConfigured() {
    return Boolean(this.apiPassword);
  }

  private normalizeMessages(messages: XfyunMessage[]) {
    const systemPrompt = messages
      .filter((message) => message.role === 'system')
      .map((message) => message.content)
      .join('\n\n');
    const chatMessages = messages.filter((message) => message.role !== 'system') as Array<{
      role: 'user' | 'assistant';
      content: string;
    }>;

    if (!systemPrompt) return chatMessages;
    if (chatMessages[0]?.role === 'user') {
      return [{ ...chatMessages[0], content: `${systemPrompt}\n\n用户问题：${chatMessages[0].content}` }, ...chatMessages.slice(1)];
    }

    return [{ role: 'user' as const, content: systemPrompt }, ...chatMessages];
  }

  async chat(messages: XfyunMessage[], options?: { temperature?: number; maxTokens?: number }): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('Xfyun Spark API is not configured. Set XFYUN_API_KEY and XFYUN_API_SECRET, or set XFYUN_API_PASSWORD.');
    }

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiPassword}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.model,
        messages: this.normalizeMessages(messages),
        temperature: options?.temperature ?? 0.45,
        max_tokens: options?.maxTokens ?? 1024
      })
    });

    const text = await response.text();
    let data: XfyunChatResponse | null = null;

    try {
      data = text ? (JSON.parse(text) as XfyunChatResponse) : null;
    } catch {
      data = null;
    }

    if (!response.ok) {
      throw new Error(`讯飞星火 API 请求失败：${response.status} ${text}`);
    }

    if (data?.code && data.code !== 0) {
      throw new Error(`讯飞星火 API 错误：${data.message ?? data.code}`);
    }

    return data?.choices?.[0]?.message?.content?.trim() || '暂时没有生成回复。';
  }
}

export const xfyunClient = new XfyunClient();
