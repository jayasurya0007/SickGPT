'use client';
import { useChat } from '@ai-sdk/react';
import ReactMarkdown from 'react-markdown';
import { useEffect } from 'react';

export default function ChatInterface({
  email,
  initialMessages,
  sessionId,
  onSessionId,
}: {
  email?: string;
  initialMessages?: any[];
  sessionId?: string;
  onSessionId?: (id: string) => void;
}) {
  const {
    messages,
    setMessages,
    input,
    handleInputChange,
    handleSubmit,
  } = useChat({
    api: '/api/chat',
    onFinish: async () => {
      if (!email) return;
      const hasUserMessage = messages.some(
        m => m.role === 'user' && m.content.trim() !== ''
      );
      if (!hasUserMessage) return;
      try {
        const res = await fetch('/api/chats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, messages, sessionId }),
        });
        const data = await res.json();
        if (data.sessionId && onSessionId) {
          onSessionId(data.sessionId);
        }
      } catch (error) {
        console.error('Failed to save chat:', error);
      }
    },
  });

  // Load previous session's messages if provided
  useEffect(() => {
    if (initialMessages && initialMessages.length > 0) {
      setMessages(initialMessages);
    } else {
      setMessages([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMessages]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Symptom Checker</h2>
      <div className="chat-container h-96 overflow-y-auto mb-4 p-4 bg-gray-50 rounded-lg">
        {messages.map((m, idx) => (
          <div
            key={m.id || idx}
            className={`mb-4 p-3 rounded-lg ${
              m.role === 'user'
                ? 'ml-auto bg-blue-100 max-w-[80%]'
                : 'bg-gray-100 max-w-[90%]'
            }`}
          >
            <div className="text-sm font-medium text-gray-600 mb-1">
              {m.role === 'user' ? 'You' : 'Medical Assistant'}
            </div>
            {m.role === 'assistant' ? (
              <ReactMarkdown>{m.content}</ReactMarkdown>
            ) : (
              <p className="text-gray-800">{m.content}</p>
            )}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={input}
          placeholder="Describe your symptoms (e.g. 'I have had a headache and fever for 2 days')"
          onChange={handleInputChange}
        />
        <button
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          type="submit"
        >
          Send
        </button>
      </form>
    </div>
  );
}
