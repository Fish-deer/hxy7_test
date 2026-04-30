import OpenAI from 'openai';

const shouldUseDeepSeek =
  Boolean(process.env.DEEPSEEK_API_KEY) &&
  !process.env.OPENAI_API_KEY &&
  (!process.env.OPENAI_BASE_URL || process.env.OPENAI_BASE_URL === 'https://api.openai.com/v1');

export const openai = new OpenAI({
  baseURL: shouldUseDeepSeek ? 'https://api.deepseek.com/v1' : process.env.OPENAI_BASE_URL,
  apiKey: process.env.OPENAI_API_KEY || process.env.DEEPSEEK_API_KEY || 'demo-key'
});
