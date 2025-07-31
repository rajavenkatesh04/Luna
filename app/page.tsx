import {PlayWriteNewZealandFont} from "@/app/ui/fonts";
import Link from "next/link";
import {QrCodeIcon, BellAlertIcon, ChatBubbleOvalLeftIcon, UserGroupIcon} from "@heroicons/react/24/outline";
import Navbar from "@/app/ui/Navbar";

export default function Home() {
    return (
        <div className="flex min-h-screen flex-col bg-white text-gray-800 dark:bg-zinc-950 dark:text-zinc-200">

            <main className="grow p-4">
                <section className="flex min-h-screen flex-col items-center justify-center space-y-5 text-center">
                    <h3 className={`${PlayWriteNewZealandFont.className} space-y-2 text-5xl md:text-5xl`}>
                        Instant
                        <span className="bg-gradient-to-r from-green-400 to-emerald-800 bg-clip-text text-transparent"> Event</span> Updates,
                        <br/>
                    </h3>
                    <h1 className="bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-6xl font-bold text-transparent md:text-9xl">Simplified.</h1>

                    <p className="mx-auto my-6 max-w-2xl text-center tracking-wide sm:text-xl dark:text-zinc-300">
                        <span className="opacity-70">From college convocations to corporate workshops,</span>{' '}
                        Luna is the <span className="font-semibold text-gray-900 dark:text-zinc-100">single source of truth</span>{' '}
                        <span className="opacity-90">for your attendees.</span>{' '}
                        <span className="opacity-70">No apps, no sign-ups, just</span>{' '}
                        <span className="font-semibold text-gray-900 dark:text-zinc-100">real-time information</span>{' '}
                        <span className="opacity-90">that flows seamlessly.</span>
                    </p>

                    <button>
                        <Link
                            href="/login"
                            className="rounded-md bg-gradient-to-r from-blue-600 to-emerald-500 px-4 py-2 text-white transition-all duration-300 hover:opacity-80"
                        >
                            Get Started for free
                        </Link>
                    </button>
                </section>

                <section className="py-20">
                    <div className="mb-5 space-y-5 text-center">
                        <h2 className="text-5xl md:text-6xl"><span className={`${PlayWriteNewZealandFont.className} bg-gradient-to-r from-pink-400 to-orange-600 bg-clip-text text-transparent`}>Everything</span> You Need.</h2>
                        <h3 className="text-3xl md:text-4xl">Nothing You Don&apos;t.</h3>
                        <p className="mt-5 text-gray-600 dark:text-zinc-400 sm:text-xl">Focus on your event, not on managing communication chaos.</p>
                    </div>

                    <div className="mx-auto mt-16 grid max-w-5xl items-start justify-center gap-8 md:grid-cols-2 lg:grid-cols-4">
                        <div className="flex h-full flex-col items-center justify-start space-y-3 rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                            <QrCodeIcon className="h-12 w-12 text-gray-600 dark:text-gray-400"/>
                            <h3 className="text-xl font-semibold bg-gradient-to-r from-pink-400 to-orange-600 bg-clip-text text-transparent">Instant QR Access</h3>
                            <p className="text-sm text-gray-600 dark:text-zinc-400">Attendees scan a QR code to instantly join the event feed. No app downloads, no friction.</p>
                        </div>
                        <div className="flex h-full flex-col items-center justify-start space-y-3 rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                            <BellAlertIcon className="h-12 w-12 text-gray-600 dark:text-gray-400"/>
                            <h3 className="text-xl font-semibold bg-gradient-to-r from-pink-400 to-orange-600 bg-clip-text text-transparent">Push Notifications</h3>
                            <p className="text-sm text-gray-600 dark:text-zinc-400">Send live updates, schedule changes, and emergency alerts directly to attendees&apos; phones.</p>
                        </div>
                        <div className="flex h-full flex-col items-center justify-start space-y-3 rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                            <ChatBubbleOvalLeftIcon className="h-12 w-12 text-gray-600 dark:text-gray-400" />
                            <h3 className="text-xl font-semibold bg-gradient-to-r from-pink-400 to-orange-600 bg-clip-text text-transparent">Live Engagement</h3>
                            <p className="text-sm text-gray-600 dark:text-zinc-400">Engage your audience with real-time announcements, Q&A sessions, and instant feedback polls.</p>
                        </div>
                        <div className="flex h-full flex-col items-center justify-start space-y-3 rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                            <UserGroupIcon className="h-12 w-12 text-gray-600 dark:text-gray-400" />
                            <h3 className="text-xl font-semibold bg-gradient-to-r from-pink-400 to-orange-600 bg-clip-text text-transparent">Manage Admins</h3>
                            <p className="text-sm text-gray-600 dark:text-zinc-400">Collaborate with your team by adding admins who can send announcements to your attendees.</p>
                        </div>
                    </div>
                </section>

                <section className="flex min-h-screen flex-col items-center justify-center text-center">
                    <div className="mx-auto mb-5 max-w-5xl space-y-5">
                        <h2 className="text-5xl text-black/80 dark:text-white/80 md:text-6xl">Ready to <span className={`bg-gradient-to-r from-teal-300 to-amber-600 bg-clip-text text-transparent ${PlayWriteNewZealandFont.className}`}>Transform</span> Your Events<span className="bg-gradient-to-r from-teal-300 to-amber-600 bg-clip-text text-transparent">?</span></h2>
                        <p className="mx-auto my-6 max-w-2xl text-center text-sm tracking-wide text-gray-600 dark:text-zinc-400 sm:text-xl">
                            Join thousands of event organizers who&apos;ve discovered the power of seamless,
                            real-time communication. Create your first event for free, no credit card required.
                        </p>
                        <button>
                            <Link
                                href="/login"
                                className="rounded-md bg-gradient-to-r from-teal-300 to-amber-600 px-4 py-2 text-white transition-all duration-300 hover:opacity-80"
                            >
                                Get Started for free
                            </Link>
                        </button>
                    </div>
                </section>
            </main>

            <footer className="border-t border-t-white/20 bg-gradient-to-r from-red-500 to-pink-700 py-4 text-white backdrop-blur-sm">
                <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
                    <p className="text-sm">
                        &copy; 2025 Luna. Crafted with care for event organizers worldwide.
                    </p>
                </div>
            </footer>
        </div>
    );
}