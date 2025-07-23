import Navbar from "@/app/ui/Navbar";

export default function Home() {
    return (
        <>
            <Navbar />

            {/* Hero Section - This creates our main visual impact */}
            <main className="grow">
                <section className="relative min-h-screen flex items-center overflow-hidden">
                    {/* Multi-layered gradient background that adapts to theme */}
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900"></div>

                    {/* Animated gradient orbs for visual depth */}
                    <div className="absolute top-1/4 -left-20 w-72 h-72 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-30 animate-pulse"></div>
                    <div className="absolute top-1/3 -right-20 w-72 h-72 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
                    <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-30 animate-pulse animation-delay-4000"></div>

                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 w-full z-10">
                        <div className="text-center">
                            {/* Main headline with enhanced typography and gradient effects */}
                            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black leading-none tracking-tight mb-8">
                <span className="block bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-slate-200 dark:to-white bg-clip-text text-transparent">
                  Instant Event
                </span>
                                <span className="block mt-2 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
                  Updates,
                </span>
                                <span className="block mt-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
                  Simplified.
                </span>
                            </h1>

                            {/* Supporting text with better readability */}
                            <div className="max-w-4xl mx-auto mb-12">
                                <p className="text-xl md:text-2xl leading-relaxed text-slate-600 dark:text-slate-300 font-medium">
                                    From college convocations to corporate workshops, <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent font-semibold">Luna</span> is the single source of truth for your attendees. No apps, no sign-ups, just real-time information that flows seamlessly.
                                </p>
                            </div>

                            {/* Enhanced call-to-action with gradient effects */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                <button className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-2xl font-bold text-white shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 ease-out">
                                    <span className="relative z-10">Get Started Free</span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-40 group-hover:opacity-60 transition duration-300"></div>
                                </button>

                                <button className="px-8 py-4 border-2 border-slate-300 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-400 rounded-2xl font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 backdrop-blur-sm">
                                    Watch Demo
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section - Enhanced with card-based design */}
                <section className="py-20 md:py-32 relative">
                    {/* Subtle background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-50/50 to-transparent dark:via-slate-800/50"></div>

                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
                        {/* Section header with improved typography */}
                        <div className="max-w-4xl mx-auto text-center mb-20">
                            <h2 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                                Everything You Need.
                            </h2>
                            <h3 className="text-3xl md:text-4xl font-light mb-8 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                                Nothing You Don't.
                            </h3>
                            <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
                                Focus on creating memorable experiences while Luna handles all the communication complexity behind the scenes.
                            </p>
                        </div>

                        {/* Enhanced feature cards with glassmorphism effect */}
                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">

                            {/* Feature 1 - Enhanced card design */}
                            <div className="group relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl blur-xl transition-all duration-500 group-hover:from-blue-500/30 group-hover:to-purple-500/30"></div>
                                <div className="relative p-8 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-slate-700/20 shadow-xl hover:shadow-2xl transition-all duration-500 group-hover:scale-105">
                                    <div className="flex justify-center mb-6">
                                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                                            </svg>
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white text-center">Instant QR Access</h3>
                                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-center">
                                        Attendees scan a QR code to instantly join the event feed. No app downloads, no account creation, no friction between your audience and your message.
                                    </p>
                                </div>
                            </div>

                            {/* Feature 2 */}
                            <div className="group relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-3xl blur-xl transition-all duration-500 group-hover:from-emerald-500/30 group-hover:to-teal-500/30"></div>
                                <div className="relative p-8 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-slate-700/20 shadow-xl hover:shadow-2xl transition-all duration-500 group-hover:scale-105">
                                    <div className="flex justify-center mb-6">
                                        <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                                            </svg>
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white text-center">Smart Notifications</h3>
                                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-center">
                                        Send live updates, schedule changes, and emergency alerts directly to attendees' devices with intelligent timing and personalized relevance.
                                    </p>
                                </div>
                            </div>

                            {/* Feature 3 */}
                            <div className="group relative md:col-span-2 lg:col-span-1">
                                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-pink-500/20 rounded-3xl blur-xl transition-all duration-500 group-hover:from-orange-500/30 group-hover:to-pink-500/30"></div>
                                <div className="relative p-8 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-slate-700/20 shadow-xl hover:shadow-2xl transition-all duration-500 group-hover:scale-105">
                                    <div className="flex justify-center mb-6">
                                        <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                                            </svg>
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white text-center">Live Engagement</h3>
                                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-center">
                                        Transform passive attendance into active participation with real-time chat rooms, interactive Q&A sessions, and instant feedback polls that energize your event.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Enhanced Call-to-Action Section */}
                <section className="relative py-20 md:py-32 overflow-hidden">
                    {/* Dynamic gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950"></div>

                    {/* Animated background elements */}
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>

                    <div className="relative max-w-6xl mx-auto px-4 sm:px-6 text-center z-10">
                        <h2 className="text-4xl md:text-6xl font-black mb-8 bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text text-transparent">
                            Ready to Transform Your Events?
                        </h2>
                        <p className="text-xl md:text-2xl mb-12 text-slate-300 leading-relaxed max-w-3xl mx-auto">
                            Join thousands of event organizers who've discovered the power of seamless, real-time communication. Create your first event for free, no credit card required.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                            <button className="group relative px-10 py-5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-2xl font-bold text-white shadow-2xl hover:shadow-emerald-500/25 transform hover:scale-105 transition-all duration-300">
                                <span className="relative z-10 text-lg">Start for Free</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur opacity-40 group-hover:opacity-60 transition duration-300"></div>
                            </button>

                            <button className="px-10 py-5 border-2 border-white/30 hover:border-white/60 rounded-2xl font-semibold text-white hover:bg-white/10 transition-all duration-300 backdrop-blur-sm text-lg">
                                Schedule Demo
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            {/* Enhanced Footer */}
            <footer className="py-8 md:py-12 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
                    <p className="text-slate-600 dark:text-slate-400 font-medium">
                        &copy; 2025 Luna. Crafted with care for event organizers worldwide.
                    </p>
                </div>
            </footer>
        </>
    );
}