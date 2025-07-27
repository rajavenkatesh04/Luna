// app/debug/auth-debug.tsx
'use client';

import { useAuth } from '@/app/lib/auth-context';
import { auth } from '@/app/lib/firebase';

export default function AuthDebug() {
    const { user, loading } = useAuth();

    const checkAuthStatus = async () => {
        console.log('=== AUTH DEBUG ===');
        console.log('Current user from context:', user);
        console.log('Loading state:', loading);
        console.log('Firebase auth current user:', auth.currentUser);

        if (auth.currentUser) {
            try {
                const token = await auth.currentUser.getIdToken();
                console.log('ID Token exists:', !!token);
                console.log('Token length:', token.length);
            } catch (error) {
                console.log('Error getting token:', error);
            }
        }
    };

    return (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg text-xs">
            <div>User: {user?.email || 'None'}</div>
            <div>Loading: {loading.toString()}</div>
            <button
                onClick={checkAuthStatus}
                className="mt-2 bg-blue-500 px-2 py-1 rounded text-xs"
            >
                Check Auth Status
            </button>
        </div>
    );
}