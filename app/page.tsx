import {PlayWriteNewZealandFont} from "@/app/ui/fonts";
import Link from "next/link";
import {QrCodeIcon, BellAlertIcon, ChatBubbleOvalLeftIcon} from "@heroicons/react/24/outline";
import Navbar from "@/app/ui/Navbar";

export default function Home() {
    return(
        <>
            <Navbar/>

            <main className={`grow p-4`}>
                <section className={`flex flex-col items-center justify-center min-h-screen`}>
                    <h1 className={`${PlayWriteNewZealandFont.className} mb-4 text-xl sm:text-5xl`}>Instant
                        <span className={`bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-800`}> Event</span>  Updates,
                        <br />
                    </h1>
                    <span className={`text-6xl sm:text-9xl bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400 `}>Simplified.</span>

                    <p className="my-6 max-w-2xl text-sm sm:text-xl text-center mx-auto tracking-wide">
                        <span className="opacity-70">From college convocations to corporate workshops,</span>{' '}
                        Luna is the <span className={`font-semibold`}>single source of truth</span>{' '}
                        <span className="opacity-90">for your attendees.</span>{' '}
                        <span className="opacity-70">No apps, no sign-ups, just</span>{' '}
                        <span className="opacity-100">real-time information</span>{' '}
                        <span className="opacity-90">that flows seamlessly.</span>
                    </p>

                    <button>
                        <Link
                            href={`/signup`}
                            className={`border border-gray-700 bg-gradient-to-r from-blue-600 to-emerald-500 text-white py-2 px-4 rounded-md`}
                        >
                            Get Started for free
                        </Link>
                    </button>
                </section>

            {/*    Features */}
                <section className={``}>
                {/*    Section Header */}
                    <div className={`text-center space-y-5 mb-5`}>
                        <h2 className={`text-5xl md:text-6xl `}><span className={`${PlayWriteNewZealandFont.className} bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-orange-600`}>Everything</span> You Need.</h2>
                        <h3 className={`text-3xl md:text-4xl`}>Nothing You Don&apos;t.</h3>
                        <p className={`text-xl mt-5 `}>Focus on your event, not on managing communication chaos. </p>
                    </div>

                    {/*    Features List */}
                    <div className={`grid gap-8 md:grid-cols-2 lg:grid-cols-3 items-center justify-center max-w-5xl mx-auto mt-10`}>
                    {/*    Feature 1 */}
                        <div className={`border rounded-md px-10 py-5 flex flex-col items-center text-center justify-center space-y-3`}>
                            <QrCodeIcon className={`h-12 w-12 text-gray-600 dark:text-gray-400`}/>
                            <h3 className={`text-xl bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-orange-600`}>Instant QR Access</h3>
                            <p >Attendees scan a QR code to instantly join the event feed. No app downloads, no friction.</p>
                        </div>

                    {/*    Feature 2 */}
                        <div className={`border rounded-md px-10 py-5  flex flex-col items-center text-center justify-center space-y-3`}>
                            <BellAlertIcon className={`h-12 w-12 text-gray-600 dark:text-gray-400`}/>
                            <h3 className={`text-xl bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-orange-600`}>Push Notification</h3>
                            <p>Send live updates, schedule changes, and emergency alerts directly to attendees&apos; phones.</p>
                        </div>

                    {/*    Feature 3 */}
                        <div className={`border rounded-md px-10 py-5 flex flex-col items-center text-center justify-center space-y-3`}>
                            <ChatBubbleOvalLeftIcon className="h-12 w-12  text-gray-600 dark:text-gray-400" />
                            <h3 className={`text-xl bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-orange-600`}>Live Chat & Polls</h3>
                            <p>Engage your audience with real-time chat rooms, Q&A sessions, and instant feedback polls.</p>
                        </div>
                    </div>
                </section>


            {/*   Call to action */}
                <section className={`flex flex-col items-center text-center  justify-center min-h-screen`}>
                    <div className={`max-w-5xl mx-auto mb-5 space-y-5`}>
                        <h2 className={`text-5xl md:text-6xl light:text-black/80`}>Ready to <span className={`bg-clip-text text-transparent bg-gradient-to-r from-teal-300 to-amber-600 ${PlayWriteNewZealandFont.className}`}>Transform</span> Your Events <span className={`bg-clip-text text-transparent bg-gradient-to-r from-teal-300 to-amber-600 `}>?</span></h2>
                        <p className={`my-6 max-w-2xl text-sm sm:text-xl text-center mx-auto tracking-wide `}>
                            Join thousands of event organizers who&apos;ve discovered the power of seamless,
                            real-time communication. Create your first event for free, no credit card required.
                        </p>
                        <button>
                            <Link
                                href={`/signup`}
                                className={`border  border-gray-700 bg-gradient-to-r from-teal-300 to-amber-600 text-white py-2 px-4 rounded-md`}
                            >
                                Get Started for free
                            </Link>
                        </button>
                    </div>
                </section>
            </main>

            <footer className="py-8 md:py-12 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
                    <p className=" light:text-slate-500 font-medium">
                        &copy; 2025 Luna. Crafted with care for event organizers worldwide.
                    </p>
                </div>
            </footer>
        </>
    )
}