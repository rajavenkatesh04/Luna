// app/ui/google-signin-button.tsx
'use client';

import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "@/app/lib/firebase";
import { useState } from "react";
import { doc, getDoc, collection, query, where, getDocs, writeBatch } from "firebase/firestore";
import { useRouter } from "next/navigation";

// Google Icon SVG component
const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
        <path fill="none" d="M0 0h48v48H0z"></path>
    </svg>
);

const PUBLIC_EMAIL_DOMAINS = new Set(['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com']);

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
            if (!user.email) throw new Error("No email returned from Google.");

            const idToken = await user.getIdToken();
            const response = await fetch('/api/auth/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken }),
            });

            if (!response.ok) throw new Error("Failed to create session.");

            const userRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userRef);

            if (userDoc.exists()) {
                router.push('/dashboard');
                return;
            }

            const emailDomain = user.email.split('@')[1];

            if (PUBLIC_EMAIL_DOMAINS.has(emailDomain)) {
                router.push('/complete-profile');
            } else {
                const orgsRef = collection(db, 'organizations');
                const q = query(orgsRef, where("claimedDomain", "==", emailDomain));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    setError(`The domain ${emailDomain} is already claimed. Please ask for an invitation.`);
                    await auth.signOut();
                    await fetch('/api/auth/session', { method: 'DELETE' });
                    setIsLoading(false);
                    return;
                }

                const orgName = emailDomain.split('.')[0].replace(/^\w/, c => c.toUpperCase()) + " Workspace";
                const batch = writeBatch(db);
                const orgRef = doc(collection(db, 'organizations'));
                batch.set(orgRef, { name: orgName, ownerUid: user.uid, subscriptionTier: 'free', claimedDomain: emailDomain });
                batch.set(userRef, { uid: user.uid, email: user.email, displayName: user.displayName || "User", organizationId: orgRef.id, role: 'owner' });
                await batch.commit();
                router.push('/dashboard');
            }
        } catch (error: unknown) { // This fixes the ESLint error
            if (typeof error === 'object' && error !== null && 'code' in error) {
                const firebaseError = error as { code: string };
                if (firebaseError.code === 'auth/account-exists-with-different-credential') {
                    setError('This email is already associated with a different sign-in method.');
                } else {
                    setError("Failed to sign in. Please try again.");
                }
            } else {
                setError("An unexpected error occurred.");
            }
            console.error("Google Sign-In Error", error);
            setIsLoading(false);
        }
    };

    return (
        <div>
            <button
                onClick={handleSignIn}
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-3 rounded-md border border-gray-300  px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
                <GoogleIcon />
                <span>{isLoading ? 'Signing In...' : 'Sign in with Google'}</span>
            </button>
            {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
        </div>
    );
}
