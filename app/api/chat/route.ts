// app/api/chat/route.ts
import { perplexity } from '@ai-sdk/perplexity';
import { streamText } from 'ai';

export const maxDuration = 30; // seconds
const systemPrompt = `
You are a friendly AI assistant. When a user greets you (e.g., "Hey", "Hi", "Hello"), respond with a friendly greeting. Do not provide information about products or services unless the user asks specifically.
`;

export async function POST(req: Request) {
  const { messages } = await req.json();
  const fullMessages = [
    { role: "system", content: systemPrompt },
    ...messages,
  ];
  const result = streamText({
    model: perplexity('llama-3.1-sonar-large-128k-online'),
    messages: fullMessages,
  });
  return result.toDataStreamResponse();
}
