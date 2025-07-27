import { fetchLatestEvents } from '@/app/lib/data';
import { auth } from '@/app/lib/firebase-admin';
import Link from 'next/link';

export default async function LatestEvents() {
    const session = await auth.getSession();
    if (!session) return null;

    const latestEvents = await fetchLatestEvents(session.uid);

    return (
        <div className="flex w-full flex-col">
            <h2 className="mb-4 text-xl md:text-2xl">
                Recent Events
            </h2>
            <div className="flex grow flex-col justify-between rounded-xl border border-gray-500 p-4 shadow-sm">
                {latestEvents.length === 0 ? (
                    <div className="text-center py-8">
                        <p>No recent events found. Create one to get started!</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {latestEvents.map((event, i) => (
                            <div key={event.docId} className="flex flex-row items-center justify-between py-4">
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm  md:text-base">{event.title}</p>
                                    <p className="hidden text-sm sm:block truncate">{event.description || 'No description'}</p>
                                </div>
                                <Link
                                    href={`/dashboard/events/${event.docId}`}
                                    className="ml-4 flex-shrink-0 rounded-md border p-2 hover:bg-blue-500 hover:text-white"
                                >
                                    <p className="font-medium text-sm">Manage</p>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
