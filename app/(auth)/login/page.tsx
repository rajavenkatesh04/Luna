import GoogleSignInButton from "@/app/ui/google-signin-button";

export default function LoginPage() {
    return (
        <main className="flex items-center justify-center min-h-screen ">
            <div className="relative mx-auto flex w-full max-w-sm flex-col space-y-4 p-4">
                <div className="flex flex-col items-center justify-center text-center">
                    <span className="text-4xl font-extrabold text-blue-600">Luna</span>
                    <h1 className="mt-2 text-2xl font-semibold">Welcome</h1>
                    <p className="mt-1 text-gray-500">The simplest way to manage your event communications.</p>
                </div>

                <div className="w-full pt-4">
                    <GoogleSignInButton />
                </div>

                <p className="px-8 text-center text-xs text-gray-400">
                    By clicking continue, you agree to our Terms of Service and Privacy Policy.
                </p>
            </div>
        </main>
    );
}