'use client';

import { useEffect, useState } from 'react';
import { db } from '@/app/lib/firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { Announcement, Event } from '@/app/lib/definitions';
import { UserCircleIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { BookmarkIcon } from '@heroicons/react/24/solid'; // Using solid icon for better visibility
import Navbar from "@/app/ui/Navbar";
import LoadingSpinner from "@/app/ui/dashboard/loading-spinner";
import NotificationButton from "@/app/ui/NotificationButton";

// Helper function to fetch the initial event data
async function getInitialEventData(eventCode: string) {
    try {
        const response = await fetch(`/api/events/${eventCode}`);
        if (!response.ok) return null;
        return response.json();
    } catch (error) {
        console.error("Failed to fetch initial event data:", error);
        return null;
    }
}

export default function PublicEventPage({ params }: { params: Promise<{ id: string }> }) {
    const [event, setEvent] = useState<Event | null>(null);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [eventId, setEventId] = useState<string | null>(null);

    useEffect(() => {
        let unsubscribe = () => {};

        params.then(resolvedParams => {
            const currentEventId = resolvedParams.id;
            setEventId(currentEventId);
            return getInitialEventData(currentEventId);
        }).then(data => {
            if (data && data.eventData && data.eventPath) {
                setEvent(data.eventData);

                // --- THE LIVE FEED ---
                const announcementsQuery = query(
                    collection(db, `${data.eventPath}/announcements`),
                    orderBy('createdAt', 'desc')
                );

                unsubscribe = onSnapshot(announcementsQuery, (querySnapshot) => {
                    const announcementsData = querySnapshot.docs.map(doc => doc.data() as Announcement);

                    // Sort announcements: pinned items first, then by date
                    announcementsData.sort((a, b) => {
                        if (a.isPinned && !b.isPinned) return -1;
                        if (!a.isPinned && b.isPinned) return 1;
                        // For items with the same pinned status, sort by date
                        return b.createdAt.seconds - a.createdAt.seconds;
                    });

                    setAnnouncements(announcementsData);
                    setIsLoading(false);
                }, (err) => {
                    console.error("Snapshot error:", err);
                    setError("Could not load announcements.");
                    setIsLoading(false);
                });

            } else {
                setError("Event not found.");
                setIsLoading(false);
            }
        }).catch(err => {
            console.error("Error loading event:", err);
            setError("Could not load event.");
            setIsLoading(false);
        });

        // Cleanup listener on component unmount
        return () => unsubscribe();
    }, [params]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner className="mr-2" />
                Loading Event...
            </div>
        );
    }

    if (error) {
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
        <main className="min-h-screen">
            <Navbar />
            <div className="max-w-2xl mx-auto p-4 md:p-8">
                <header className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400">{event?.title}</h1>
                    <p className="mt-2 text-lg text-gray-600">{event?.description}</p>
                    <div className="mt-6 flex justify-center">
                        {eventId && <NotificationButton eventId={eventId} />}
                    </div>
                </header>

                <div className="space-y-4">
                    {announcements.length > 0 ? (
                        announcements.map(ann => (
                            <div key={ann.id} className="p-5  border rounded-lg shadow-sm animate-fade-in">
                                <div className="flex items-center gap-2">
                                    {ann.isPinned && (
                                        <BookmarkIcon
                                            className="h-5 w-5 text-blue-600"
                                            title="Pinned Announcement"
                                        />
                                    )}
                                    <h2 className="text-lg ">{ann.title}</h2>
                                </div>
                                <p className="mt-2  whitespace-pre-wrap">{ann.content}</p>
                                <div className="flex items-center gap-4 text-xs text-gray-500 mt-4 pt-3 border-t">
                                    <span className="flex items-center gap-1.5"><UserCircleIcon className="w-4 h-4" /> {ann.authorName}</span>
                                    <span className="flex items-center gap-1.5"><CalendarIcon className="w-4 h-4" /> {new Date(ann.createdAt.seconds * 1000).toLocaleString()}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-gray-500 py-12">
                            <p>No announcements yet. <br /> Stay tuned for updates!</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}