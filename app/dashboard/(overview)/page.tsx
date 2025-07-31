import { Suspense } from "react";
import CardWrapper from "@/app/ui/dashboard/cards";
import LatestEvents from "@/app/ui/dashboard/latest-events";
import { DashboardCardsSkeleton, RecentEventsSkeleton } from "@/app/ui/skeletons";

export default async function Page() {
    return (
        <main>
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