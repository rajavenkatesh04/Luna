// app/(auth)/complete-profile/page.tsx
'use client';

import { useEffect, useState, FormEvent } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '@/app/lib/firebase';
import { useRouter } from 'next/navigation';
import { doc, writeBatch, collection } from 'firebase/firestore';

function SubmitButton({ isSubmitting }: { isSubmitting: boolean }) {
    return (
        <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300">
            {isSubmitting ? 'Saving...' : 'Continue to Dashboard'}
        </button>
    );
}

export default function CompleteProfilePage() {
    const [user, setUser] = useState<User | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
            } else {
                // This page is protected; if no user, send them back to login.
                router.push('/login');
            }
        });
        return () => unsubscribe();
    }, [router]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);
        setError(null);

        if (!user || !user.email) {
            setError("Authentication error. Please try logging in again.");
            setIsSubmitting(false);
            return;
        }

        const formData = new FormData(event.currentTarget);
        const organizationName = formData.get('organizationName') as string;

        if (!organizationName || organizationName.length < 2) {
            setError("Organization name must be at least 2 characters.");
            setIsSubmitting(false);
            return;
        }

        try {
            const batch = writeBatch(db);
            const orgRef = doc(collection(db, 'organizations'));
            batch.set(orgRef, {
                name: organizationName,
                ownerUid: user.uid,
                subscriptionTier: 'free',
            });

            const userRef = doc(db, 'users', user.uid);
            batch.set(userRef, {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || "User",
                organizationId: orgRef.id,
                role: 'owner',
            });

            await batch.commit();
            router.push('/dashboard');

        } catch (err) {
            console.error("Profile Completion Error:", err);
            setError("Failed to create your workspace. Please try again.");
            setIsSubmitting(false);
        }
    };

    if (!user) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    return (
        <main className="flex items-center justify-center min-h-screen ">
            <div className="relative mx-auto flex w-full max-w-sm flex-col space-y-4 p-4">
                <div className="text-center">
                    <h1 className="mt-2 text-2xl font-semibold">One Last Step!</h1>
                    <p className="mt-1 text-gray-500">What should we call your workspace?</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="w-full">
                        <label htmlFor="organizationName" className="sr-only">Organization Name</label>
                        <input
                            type="text"
                            name="organizationName"
                            id="organizationName"
                            required
                            placeholder="e.g., My Awesome Workshop"
                            className="block w-full rounded-md border border-gray-300 py-2 px-3 text-sm"
                        />
                        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
                    </div>
                    <SubmitButton isSubmitting={isSubmitting} />
                </form>
            </div>
        </main>
    );
}
