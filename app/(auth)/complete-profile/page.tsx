// app/(auth)/complete-profile/page.tsx
'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { completeUserProfile, type CompleteProfileState } from '@/app/lib/actions';
import LoadingSpinner from '@/app/ui/dashboard/loading-spinner';

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="flex h-10 w-full items-center justify-center rounded-lg bg-gray-900 px-4 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
            {pending ? (
                <>
                    <LoadingSpinner className="mr-2" />
                    <span>Saving...</span>
                </>
            ) : 'Continue to Dashboard'}
        </button>
    );
}

export default function CompleteProfilePage() {
    const initialState: CompleteProfileState | null = null;
    const [state, formAction] = useActionState(completeUserProfile, initialState);

    return (
        <main className="flex min-h-screen items-center justify-center bg-white dark:bg-zinc-950">
            <div className="relative mx-auto flex w-full max-w-sm flex-col space-y-4 p-4">
                <div className="text-center">
                    <h1 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-zinc-100">One Last Step!</h1>
                    <p className="mt-1 text-gray-500 dark:text-zinc-400">What should we call your workspace?</p>
                </div>

                {/* The form now calls the server action */}
                <form action={formAction} className="space-y-3 pt-4">
                    <div className="w-full">
                        <label htmlFor="organizationName" className="sr-only">Organization Name</label>
                        <input
                            type="text"
                            name="organizationName"
                            id="organizationName"
                            required
                            minLength={2}
                            placeholder="e.g., My Awesome Workshop"
                            className="block w-full rounded-md border border-gray-300 bg-gray-50 py-2 px-3 text-sm text-gray-900 placeholder:text-gray-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                        />
                        {/* Display errors from the server action state */}
                        {state?.errors?.organizationName &&
                            state.errors.organizationName.map((error: string) => (
                                <p className="mt-2 text-center text-xs text-red-600 dark:text-red-500" key={error}>
                                    {error}
                                </p>
                            ))}
                        {state?.message && (
                            <p className="mt-2 text-center text-xs text-red-600 dark:text-red-500">{state.message}</p>
                        )}
                    </div>
                    <SubmitButton />
                </form>
            </div>
        </main>
    );
}