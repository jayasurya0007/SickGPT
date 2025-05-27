// app/page.tsx - Home page with chat and login/signup
'use client';
import { useEffect, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { auth } from '@/lib/firebase';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [promptCount, setPromptCount] = useState(0);
  const router = useRouter();
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/chat',
  });

  // Redirect logged-in users to dashboard
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) router.push('/dashboard');
    });
    return () => unsubscribe();
  }, [router]);

  // Load prompt count from localStorage
  useEffect(() => {
    const savedCount = localStorage.getItem('promptCount');
    setPromptCount(savedCount ? parseInt(savedCount) : 0);
  }, []);

  // Save prompt count to localStorage
  useEffect(() => {
    localStorage.setItem('promptCount', promptCount.toString());
  }, [promptCount]);

  const handleChatSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (promptCount >= 3) {
      e.preventDefault();
      alert('Please log in or sign up to continue using the chatbot.');
      return;
    }
    
    setPromptCount(prev => prev + 1);
    handleSubmit(e);
  };

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Welcome to Health Assistant</h1>
        <div className="flex gap-4">
          <Link
            href="/login"
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Sign Up
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Health Assistant</h2>

        {promptCount >= 3 && (
          <div className="mb-4 p-4 bg-yellow-100 rounded-lg">
            <p className="text-yellow-800">
              You've used all 3 free prompts. Please{' '}
              <Link href="/login" className="text-blue-600 underline">
                log in
              </Link>{' '}
              or{' '}
              <Link href="/signup" className="text-blue-600 underline">
                sign up
              </Link>{' '}
              to continue.
            </p>
          </div>
        )}

        <div className="chat-container h-96 overflow-y-auto mb-4 p-4 bg-gray-50 rounded-lg">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`mb-4 p-3 rounded-lg ${
                m.role === 'user' 
                  ? 'ml-auto bg-blue-100 max-w-[80%]' 
                  : 'bg-gray-100 max-w-[90%]'
              }`}
            >
              <div className="text-sm font-medium text-gray-600 mb-1">
                {m.role === 'user' ? 'You' : 'Health Assistant'}
              </div>
              {m.role === 'assistant' ? (
                <ReactMarkdown>
                  {m.content}
                </ReactMarkdown>
              ) : (
                <p className="text-gray-800">{m.content}</p>
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleChatSubmit} className="flex gap-2">
          <input
            className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            value={input}
            placeholder="Describe your health concerns..."
            onChange={handleInputChange}
            disabled={promptCount >= 3}
          />
          <button
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            type="submit"
            disabled={promptCount >= 3}
          >
            Send
          </button>
        </form>
      </div>
    </main>
  );
}