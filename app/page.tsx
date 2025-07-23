import {GeistFont, PlayWriteNewZealandFont} from "@/app/ui/fonts";
import Link from "next/link";
import ToggleSwitch from "@/app/ui/ToggleSwitch";

export default function Home() {
    return(
        <>
            <nav className={`flex mx-auto max-w-7xl justify-between text-center p-4`}>
                <h1>Luna.</h1>
                <ul className={`flex gap-4 justify-between`}>
                    <li><Link href={`/login`}>Login</Link></li>
                    <li><Link href={`/dashboard`}>Dashboard</Link></li>
                    <li><ToggleSwitch /></li>
                </ul>

            </nav>
            <main className={`grow p-4`}>
                <section className={`border flex flex-col items-center justify-center min-h-screen`}>
                    <h1 className={`${PlayWriteNewZealandFont.className} mb-4 text-xl sm:text-5xl`}>Instant
                        <span className={`bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-800`}> Event</span>  Updates,
                        <br />
                    </h1>
                    <span className={`text-7xl sm:text-9xl bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400 `}>Simplified.</span>

                    <p className={`${GeistFont.className} my-6 max-w-2xl text-sm sm:text-xl text-center mx-auto tracking-wide`}>
                        <span className={`opacity-50`}>From</span> College convocations to corporate workshops,
                        Luna is the <span className={``}>single source of truth</span> for your attendees.
                        No apps, no sign-ups, just real-time information that flows seamlessly.
                    </p>

                    <button>
                        <Link
                            href={`/signup`}
                            className={`border border-gray-700 bg-gradient-to-r from-blue-600 to-emerald-500 text-white py-2 px-4 rounded`}
                        >
                            Get Started free
                        </Link>
                    </button>
                </section>

            {/*    Features */}
                <section>
                {/*    Section Header */}
                    <div className={`border text-center `}>
                        <h2 className={`mb-4 text-xl sm:text-4xl`}>Everything You Need. Nothing You Don&apos;t.</h2>
                        <p>Focus on your event, not on managing communication chaos. </p>
                    </div>
                </section>
            </main>
        </>
    )
}