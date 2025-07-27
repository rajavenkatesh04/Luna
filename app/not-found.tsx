'use client';

import Link from 'next/link';
import { Home, ArrowLeft, Compass } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <div className="w-full max-w-xl text-center">

                {/* Simple, animated icon */}
                <div className="mb-6 flex justify-center">
                    <Compass className="h-20 w-20 text-indigo-300 [animation:spin_8s_linear_infinite]" />
                </div>

                {/* Main 404 Text with Gradient and Pulse Animation */}
                <h1 className="bg-gradient-to-r from-indigo-600 via-purple-500 to-blue-500 bg-clip-text text-8xl font-extrabold text-transparent md:text-9xl animate-pulse">
                    404
                </h1>

                {/* Helper Text */}
                <div className="mt-4 space-y-2">
                    <h2 className="text-3xl  ">
                        Lost in Space?
                    </h2>
                    <p className="text-lg text-slate-300">
                        Looks like you&apos;ve ventured into uncharted territory. Let&apos;s get you back on track.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <button
                        onClick={() => window.history.back()}
                        className="group flex items-center gap-2 rounded-full border border-gray-300 bg-white px-6 py-3  text-gray-700 shadow-sm transition-all duration-300 hover:scale-105 hover:bg-gray-50 hover:shadow-lg"
                    >
                        <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                        Go Back
                    </button>
                    <Link
                        href="/"
                        className="group flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-3  text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-indigo-700 hover:shadow-xl"
                    >
                        <Home className="h-5 w-5 transition-transform group-hover:rotate-12" />
                        Take Me Home
                    </Link>
                </div>

            </div>
        </div>
    );
}