// app/ui/skeletons.tsx

// Loading animation with dark mode support
const shimmer =
    'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 dark:before:via-gray-800/60 before:to-transparent';

export function CardSkeleton() {
    return (
        <div
            className={`${shimmer} relative overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 p-2 shadow-sm`}
        >
            <div className="flex p-4">
                <div className="h-5 w-5 rounded-md bg-gray-200 dark:bg-gray-700" />
                <div className="ml-2 h-6 w-16 rounded-md bg-gray-200 dark:bg-gray-700 text-sm font-medium" />
            </div>
            <div className="flex items-center justify-center truncate rounded-xl bg-white dark:bg-gray-900 px-4 py-8">
                <div className="h-7 w-20 rounded-md bg-gray-200 dark:bg-gray-700" />
            </div>
        </div>
    );
}

export function CardsSkeleton() {
    return (
        <>
            <CardSkeleton />
            <CardSkeleton />
        </>
    );
}

export function AnnouncementSkeleton() {
    return (
        <div className="flex flex-row items-center justify-between border-b border-gray-100 dark:border-gray-700 py-4">
            <div className="flex items-center">
                <div className="mr-2 h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700" />
                <div className="min-w-0">
                    <div className="h-5 w-40 rounded-md bg-gray-200 dark:bg-gray-700" />
                    <div className="mt-2 h-4 w-24 rounded-md bg-gray-200 dark:bg-gray-700" />
                </div>
            </div>
            <div className="mt-2 h-4 w-12 rounded-md bg-gray-200 dark:bg-gray-700" />
        </div>
    );
}

export function LatestAnnouncementsSkeleton() {
    return (
        <div
            className={`${shimmer} relative flex w-full flex-col overflow-hidden md:col-span-4`}
        >
            <div className="mb-4 h-8 w-36 rounded-md bg-gray-100 dark:bg-gray-800" />
            <div className="flex grow flex-col justify-between rounded-xl bg-gray-100 dark:bg-gray-800 p-4">
                <div className="bg-white dark:bg-gray-900 px-6">
                    <AnnouncementSkeleton />
                    <AnnouncementSkeleton />
                    <AnnouncementSkeleton />
                    <AnnouncementSkeleton />
                </div>
            </div>
        </div>
    );
}

export default function DashboardSkeleton() {
    return (
        <>
            <div
                className={`${shimmer} relative mb-4 h-8 w-36 overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800`}
            />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <CardSkeleton />
                <CardSkeleton />
            </div>
            <div className="mt-6 grid grid-cols-1 gap-6">
                <LatestAnnouncementsSkeleton />
            </div>
        </>
    );
}

export function EventsTableSkeleton() {
    return (
        <div className="mt-6 flow-root">
            <div className="inline-block min-w-full align-middle">
                <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-2 md:pt-0">
                    <table className="hidden min-w-full text-gray-500 dark:text-gray-400 md:table">
                        <thead className="rounded-lg text-left text-sm font-normal">
                        <tr>
                            <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                                Event Title
                            </th>
                            <th scope="col" className="px-3 py-5 font-medium">
                                Date Created
                            </th>
                            <th scope="col" className="px-3 py-5 font-medium">
                                Admins
                            </th>
                            <th scope="col" className="relative py-3 pl-6 pr-3">
                                <span className="sr-only">Edit</span>
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900">
                        <TableRowSkeleton />
                        <TableRowSkeleton />
                        <TableRowSkeleton />
                        <TableRowSkeleton />
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export function TableRowSkeleton() {
    return (
        <tr className="w-full border-b border-gray-100 dark:border-gray-700 last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg">
            {/* Event Title */}
            <td className="relative overflow-hidden whitespace-nowrap py-3 pl-6 pr-3">
                <div className="flex items-center gap-3">
                    <div className="h-6 w-32 rounded bg-gray-100 dark:bg-gray-700"></div>
                </div>
            </td>
            {/* Date */}
            <td className="whitespace-nowrap px-3 py-3">
                <div className="h-6 w-24 rounded bg-gray-100 dark:bg-gray-700"></div>
            </td>
            {/* Admins */}
            <td className="whitespace-nowrap px-3 py-3">
                <div className="h-6 w-16 rounded bg-gray-100 dark:bg-gray-700"></div>
            </td>
            {/* Actions */}
            <td className="whitespace-nowrap py-3 pl-6 pr-3">
                <div className="flex justify-end gap-3">
                    <div className="h-[38px] w-[38px] rounded bg-gray-100 dark:bg-slate-950"></div>
                </div>
            </td>
        </tr>
    );
}
