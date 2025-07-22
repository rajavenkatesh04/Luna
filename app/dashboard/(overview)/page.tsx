// app/(dashboard)/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/app/lib/firebase';
import { logout } from '@/app/lib/actions';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
            } else {
                // If no user is logged in, redirect to the login page
                router.push('/login');
            }
            setIsLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [router]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>Loading...</p>
            </div>
        );
    }

    if (!user) {
        // This state is briefly hit before the redirect happens
        return null;
    }

    return (
        <div className="p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">
                        Welcome, {user.displayName || 'User'}!
                    </h1>
                    <form action={logout}>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                        >
                            Log Out
                        </button>
                    </form>
                </div>
                <div className=" p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Your Dashboard</h2>
                    <p>This is your protected dashboard. Only logged-in users can see this.</p>
                    <p className="mt-2">Your email: {user.email}</p>
                </div>
            </div>
        </div>
    );
}