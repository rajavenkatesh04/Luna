// app/ui/dashboard/latest-events.tsx

import { fetchLatestEvents } from '@/app/lib/data';
import { auth } from '@/app/lib/firebase-admin';
import Link from 'next/link';

export default async function LatestEvents() {
    const session = await auth.getSession();
    if (!session) return null;

    const latestEvents = await fetchLatestEvents(session.uid);

    return (
        <div className="flex w-full flex-col">
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-zinc-100 md:text-2xl">Recent Events</h2>
            <div className="flex grow flex-col justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                {latestEvents.length === 0 ? (
                    <div className="py-8 text-center text-gray-500 dark:text-zinc-400">
                        <p>No recent events found. Create one to get started!</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200 dark:divide-zinc-800">
                        {latestEvents.map((event) => {
                            const isOwner = event.ownerUid === session.uid;

                            return (
                                <div key={event.docId} className="flex flex-row items-center justify-between py-4">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="truncate text-sm font-medium text-gray-900 dark:text-zinc-100 md:text-base">{event.title}</p>
                                            {isOwner ? (
                                                <span className="inline-flex items-center rounded-md bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-900/50 dark:text-amber-300 dark:ring-amber-400/20">
                                                    Owner
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 ring-1 ring-inset ring-blue-600/20 dark:bg-blue-900/50 dark:text-blue-300 dark:ring-blue-400/20">
                                                    Admin
                                                </span>
                                            )}
                                        </div>
                                        <p className="hidden truncate text-sm text-gray-500 sm:block dark:text-zinc-400">{event.description || 'No description'}</p>
                                    </div>
                                    <Link
                                        href={`/dashboard/events/${event.docId}`}
                                        className="ml-4 flex-shrink-0 rounded-md border border-gray-300 p-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                                    >
                                        Manage
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}