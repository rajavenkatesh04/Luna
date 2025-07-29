// app/dashboard/events/page.tsx
import { Suspense } from 'react';
import Link from 'next/link';
import { fetchLatestEvents } from '@/app/lib/data';
import { auth } from '@/app/lib/firebase-admin';
import { EventsListSkeleton } from "@/app/ui/skeletons";

async function EventsList() {
    const session = await auth.getSession();
    if (!session) return null;

    // fetchLatestEvents gets 5 events where the user is an admin or owner.
    const events = await fetchLatestEvents(session.uid);

    return (
        <div className="space-y-3 py-12 rounded-lg">
            {events.length > 0 ? (
                events.map(event => {
                    // Check if the current user is the owner of this specific event
                    const isOwner = event.ownerUid === session.uid;

                    return (
                        <Link href={`/dashboard/events/${event.docId}`} key={event.docId} className="block border border-gray-500 p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow">
                            {/* Flex container for the title and the new badge */}
                            <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-xl bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-orange-600">{event.title}</h3>

                                {/* Conditionally render the badge based on whether the user is the owner */}
                                {isOwner ? (
                                    <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
                                        Owner
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
                                        Admin
                                    </span>
                                )}
                            </div>

                            <p className="truncate">{event.description || 'No description'}</p>
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <p className="text-sm text-gray-500">Event ID: <span className="font-mono bg-gray-200 mx-2 px-1 py-1 rounded">{event.id}</span></p>
                            </div>
                        </Link>
                    );
                })
            ) : (
                <div className="md:col-span-3 text-center py-12 border border-gray-700 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold">No events yet!</h3>
                    <p className="text-gray-500 mt-2">Click the <span className={`text-blue-600 font-semibold px-2 `}>+ Create Event</span> button to get started.</p>
                </div>
            )}
        </div>
    );
}


export default function Page() {
    return (
        <main>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl">Events</h1>
                <Link
                    href="/dashboard/events/create"
                    className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50">
                    <span className="mr-2">+</span> Create Event
                </Link>

            </div>
            <Suspense fallback={<EventsListSkeleton />}>
                <EventsList />
            </Suspense>
        </main>
    );
}