import { SparklesIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function CTABanner() {
    return (
        <div className="my-16 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center dark:border-zinc-800">
            <SparklesIcon className="mx-auto h-8 w-8 text-amber-500" />
            <h3 className="mt-4 text-2xl font-semibold text-gray-900 dark:text-zinc-100">
                Enjoying the seamless updates?
            </h3>
            <p className="mx-auto mt-2 max-w-lg text-gray-600 dark:text-zinc-400">
                Luna helps you create simple, real-time event pages just like this one. No apps for your attendees, just instant information.
            </p>
            <Link
                href="/login"
                className="mt-6 inline-block rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
                Create Your Own Free Event
            </Link>
        </div>
    );
}