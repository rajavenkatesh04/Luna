"use client"


import {login, LoginState} from "@/app/lib/actions";
import Link from "next/link";
import {useActionState} from "react";
import {useFormStatus} from "react-dom";
import GoogleSignInButton from "@/app/ui/google-signin-button";

export default function LoginPage() {
    const initialState: LoginState = { message: null};
    const [state, dispatch] = useActionState(login, initialState);

    return(
        <main className={`flex items-center justify-center min-h-screen`}>
            <div className={`relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4`}>
                <div className={`flex h-20 w-full items-end rounded-lg p-3 border border-gray-700 text-2xl font-bold`}>Luna.</div>

                <form action={dispatch} className={`space-y-3`}>
                    <div className={`flex-1 rounded-lg px-6 pb-4 pt-8 shadow-md dark: border border-gray-700`}>
                        <h1 className={`mb-3 text-xl font-semibold`}>Log in to your Workspace</h1>

                        <div className={`w-full`}>

                            {/* Email Input */}
                            <div>
                                <label
                                    className="mb-1 mt-5 block text-xs font-medium "
                                    htmlFor="email"
                                >
                                    Email
                                </label>
                                <input
                                    className="peer block w-full rounded-md border border-gray-200 py-[9px] px-3 text-sm outline-2 placeholder:text-gray-500"
                                    id="email"
                                    type="email"
                                    name="email"
                                    placeholder="Enter your email address"
                                    required
                                />
                            </div>

                            {/*    Password Input*/}
                            <div className="mt-4">
                                <label
                                    className="mb-1 block text-xs font-medium "
                                    htmlFor="password"
                                >
                                    Password
                                </label>
                                <input
                                    className="peer block w-full rounded-md border border-gray-200 py-[9px] px-3 text-sm outline-2 placeholder:text-gray-500"
                                    id="password"
                                    type="password"
                                    name="password"
                                    placeholder="Enter password"
                                    required
                                    minLength={6}
                                />
                            </div>

                            {/*    Submit Button    */}
                            <LoginButton />

                            {/* Google Sign In Button */}
                            <div className={`relative my-6`}>
                                <div className={`absolute inset-0 flex items-center`}>
                                    <div className={`w-full border-t border-gray-300`}/>
                                </div>
                                <div className={`relative flex justify-center text-xs uppercase`}>
                                    <span className={`px-2 bg-white  text-gray-500 `}>or continue with</span>
                                </div>
                            </div>

                            <GoogleSignInButton />

                            {/* Display general error messages from the server action */}
                            {state?.message && (
                                <div className="mt-4 flex items-center space-x-2">
                                    <p className="text-sm text-red-500">{state.message}</p>
                                </div>
                            )}
                            <div className="mt-4 text-center text-sm">
                                Don&apos;t have an account?{' '}
                                <Link href="/signup" className="font-semibold text-blue-600 hover:underline">
                                    Sign up
                                </Link>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </main>
    )
}

function LoginButton() {
    const { pending } = useFormStatus();

    return (
        <button
            className="mt-6 flex h-10 w-full items-center justify-center rounded-lg bg-blue-500 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
            aria-disabled={pending}
            disabled={pending}
        >
            {pending ? 'Logging In...' : 'Log In'}
        </button>
    );
}
