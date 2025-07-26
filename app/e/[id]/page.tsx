'use client';

import { useEffect, useState } from 'react';
import { db } from '@/app/lib/firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { Announcement, Event } from '@/app/lib/definitions';
import { notFound } from 'next/navigation';
import { UserCircleIcon, CalendarIcon } from '@heroicons/react/24/outline';

// This is a helper function to fetch the initial event data.
// In a real app, you might use a library like SWR or React Query for this.
async function getInitialEventData(eventCode: string) {
    // This is a client-side fetch to a simple API route we will create.
    const response = await fetch(`/api/events/${eventCode}`);
    if (!response.ok) return null;
    return response.json();
}

export default function PublicEventPage({ params }: { params: { id: string } }) {
    const [event, setEvent] = useState<Event | null>(null);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Fetch the initial event details
        getInitialEventData(params.id)
            .then(data => {
                if (data && data.eventData && data.eventPath) {
                    setEvent(data.eventData);

                    // --- THE LIVE FEED ---
                    // Once we have the event path, we set up the real-time listener
                    const announcementsQuery = query(
                        collection(db, `${data.eventPath}/announcements`),
                        orderBy('createdAt', 'desc')
                    );

                    const unsubscribe = onSnapshot(announcementsQuery, (querySnapshot) => {
                        const announcementsData = querySnapshot.docs.map(doc => doc.data() as Announcement);
                        setAnnouncements(announcementsData);
                        setIsLoading(false);
                    }, (err) => {
                        console.error("Snapshot error:", err);
                        setError("Could not load announcements.");
                        setIsLoading(false);
                    });

                    return () => unsubscribe(); // Cleanup listener
                } else {
                    setError("Event not found.");
                    setIsLoading(false);
                }
            });
    }, [params.id]);

    if (isLoading) {
        return <div className="flex items-center justify-center min-h-screen">Loading Event...</div>;
    }

    if (error) {
        // A simple not-found-like page for errors
        return (
            <main className="flex items-center justify-center min-h-screen text-center">
                <div>
                    <h1 className="text-2xl font-bold">Event Not Found</h1>
                    <p>The event code is invalid or the event has ended.</p>
                </div>
            </main>
        );
    }

    return (
        <main className="bg-gray-50 min-h-screen">
            <div className="max-w-2xl mx-auto p-4 md:p-8">
                <header className="text-center mb-8">
                    <h1 className="text-4xl font-bold">{event?.title}</h1>
                    <p className="mt-2 text-lg text-gray-600">{event?.description}</p>
                </header>

                <div className="space-y-4">
                    {announcements.length > 0 ? (
                        announcements.map(ann => (
                            <div key={ann.id} className="p-5 bg-white border rounded-lg shadow-sm animate-fade-in">
                                <p className="font-bold text-lg">{ann.title}</p>
                                <p className="mt-1 text-gray-800 whitespace-pre-wrap">{ann.content}</p>
                                <div className="flex items-center gap-4 text-xs text-gray-500 mt-4 pt-3 border-t">
                                    <span className="flex items-center gap-1.5"><UserCircleIcon className="w-4 h-4" /> {ann.authorName}</span>
                                    <span className="flex items-center gap-1.5"><CalendarIcon className="w-4 h-4" /> {new Date(ann.createdAt.seconds * 1000).toLocaleString()}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-gray-500 py-12">
                            <p>No announcements yet. Stay tuned for updates!</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
