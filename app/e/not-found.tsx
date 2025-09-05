'use client';

import Link from 'next/link';
import { Home, ArrowLeft, Compass } from 'lucide-react';

export default function NotFound() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4">
            <div className="w-full max-w-md rounded-md border border-gray-200 bg-white p-6 text-center dark:border-zinc-800 dark:bg-zinc-900 md:p-8">

                {/* Icon with updated theme colors */}
                <div className="mb-6 flex justify-center">
                    <Compass className="h-20 w-20 text-gray-400 dark:text-zinc-500 [animation:spin_8s_linear_infinite]" />
                </div>

                {/* Main 404 Text - simplified and matched to the new theme */}
                <h1 className="text-8xl font-bold text-gray-900 dark:text-zinc-100 md:text-9xl">
                    404
                </h1>

                {/* Helper Text with updated typography */}
                <div className="mt-4 space-y-2">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-zinc-100">
                        Event Not Found
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-zinc-400">
                        The resource you are looking for doesn&apos;t exist or has been deleted.
                    </p>
                </div>

                {/* Action Buttons styled to match the Create/Cancel buttons */}
                <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <button
                        onClick={() => window.history.back()}
                        className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 sm:w-auto"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Go Back
                    </button>
                    <Link
                        href="/"
                        className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 text-sm font-medium text-white transition-colors hover:bg-gray-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 sm:w-auto"
                    >
                        <Home className="h-4 w-4" />
                        Take Me Home
                    </Link>
                </div>
            </div>
        </main>
    );
}