import GoogleSignInButton from "@/app/ui/google-signin-button";
import Link from "next/link";

const SessionExpiredMessage = () => (
    <div className="mb-4 rounded-md border border-yellow-400 bg-yellow-50 p-3 text-center text-sm text-yellow-800">
        <p>Your session has expired. Please sign in again.</p>
    </div>
);

// Updated type definition for Next.js 15 App Router
export default async function LoginPage({
                                            searchParams,
                                        }: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    // Await the searchParams Promise to get the actual parameters
    const resolvedSearchParams = await searchParams;

    // Now you can use the search parameters as before
    const isSessionExpired = resolvedSearchParams['error'] === 'session_expired';

    return (
        <main className="flex items-center justify-center min-h-screen ">
            <div className="relative mx-auto flex w-full max-w-sm flex-col space-y-4 p-4">
                {/* Conditionally render the session expired message */}
                {isSessionExpired && <SessionExpiredMessage />}

                <div className="flex flex-col items-center justify-center text-center">
                    <Link href={'/'}>
                        <span className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400">
                            Luna
                        </span>
                    </Link>
                    <h1 className="mt-2 text-2xl font-semibold">Welcome</h1>
                    <p className="mt-1 text-gray-500">
                        The simplest way to manage your event communications.
                    </p>
                </div>

                <div className="w-full pt-4">
                    <GoogleSignInButton />
                </div>

                <p className="px-8 text-center text-xs text-gray-400">
                    By clicking continue, you agree to our Terms of Service and
                    Privacy Policy.
                </p>
            </div>
        </main>
    );
}