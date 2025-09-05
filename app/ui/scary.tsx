import {ExclamationTriangleIcon} from "@heroicons/react/24/outline";

export default function Scary() {
    return (
        <>
            <div className="min-h-screen mb-10  rounded-md bg-zinc-900 flex items-center justify-center relative overflow-hidden">
                {/* Animated background elements */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-black to-red-900/20 animate-pulse"></div>

                {/* Flickering overlay */}
                <div className="absolute inset-0 bg-red-500/5 animate-ping"></div>

                {/* Main content */}
                <div className="relative z-10 text-center max-w-2xl px-6">
                    {/* Skull or warning icon with glow effect */}
                    <div className="mb-8 mt-10 relative">
                        <div className="absolute inset-0 bg-red-600 rounded-full blur-xl opacity-30 animate-pulse"></div>
                        <ExclamationTriangleIcon className="relative h-24 w-24 mx-auto text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.8)] animate-bounce" />
                    </div>

                    {/* Main warning text */}
                    <div className="space-y-6">
                        <h1 className="text-6xl font-black text-red-500 tracking-wider animate-pulse drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">
                            ACCESS DENIED
                        </h1>

                        <div className="border-2 border-red-600 bg-red-950/50 p-6 rounded-lg backdrop-blur-sm shadow-[0_0_30px_rgba(239,68,68,0.3)]">
                            <p className="text-2xl font-bold text-red-300 mb-3 tracking-wide">
                                ⚠️ UNAUTHORIZED ZONE ⚠️
                            </p>
                            <p className="text-red-200 text-lg font-medium mb-2">
                                You do not belong here.
                            </p>
                            <p className="text-red-400 text-sm font-mono uppercase tracking-widest">
                                [ SECURITY BREACH DETECTED ]
                            </p>
                        </div>

                        {/* Threatening message */}
                        <div className="text-red-300 space-y-2 font-mono text-sm">
                            <p className="animate-pulse"> This area is RESTRICTED</p>
                            <p className="animate-pulse delay-100"> Your access attempt has been LOGGED</p>
                            <p className="animate-pulse delay-200"> Further attempts will be REPORTED</p>
                        </div>

                        {/* Glitchy exit message */}
                        <div className="mt-8 p-4 border border-red-700 bg-black/80 rounded font-mono">
                            <p className="text-red-500 animate-pulse text-lg font-bold">
                                &gt;&gt; LEAVE NOW &lt;&lt;
                            </p>
                            <p className="text-red-300 text-xs mt-1 opacity-75">
                                Click anywhere to escape...
                            </p>
                        </div>
                    </div>
                </div>

                {/* Subtle scan line effect */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-500/10 to-transparent h-2 animate-pulse"></div>
            </div>
        </>
    )
}