// app/dashboard/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import Link from 'next/link';
import { useChat } from '@ai-sdk/react';
import ReactMarkdown from 'react-markdown';

export default function DashboardPage() {
  const [userData, setUserData] = useState<any>(null);
  const router = useRouter();
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/chat' // Your existing Perplexity API route
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push('/login');
      } else {
        try {
          const response = await fetch(`/api/users/${user.uid}`);
          if (response.ok) setUserData(await response.json());
        } catch (error) {
          console.error('Failed to fetch user data:', error);
        }
      }
    });
    return () => unsubscribe();
  }, [router]);

  return (
    <div className="dashboard min-h-screen p-8 max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Welcome, {userData?.email}</h1>
          <div className="security-section mt-2">
            {userData?.providers?.includes('password') ? (
              <p className="text-sm text-green-600">Account security: Password set ✔️</p>
            ) : (
              <Link href="/profile" className="text-blue-600 text-sm">
                Set up password for email login
              </Link>
            )}
          </div>
        </div>
        <button
          onClick={async () => {
            await auth.signOut();
            router.push('/');
          }}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Logout
        </button>

      </div>

      {/* Symptom Checker Chat Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Symptom Checker</h2>
        
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
                {m.role === 'user' ? 'You' : 'Medical Assistant'}
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
    </div>
  );
}