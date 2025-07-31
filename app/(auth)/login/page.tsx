import GoogleSignInButton from "@/app/ui/google-signin-button";
import Link from "next/link";

const SessionExpiredMessage = () => (
    <div className="mb-4 rounded-md border border-yellow-400 bg-yellow-50 p-3 text-center text-sm text-yellow-800 dark:border-yellow-500/30 dark:bg-yellow-900/20 dark:text-yellow-300">
        <p>Your session has expired. Please sign in again.</p>
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
        <main className="flex min-h-screen items-center justify-center bg-white dark:bg-zinc-950">
            <div className="relative mx-auto flex w-full max-w-sm flex-col space-y-4 p-4">
                {isSessionExpired && <SessionExpiredMessage />}

                <div className="flex flex-col items-center justify-center text-center">
                    <Link href={'/'}>
                        <span className="text-4xl font-extrabold bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent">
                            Luna
                        </span>
                    </Link>
                    <h1 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-zinc-100">Welcome</h1>
                    <p className="mt-1 text-gray-500 dark:text-zinc-400">
                        The simplest way to manage your event communications.
                    </p>
                </div>

                <div className="w-full pt-4">
                    <GoogleSignInButton />
                </div>

                <p className="px-8 text-center text-xs text-gray-400 dark:text-zinc-500">
                    By clicking continue, you agree to our Terms of Service and
                    Privacy Policy.
                </p>
            </div>
        </main>
    );
}