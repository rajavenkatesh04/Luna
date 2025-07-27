'use client';

import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function NotFound() {
    // State to hold the path to provide a more helpful message
    const [missingPath, setMissingPath] = useState('');

    useEffect(() => {
        // This runs on the client and can access the window location
        if (typeof window !== 'undefined') {
            setMissingPath(window.location.pathname);
        }
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center p-4 ">
            <div className="max-w-xl w-full text-center space-y-8">

                {/* Main 404 text with a gradient */}
                <div className="relative">
                    <div className="text-9xl md:text-[10rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
                        404
                    </div>
                </div>

                {/* Contextual and funny message */}
                <div className="space-y-4 animate-fade-in">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-400">
                        Event Not Found
                    </h1>
                    <p className="text-lg text-gray-500">
                        Looks like the event you're looking for is a ghost. 👻
                    </p>
                    {missingPath && (
                        <p className="text-sm text-gray-500 bg-gray-100 rounded-md p-2 inline-block">
                            We couldn't find anything at: <strong>{missingPath}</strong>
                        </p>
                    )}
                </div>

                {/* Call-to-Action buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                    <button
                        onClick={() => window.history.back()}
                        className="group flex items-center gap-2 px-6 py-3 bg-white text-gray-700  rounded-full shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105 hover:bg-gray-100 border border-gray-200"
                    >
                        <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                        Go Back
                    </button>
                    <Link
                        href="/public"
                        className="group flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white  rounded-full shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105 hover:bg-indigo-700"
                    >
                        <Home className="w-5 h-5 transition-transform group-hover:rotate-12" />
                        Take Me Home
                    </Link>
                </div>

                {/* Fun footer message */}
                <div className="pt-8 animate-fade-in" style={{animationDelay: '0.3s'}}>
                    <p className="text-sm text-gray-400">
                        💡 <span className="font-medium">Pro tip:</span> Double-check the event link or head home to see all events.
                    </p>
                </div>
            </div>

            {/* Custom CSS for a simple fade-in animation */}
            <style jsx>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.7s ease-out forwards;
                }
            `}</style>
        </div>
    );
}
