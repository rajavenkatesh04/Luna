import GoogleSignInButton from "@/app/ui/google-signin-button";
import Link from "next/link";
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const SessionExpiredMessage = () => (
    <div className="flex items-center justify-center gap-3 rounded-xl border border-amber-200/20 bg-gradient-to-r from-amber-50/80 to-orange-50/80 dark:from-amber-950/30 dark:to-orange-950/30 dark:border-amber-800/30 p-4 backdrop-blur-sm">
        <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
        <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
            Your session has expired. Please sign in again.
        </p>
    </div>
);

export default async function LoginPage({
                                            searchParams,
                                        }: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const resolvedSearchParams = await searchParams;
    const isSessionExpired = resolvedSearchParams['error'] === 'session_expired';

    return (
        <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-zinc-950 dark:via-zinc-900 dark:to-blue-950/20">
            <div className="relative mx-auto flex w-full max-w-md flex-col space-y-6 p-6">
                {/* Enhanced logo section */}
                <div className="flex flex-col items-center justify-center text-center space-y-4">
                    <Link href={'/'} className="group">
                        <div className="relative">
                            {/* Subtle glow effect behind logo */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-teal-400 rounded-lg blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                            <span className="relative text-5xl font-black bg-gradient-to-r from-blue-500 via-blue-600 to-teal-400 bg-clip-text text-transparent tracking-tight">
                                Luna
                            </span>
                        </div>
                    </Link>

                    <div className="space-y-2">
                        <h1 className="text-2xl font-semibold text-gray-900 dark:text-zinc-100">
                            Welcome back
                        </h1>
                        <p className="text-gray-600 dark:text-zinc-400 leading-relaxed">
                            The simplest way to manage your event communications.
                        </p>
                    </div>
                </div>

                {/* Improved session expired message positioning and styling */}
                {isSessionExpired && (
                    <div className="animate-in fade-in duration-300">
                        <SessionExpiredMessage />
                    </div>
                )}

                {/* Sign in section */}
                <div className="space-y-4 pt-2">
                    <GoogleSignInButton />

                    <p className="text-center text-xs text-gray-500 dark:text-zinc-500 leading-relaxed px-4">
                        By continuing, you agree to our{" "}
                        <Link href="/policies/terms" target={`_blank`} className="underline underline-offset-2 hover:text-gray-700 dark:hover:text-zinc-300 transition-colors">
                            Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="/policies/privacy" target={`_blank`} className="underline underline-offset-2 hover:text-gray-700 dark:hover:text-zinc-300 transition-colors">
                            Privacy Policy
                        </Link>
                        .
                    </p>
                </div>
            </div>
        </main>
    );
}