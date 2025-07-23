"use client"

import { State, signup } from "@/app/lib/actions";
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from "next/link";
import GoogleSignInButton from "@/app/ui/google-signin-button";

export default function SignupPage() {
    const initialState: State = { message: null};

    const [state, dispatch] = useActionState(signup, initialState);


    return(
        <main className={`flex items-center justify-center min-h-screen`}>
            <div className={`relative mx-auto flex w-full max-w-[700px] flex-col space-y-2.5 p-4`}>
                <div className={`flex h-20 w-full items-end rounded-lg p-3 border border-gray-700 text-2xl font-bold`}>Luna.</div>

                <form action={dispatch} className={`space-y-3`}>
                    <div className={`flex-1 rounded-lg px-6 pb-4 pt-8 shadow-md dark: border border-gray-700`}>
                        <h1 className={`mb-3 text-xl font-semibold`}>Create your Workspace</h1>

                        <div className={`w-full`}>
                            {/* Name Input*/}
                            <div>
                                <label
                                    className="mb-1 mt-5 block text-xs font-medium "
                                    htmlFor="displayName"
                                >
                                    Your Name
                                </label>
                                <input
                                    className="peer block w-full rounded-md border border-gray-200 py-[9px] px-3 text-sm outline-2 placeholder:text-gray-500"
                                    id="displayName"
                                    type="text"
                                    name="displayName"
                                    placeholder="e.g., Raja "
                                    required
                                />
                                {state.errors?.fieldErrors.displayName && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {state.errors.fieldErrors.displayName.join(', ')}
                                    </p>
                                )}
                            </div>
                            {/*    Organisation Name Input*/}
                            <div className={`mt-4`}>
                                <label className={`mb-1 mt-5 block text-xs font-medium`} htmlFor={`OrganizationName`}>Organization / Workspace Name</label>
                                <input
                                    className={`peer block w-full rounded-md border border-gray-200 py-[9px] px-3 text-sm outline-2 placeholder:text-gray-500`}
                                    id={`OrganizationName`}
                                    type={`text`}
                                    name={`organizationName`}
                                    placeholder={`e.g., SRM Chennai or My Workshop`}
                                    required
                                />
                                {state.errors?.fieldErrors.organizationName && (
                                    <p className={`mt-1 text-xs text-red-500`}>{state.errors.fieldErrors.organizationName.join(', ')}</p>
                                )}
                            </div>

                            {/*    Email Input*/}
                            <div className={`mt-4`}>
                                <label className={`mb-1 block text-xs font-medium`} htmlFor={`email`}>Email</label>
                                <input
                                    className={`peer block w-full rounded-md border border-gray-200 py-[9px] px-3 text-sm outline-2 placeholder:text-gray-500`}
                                    id={`email`}
                                    type={`email`}
                                    name={`email`}
                                    placeholder={`Enter your email address`}
                                    required
                                />
                                {state.errors?.fieldErrors.email && (
                                    <p className={`mt-1 text-xs text-red-500`}>{state.errors.fieldErrors.email.join(', ')}</p>
                                )}
                            </div>

                            {/*    Password Input*/}
                            <div className={`mt-4`}>
                                <label className={`mb-1 block text-xs font-medium`} htmlFor={`password`}>Password</label>
                                <input
                                    className={`peer block w-full rounded-md border border-gray-200 py-[9px] px-3 text-sm outline-2 placeholder:text-gray-500`}
                                    id={`password`}
                                    type={`password`}
                                    name={`password`}
                                    placeholder={`Enter password`}
                                    required
                                    minLength={6}
                                />
                                {state.errors?.fieldErrors.password && (
                                    <p className={`mt-1 text-xs text-red-500`}>{state.errors.fieldErrors.password.join(', ')}</p>
                                )}
                            </div>

                            {/*    Submit Button    */}
                            <SignupButton />


                            {/* Google Sign In Button */}
                            <div className={`relative my-6`}>
                                <div className={`absolute inset-0 flex items-center`}>
                                    <div className={`w-full border-t border-gray-300`}/>
                                </div>
                                <div className={`relative flex justify-center text-xs uppercase`}>
                                    <span className={`px-2 bg-white text-gray-500`}>or continue with</span>
                                </div>
                            </div>

                            <GoogleSignInButton />


                            {/*    Display general error messages from the server action    */}
                            {state.message && (
                                <div className={`mt-4 flex items-center space-x-2`}>
                                    <p className={`text-sm text-red-500`}>{state.message}</p>
                                </div>
                            )}

                            <div className={`mt-4 text-center text-sm`}>
                                Already have an account? {' '}
                                <Link href={`/login`} className={`font-semibold text-blue-600 hover:underline`}>Log in</Link>
                            </div>

                        </div>
                    </div>

                </form>
            </div>
        </main>
    )
}

// We extract the button into its own component to use the useFormStatus hook
function SignupButton() {
    const {pending} = useFormStatus();

    return(
        <button className={`mt-6 flex h-10 w-full items-center justify-center rounded-lg border-gray-700 bg-blue-500 px-4 text-sm font-medium transition-colors hover:bg-blue-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50`}
                aria-disabled={pending}
                disabled={pending}
        >
            {pending ? 'Creating Account...' : 'Create Account'}
        </button>
    );
}