import { Suspense } from 'react';
import Link from 'next/link';
import { fetchLatestEvents } from '@/app/lib/data';
import { auth } from '@/app/lib/firebase-admin';
import CreateEventForm from '@/app/ui/dashboard/create-event-form';
import { CardsSkeleton } from '@/app/ui/skeletons';

async function EventsList() {
    const session = await auth.getSession();
    if (!session) return null;

    // Note: fetchLatestEvents gets 5 events. For a full list, you'd remove the 'limit(5)' in data.ts
    const events = await fetchLatestEvents(session.uid);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.length > 0 ? (
                events.map(event => (
                    <Link href={`/dashboard/events/${event.docId}`} key={event.docId} className="block border border-gray-500 p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow">
                        <h3 className="font-bold text-xl mb-2 text-blue-600">{event.title}</h3>
                        <p className=" truncate">{event.description || 'No description'}</p>
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-500">Event ID:  <span className="font-mono bg-gray-200 mx-2 px-1 py-1 rounded">{event.id}</span></p>
                        </div>
                    </Link>
                ))
            ) : (
                <div className="md:col-span-3 text-center py-12 border border-gray-700 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold">No events yet!</h3>
                    <p className="text-gray-500 mt-2">Click the <span className={`text-green-600`}>+ Create Event</span>  button to get started.</p>
                </div>
            )}
        </div>
    );
}


export default function Page() {
    return (
        <main>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Events</h1>
                <CreateEventForm />
            </div>
            <Suspense fallback={<CardsSkeleton />}>
                <EventsList />
            </Suspense>
        </main>
    );
}
