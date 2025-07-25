import { Suspense } from "react";
import CardWrapper from "@/app/ui/dashboard/cards";
import { CardsSkeleton } from "@/app/ui/skeletons"; // Make sure you have this skeleton component
import LatestEvents from "@/app/ui/dashboard/latest-events";

export default async function Page() {
    return (
        <main>
            <h1 className="mb-4 text-xl md:text-2xl">Dashboard Overview</h1>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <Suspense fallback={<CardsSkeleton />}>
                    <CardWrapper />
                </Suspense>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-6">
                <Suspense fallback={<div className="rounded-xl bg-white p-4 shadow-sm h-64">Loading...</div>}>
                    <LatestEvents />
                </Suspense>
            </div>
        </main>
    )
}
