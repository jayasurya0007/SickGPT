'use client';
import { useEffect, useState } from 'react';

type ChatSession = {
  messages: { role: string; content: string }[];
  createdAt: string;
  updatedAt: string;
  sessionId: string;
};

export default function ChatHistory({
  email,
  onSelect,
  activeSessionId,
}: {
  email: string;
  onSelect: (session: { messages: any[]; sessionId: string }) => void;
  activeSessionId?: string;
}) {
  const [history, setHistory] = useState<ChatSession[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!email) return;
      try {
        const response = await fetch(`/api/chats?email=${encodeURIComponent(email)}`);
        if (response.ok) setHistory(await response.json());
      } catch (error) {
        console.error('History fetch failed:', error);
      }
    };
    fetchHistory();
  }, [email]);

  // Only show sessions with at least one user message
  const filteredHistory = history.filter(
    session => session.messages.some(m => m.role === 'user' && m.content.trim() !== '')
  );

  return (
    <div className="w-72 bg-gray-50 p-4 rounded-lg h-[calc(100vh-4rem)] flex flex-col">
      <h3 className="text-lg font-semibold mb-4">Chat History</h3>
      <div className="space-y-2 overflow-y-auto flex-1">
        {filteredHistory.length === 0 && (
          <div className="text-gray-400 text-sm">No previous chats.</div>
        )}
        {filteredHistory.map((session, i) => (
          <div
            key={session.sessionId}
            className={`p-3 bg-white rounded-lg cursor-pointer hover:bg-gray-100 transition-colors
              ${activeSessionId === session.sessionId ? 'border border-blue-400' : ''}`}
            onClick={() => onSelect({ messages: session.messages, sessionId: session.sessionId })}
          >
            <div className="text-sm text-gray-600">
              {new Date(session.createdAt).toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 truncate">
              {session.messages.find(m => m.role === 'user')?.content || 'New conversation'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
