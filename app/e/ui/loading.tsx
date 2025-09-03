
const shimmer =
    'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 dark:before:via-zinc-800/60 before:to-transparent';

function HeaderSkeleton() {
    return (
        <div className="mb-8 border-b border-gray-200/80 pb-8 dark:border-zinc-800/50">
            <div className="mb-6 h-48 w-full rounded-lg bg-gray-200 dark:bg-zinc-800"></div>
            <div className="flex items-center justify-between">
                <div className="h-10 w-3/5 rounded-md bg-gray-200 dark:bg-zinc-800"></div>
                <div className="h-8 w-20 rounded-full bg-gray-200 dark:bg-zinc-800"></div>
            </div>
            <div className="mt-4 flex gap-6">
                <div className="h-5 w-1/4 rounded-md bg-gray-200 dark:bg-zinc-800"></div>
                <div className="h-5 w-1/3 rounded-md bg-gray-200 dark:bg-zinc-800"></div>
            </div>
        </div>
    );
}

function AnnouncementCardSkeleton() {
    return (
        <div className="rounded-lg border border-gray-200/80 bg-white p-4 dark:border-zinc-800/50 dark:bg-zinc-900">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <div className="mb-2 h-4 w-1/4 rounded-md bg-gray-200 dark:bg-zinc-800"></div>
                    <div className="mb-3 h-5 w-4/5 rounded-md bg-gray-200 dark:bg-zinc-800"></div>
                    <div className="h-4 w-3/5 rounded-md bg-gray-200 dark:bg-zinc-800"></div>
                </div>
                <div className="h-6 w-6 rounded-md bg-gray-200 dark:bg-zinc-800"></div>
            </div>
        </div>
    );
}

export default function Loading() {
    return (
        <div className={`${shimmer} relative overflow-hidden`}>
            {/* Navbar Skeleton */}
            <div className="sticky top-0 z-50 h-16 border-b border-gray-200/80 bg-white/80 dark:border-zinc-800 dark:bg-zinc-900/80"></div>
            <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:py-12">
                <HeaderSkeleton />
                <div className="space-y-4">
                    <AnnouncementCardSkeleton />
                    <AnnouncementCardSkeleton />
                    <AnnouncementCardSkeleton />
                </div>
            </div>
        </div>
    );
}