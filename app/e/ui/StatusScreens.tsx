import { useState, useEffect } from 'react';
import { Event, Announcement } from '@/app/lib/definitions';
import {
    ClockIcon,
    NoSymbolIcon,
    CheckCircleIcon,
    PauseCircleIcon,
    RocketLaunchIcon,
    CalendarDaysIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline';

// Helper function remains the same
function formatTime(totalSeconds: number) {
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return {
        days: days.toString().padStart(2, '0'),
        hours: hours.toString().padStart(2, '0'),
        minutes: minutes.toString().padStart(2, '0'),
        seconds: seconds.toString().padStart(2, '0'),
    };
}

// =================================================================================
// FINAL REDESIGNED STATUS SCREEN COMPONENTS
// =================================================================================

/**
 * ScheduledScreen with Countdown Timer
 * - Corrected apostrophes for JSX compatibility.
 * - The countdown timer logic is included and will appear below the main text.
 */
export function ScheduledScreen({ event }: { event: Event }) {
    const [timeRemaining, setTimeRemaining] = useState(event.startsAt.seconds - Date.now() / 1000);

    useEffect(() => {
        if (timeRemaining <= 0) return;
        const timer = setInterval(() => {
            setTimeRemaining(prev => prev > 0 ? prev - 1 : 0);
        }, 1000);
        return () => clearInterval(timer);
    }, [timeRemaining]);

    const { days, hours, minutes, seconds } = formatTime(timeRemaining);

    return (
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 p-8 text-center shadow-lg dark:from-zinc-900 dark:to-indigo-950/50">
            {/* Background decorative pattern */}
            <div
                className="absolute inset-0 bg-[radial-gradient(#d1d5db_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] dark:bg-[radial-gradient(#4f46e560_1px,transparent_1px)]"
            />
            <div className="relative z-10">
                <RocketLaunchIcon className="mx-auto h-14 w-14 text-indigo-500" />
                <h3 className="mt-4 text-2xl font-bold text-gray-900 dark:text-zinc-100">
                    You&apos;re cleared for launch! 🚀
                </h3>
                <p className="mt-2 text-gray-600 dark:text-zinc-400">
                    This event hasn&apos;t started yet. Grab a coffee and check back soon.
                </p>
                {timeRemaining > 0 && (
                    <div className="mt-10">
                        <p className="mb-4 text-sm uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                            Event Commences In
                        </p>
                        <div className="mx-auto grid max-w-lg grid-cols-4 gap-3 text-gray-800 dark:text-zinc-200">
                            <div className="rounded-lg bg-white/50 p-3 backdrop-blur-sm dark:bg-black/20">
                                <div className="text-4xl font-bold">{days}</div>
                                <div className="mt-1 text-xs uppercase">Days</div>
                            </div>
                            <div className="rounded-lg bg-white/50 p-3 backdrop-blur-sm dark:bg-black/20">
                                <div className="text-4xl font-bold">{hours}</div>
                                <div className="mt-1 text-xs uppercase">Hours</div>
                            </div>
                            <div className="rounded-lg bg-white/50 p-3 backdrop-blur-sm dark:bg-black/20">
                                <div className="text-4xl font-bold">{minutes}</div>
                                <div className="mt-1 text-xs uppercase">Minutes</div>
                            </div>
                            <div className="rounded-lg bg-white/50 p-3 backdrop-blur-sm ring-2 ring-indigo-500 dark:bg-black/20">
                                <div className="animate-pulse text-4xl font-bold text-indigo-500">{seconds}</div>
                                <div className="mt-1 text-xs uppercase">Seconds</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}


/**
 * PausedScreen (New Redesign):
 * - A modern "glassmorphism" effect with a blurred background.
 * - Subtle background noise pattern for texture.
 * - Clean, focused, and high-tech feel.
 */
export function PausedScreen() {
    return (
        <div className="relative overflow-hidden rounded-xl p-8 text-center bg-slate-100 dark:bg-zinc-900">
            {/* Background noise pattern */}
            <div
                className="absolute inset-0 opacity-40 dark:opacity-100"
                style={{
                    backgroundImage: 'url(\'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800"><rect fill="%23a8a29e" width="800" height="800"/><g fill-rule="evenodd"><circle fill="%23d6d3d1" cx="400" cy="400" r="200"/><circle fill="%23a8a29e" cx="400" cy="400" r="100"/></g></svg>\')',
                    filter: 'url(#noise)',
                }}
            />
            {/* Frosted glass container */}
            <div className="relative z-10 rounded-2xl border border-white/20 bg-white/20 p-8 shadow-lg backdrop-blur-xl dark:border-zinc-700/50 dark:bg-zinc-800/20">
                <PauseCircleIcon className="mx-auto h-12 w-12 animate-pulse text-yellow-500" />
                <h3 className="mt-4 text-xl font-semibold text-yellow-900 dark:text-yellow-200">Updates are Paused</h3>
                <p className="mt-2 text-yellow-700 dark:text-yellow-400">Please stand by. We&apos;ll be back with more updates shortly.</p>
            </div>
            {/* SVG filter for noise effect */}
            <svg className="absolute">
                <filter id="noise">
                    <feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="4" stitchTiles="stitch" />
                    <feComposite operator="in" in2="SourceGraphic" result="monoNoise" />
                    <feBlend in="SourceGraphic" in2="monoNoise" mode="multiply" />
                </filter>
            </svg>
        </div>
    );
}

/**
 * EndedScreen (Apostrophe fix)
 */
export function EndedScreen({ announcements }: { announcements: Announcement[] }) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white shadow-md dark:border-zinc-800 dark:bg-zinc-900">
            <div className="bg-gray-50/50 p-8 text-center dark:bg-zinc-800/20">
                <CheckCircleIcon className="mx-auto h-14 w-14 text-green-500" />
                <h3 className="mt-4 text-2xl font-bold text-gray-900 dark:text-zinc-100">
                    And that&apos;s a wrap! ✨
                </h3>
                <p className="mt-2 text-gray-600 dark:text-zinc-400">
                    Thank you for joining us. The event archive is available below.
                </p>
            </div>
            <div className="p-6">
                <h4 className="mb-4 flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                    <CalendarDaysIcon className="h-5 w-5" />
                    Event Archive
                </h4>
                {announcements.length > 0 ? (
                    <div className="flow-root">
                        <ul role="list" className="-mb-4">
                            {announcements.map((ann, annIdx) => (
                                <li key={ann.id}>
                                    <div className="relative pb-4">
                                        {annIdx !== announcements.length - 1 ? (
                                            <span className="absolute left-3 top-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-zinc-700" aria-hidden="true" />
                                        ) : null}
                                        <div className="relative flex items-start space-x-3">
                                            <div className="relative">
                                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 ring-4 ring-white dark:bg-zinc-800 dark:ring-zinc-900">
                                                    <DocumentTextIcon className="h-4 w-4 text-gray-500 dark:text-zinc-400" />
                                                </div>
                                            </div>
                                            <div className="min-w-0 flex-1 rounded-md border border-gray-200/80 bg-white/50 px-3 py-2 dark:border-zinc-700/50 dark:bg-zinc-800/50">
                                                <p className="font-semibold text-gray-900 dark:text-zinc-100">{ann.title}</p>
                                                <p className="text-sm text-gray-600 dark:text-zinc-400">{ann.content}</p>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <p className="py-8 text-center text-gray-500 dark:text-zinc-400">No announcements were made during this event.</p>
                )}
            </div>
        </div>
    );
}


/**
 * CancelledScreen (No changes needed)
 */
export function CancelledScreen() {
    return (
        <div className="relative rounded-lg border border-red-300 bg-red-50 p-8 text-center overflow-hidden dark:border-red-900/50 dark:bg-red-950/30">
            <NoSymbolIcon className="absolute -right-8 -top-8 h-48 w-48 text-red-500/10 -rotate-12 dark:text-red-500/5" />
            <div className="relative z-10">
                <NoSymbolIcon className="mx-auto h-12 w-12 text-red-500" />
                <h3 className="mt-4 text-xl font-semibold text-red-900 dark:text-red-200">Event Cancelled</h3>
                <p className="mt-2 text-red-700 dark:text-red-400">Unfortunately, this event will not be taking place. Please check official channels for more information.</p>
            </div>
        </div>
    );
}