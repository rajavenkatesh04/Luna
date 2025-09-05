import { Suspense } from "react";
import CardWrapper from "@/app/ui/dashboard/cards";
import LatestEvents from "@/app/ui/dashboard/latest-events";
import { DashboardCardsSkeleton, RecentEventsSkeleton } from "@/app/ui/skeletons";
import {ShieldExclamationIcon } from "@heroicons/react/24/solid";


const InsufficientPermissionsMessage = () => (
    <div className="min-h-[50vh] my-10 rounded-lg flex items-center justify-center relative overflow-hidden shadow-2xl
        bg-gray-50 border border-red-300 shadow-red-500/20
        dark:bg-black dark:border-red-900/50 dark:shadow-red-950/50"
    >
        {/* Animated background gradient */}
        <div className="absolute inset-0 animate-pulse
            bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(239,68,68,0.15),rgba(255,255,255,0))]
            dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(220,38,38,0.3),rgba(255,255,255,0))]"
        ></div>

        {/* Main content */}
        <div className="relative z-10 text-center max-w-3xl px-8 py-16">
            {/* Icon with a slow, ominous pulse */}
            <div className="mb-8 relative">
                <div className="absolute -inset-2 rounded-full blur-xl animate-[pulse_4s_ease-in-out_infinite]
                    bg-red-500 opacity-20
                    dark:bg-red-600"
                ></div>
                <ShieldExclamationIcon className="relative h-20 w-20 mx-auto text-red-500
                    drop-shadow-[0_0_15px_rgba(239,68,68,0.4)]
                    dark:drop-shadow-[0_0_15px_rgba(220,38,38,0.6)]"
                />
            </div>

            {/* Main warning text */}
            <div className="space-y-6">
                <h1 className="text-5xl font-bold tracking-tight
                    text-red-600 drop-shadow-[0_0_8px_rgba(239,68,68,0.3)]
                    dark:text-red-400 dark:drop-shadow-[0_0_8px_rgba(220,38,38,0.5)]"
                >
                    Access Restricted
                </h1>

                <div className="p-6 rounded-md backdrop-blur-sm shadow-lg
                    border border-red-300/50 bg-red-50/80
                    dark:border-red-800/50 dark:bg-red-950/30"
                >
                    <p className="text-xl font-semibold mb-2 text-red-700 dark:text-red-200">
                        Insufficient Privileges
                    </p>
                    <p className="text-red-600 dark:text-red-300">
                        Your assigned user role does not grant permission to access this resource.
                    </p>
                </div>

                {/* System log message */}
                <div className="space-y-2 font-mono text-xs text-left p-4 rounded-sm
                    bg-gray-100/50 border border-red-300/50 text-red-600/90
                    dark:bg-black/30 dark:border-red-900/50 dark:text-red-400/80"
                >
                    <p>
                        <span className="font-bold text-red-700 dark:text-red-500">EVENT:</span> UNAUTHORIZED_ACCESS_ATTEMPT
                    </p>
                    <p className="animate-pulse">
                        <span className="font-bold text-red-700 dark:text-red-500">STATUS:</span> LOGGED_AND_FLAGGED
                    </p>
                    <p>
                        <span className="font-bold text-red-700 dark:text-red-500">ACTION:</span> INCIDENT_REPORT_GENERATED
                    </p>
                </div>

                {/* Call to action */}
                <div className="mt-8">
                    {/* Note: Consider wrapping this in a <button> or <Link> for functionality */}
                    <div className="inline-block px-6 py-2 border rounded-md transition-all duration-300 font-semibold cursor-pointer
                        border-red-400 bg-red-100/50 text-red-700 hover:bg-red-200/50 hover:text-red-800
                        dark:border-red-700 dark:bg-red-950/50 dark:text-red-300 dark:hover:bg-red-800/50 dark:hover:text-red-100"
                    >
                        Return to previous page
                    </div>
                </div>
            </div>
        </div>

        {/* Subtle scan line effect */}
        <div className="absolute bottom-0 left-0 w-full h-1 blur-sm animate-[pulse_6s_ease-in-out_infinite]
            bg-red-500/5
            dark:bg-red-500/10"
        ></div>
    </div>
);

export default async function Page({
                                            searchParams,
                                        }: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const resolvedSearchParams = await searchParams;
    const isInsufficientPermissions = resolvedSearchParams['error'] === 'insufficient_permissions';


    return (
        <main>
            {isInsufficientPermissions && <InsufficientPermissionsMessage />}
            <h1 className="mb-4 text-xl font-semibold text-gray-900 dark:text-zinc-100 md:text-2xl">
                Dashboard Overview
            </h1>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
                <Suspense fallback={<DashboardCardsSkeleton />}>
                    <CardWrapper />
                </Suspense>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-6">
                <Suspense fallback={<RecentEventsSkeleton />}>
                    <LatestEvents />
                </Suspense>
            </div>
        </main>
    );
}