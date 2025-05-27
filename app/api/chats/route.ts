import { NextRequest, NextResponse } from 'next/server';
import { getChatHistory, saveChatSession, updateChatSession } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email');
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

  try {
    const history = await getChatHistory(email);
    // Attach sessionId for frontend use
    const withIds = history.map((h: any) => ({
      ...h,
      sessionId: h._id?.toString(),
    }));
    return NextResponse.json(withIds);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { email, messages, sessionId } = await request.json();
  if (!email || !messages) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  const hasUserMessage = messages.some(
    (m: any) => m.role === 'user' && m.content && m.content.trim() !== ''
  );
  if (!hasUserMessage) {
    return NextResponse.json({ success: false, reason: 'No user message' });
  }

  try {
    if (sessionId) {
      await updateChatSession(sessionId, messages);
      return NextResponse.json({ success: true, sessionId });
    } else {
      const newSessionId = await saveChatSession(email, messages);
      return NextResponse.json({ success: true, sessionId: newSessionId });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save session' }, { status: 500 });
  }
}
