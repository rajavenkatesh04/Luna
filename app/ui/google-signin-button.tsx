'use client';

import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "@/app/lib/firebase";
import { useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/app/ui/dashboard/loading-spinner";

// Google Icon SVG component
const GoogleIcon = () => (
    <svg className="h-5 w-5" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
        <path fill="none" d="M0 0h48v48H0z"></path>
    </svg>
);

export default function GoogleSignInButton() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSignIn = async () => {
        setIsLoading(true);
        setError(null);
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Step 1: Securely create the server-side session
            const idToken = await user.getIdToken();
            const response = await fetch('/api/auth/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken }),
            });

            if (!response.ok) throw new Error("Failed to create session.");

            // Step 2: Check if the user is returning or new
            const userRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userRef);

            if (userDoc.exists()) {
                // User already has a profile, send them to the dashboard
                router.push('/dashboard');
            } else {
                // This is a brand new user. Send them to complete their profile.
                // This single step replaces all the complex domain-claiming logic.
                router.push('/complete-profile');
            }

        } catch (error: unknown) {
            console.error("Google Sign-In Error", error);
            setError("Failed to sign in. Please try again.");
            setIsLoading(false);
        }
    };

    return (
        <div>
            <button
                onClick={handleSignIn}
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-3 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
                {isLoading ? (
                    <>
                        <LoadingSpinner className="mr-2 h-5 w-5" />
                        <span>Signing In...</span>
                    </>
                ) : (
                    <>
                        <GoogleIcon />
                        <span>Sign in with Google</span>
                    </>
                )}
            </button>
            {error && <p className="mt-2 text-center text-xs text-red-600 dark:text-red-500">{error}</p>}
        </div>
    );
}
