// app/dashboard/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import Link from 'next/link';
import ChatInterface from '@/app/components/ChatInterface';

export default function DashboardPage() {
  const [userData, setUserData] = useState<any>(null);
  const router = useRouter();

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

      <ChatInterface />
    </div>
  );
}