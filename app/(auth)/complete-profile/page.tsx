// app/(auth)/complete-profile/page.tsx
'use client';

import { useEffect, useState, FormEvent } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '@/app/lib/firebase';
import { useRouter } from 'next/navigation';
import { doc, writeBatch, collection } from 'firebase/firestore';
import LoadingSpinner from '@/app/ui/dashboard/loading-spinner';

function SubmitButton({ isSubmitting }: { isSubmitting: boolean }) {
    return (
        <button
            type="submit"
            disabled={isSubmitting}
            className="flex h-10 w-full items-center justify-center rounded-lg bg-gray-900 px-4 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
            {isSubmitting ? (
                <>
                    <LoadingSpinner className="mr-2" />
                    <span>Saving...</span>
                </>
            ) : 'Continue to Dashboard'}
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
        return (
            <div className="flex min-h-screen items-center justify-center gap-2 text-gray-800 dark:text-zinc-200">
                <LoadingSpinner /> Loading...
            </div>
        );
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-white dark:bg-zinc-950">
            <div className="relative mx-auto flex w-full max-w-sm flex-col space-y-4 p-4">
                <div className="text-center">
                    <h1 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-zinc-100">One Last Step!</h1>
                    <p className="mt-1 text-gray-500 dark:text-zinc-400">What should we call your workspace?</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3 pt-4">
                    <div className="w-full">
                        <label htmlFor="organizationName" className="sr-only">Organization Name</label>
                        <input
                            type="text"
                            name="organizationName"
                            id="organizationName"
                            required
                            placeholder="e.g., My Awesome Workshop"
                            className="block w-full rounded-md border border-gray-300 bg-gray-50 py-2 px-3 text-sm text-gray-900 placeholder:text-gray-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                        />
                        {error && <p className="mt-2 text-center text-xs text-red-600 dark:text-red-500">{error}</p>}
                    </div>
                    <SubmitButton isSubmitting={isSubmitting} />
                </form>
            </div>
        </main>
    );
}