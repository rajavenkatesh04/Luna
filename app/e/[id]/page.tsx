'use client';

import { useEffect, useState } from 'react';
import { db } from '@/app/lib/firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { Announcement, Event } from '@/app/lib/definitions';
import { UserCircleIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { BookmarkIcon } from '@heroicons/react/24/solid';
import Navbar from "@/app/ui/Navbar";
import LoadingSpinner from "@/app/ui/dashboard/loading-spinner";
import NotificationButton from "@/app/ui/NotificationButton";
import { AnnouncementsFeedSkeleton } from '@/app/ui/skeletons';

// Helper function remains the same
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
    const [isFeedLoading, setIsFeedLoading] = useState(true);
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
                setIsLoading(false);

                const announcementsQuery = query(
                    collection(db, `${data.eventPath}/announcements`),
                    orderBy('createdAt', 'desc')
                );

                unsubscribe = onSnapshot(announcementsQuery, (querySnapshot) => {
                    const announcementsData = querySnapshot.docs.map(doc => doc.data() as Announcement);
                    announcementsData.sort((a, b) => {
                        if (a.isPinned && !b.isPinned) return -1;
                        if (!a.isPinned && b.isPinned) return 1;
                        return b.createdAt.seconds - a.createdAt.seconds;
                    });

                    setAnnouncements(announcementsData);
                    setIsFeedLoading(false);
                }, (err) => {
                    console.error("Snapshot error:", err);
                    setError("Could not load announcements.");
                    setIsFeedLoading(false);
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

        return () => unsubscribe();
    }, [params]);

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center gap-2 text-gray-800 dark:text-zinc-200">
                <LoadingSpinner /> Loading Event...
            </div>
        );
    }

    if (error) {
        return (
            <main className="flex min-h-screen items-center justify-center text-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">Event Not Found</h1>
                    <p className="text-gray-600 dark:text-zinc-400">The event code is invalid or the event has ended.</p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-zinc-900">
            <Navbar />
            <div className="mx-auto max-w-2xl p-4 md:p-8">
                <header className="mb-8 text-center">
                    <h1 className="bg-gradient-to-r from-zinc-300 via-zinc-100 to-zinc-300 bg-clip-text text-4xl font-bold text-transparent">
                        {event?.title}
                    </h1>
                    <p className="mt-2 text-lg text-gray-600 dark:text-zinc-300">{event?.description}</p>
                    <div className="mt-6 flex justify-center">
                        {eventId && <NotificationButton eventId={eventId} />}
                    </div>
                </header>

                <div className="space-y-4">
                    {isFeedLoading ? (
                        <AnnouncementsFeedSkeleton />
                    ) : announcements.length > 0 ? (
                        announcements.map(ann => (
                            <div key={ann.id} className="animate-fade-in rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                                <div className="flex items-center gap-2">
                                    {ann.isPinned && (
                                        <BookmarkIcon
                                            className="h-5 w-5 text-amber-500"
                                            title="Pinned Announcement"
                                        />
                                    )}
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">{ann.title}</h2>
                                </div>
                                <p className="mt-2 whitespace-pre-wrap text-gray-700 dark:text-zinc-300">{ann.content}</p>
                                <div className="mt-4 flex items-center gap-4 border-t border-gray-200 pt-3 text-xs text-gray-500 dark:border-zinc-800 dark:text-zinc-400">
                                    <span className="flex items-center gap-1.5 font-medium"><UserCircleIcon className="w-4 h-4" /> {ann.authorName}</span>
                                    <span className="flex items-center gap-1.5"><CalendarIcon className="w-4 h-4" />
                                        {new Intl.DateTimeFormat('en-IN', {
                                            dateStyle: 'medium',
                                            timeStyle: 'short',
                                        }).format(new Date(ann.createdAt.seconds * 1000))}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="rounded-lg border border-dashed border-gray-300 bg-white py-12 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                            <p className="text-gray-500 dark:text-zinc-400">No announcements yet. <br /> Stay tuned for updates!</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}