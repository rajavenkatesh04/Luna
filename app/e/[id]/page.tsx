'use client';

import { useEffect, useState } from 'react';
import { db } from '@/app/lib/firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { Announcement, Event } from '@/app/lib/definitions';
import { UserCircleIcon, CalendarIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { BookmarkIcon } from '@heroicons/react/24/solid';
import Navbar from "@/app/ui/Navbar";
import LoadingSpinner from "@/app/ui/dashboard/loading-spinner";
import NotificationButton from "@/app/ui/NotificationButton";
import { AnnouncementsFeedSkeleton } from '@/app/ui/skeletons';
import Link from 'next/link';
import ExpandableText from '@/app/ui/expandable-text';
import { formatRelativeDate } from '@/app/lib/utils';

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
                    const announcementsData = querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as Announcement));
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
        <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-black dark:text-slate-200">
            <Navbar />
            <main className="mx-auto w-full max-w-3xl px-6 py-12 md:px-8 md:py-16">
                <section className="mb-16 rounded-2xl border border-gray-200/80 bg-white/80 p-8 shadow-sm backdrop-blur-sm dark:border-zinc-800/50 dark:bg-zinc-900/50">
                    <h1 className="mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-center text-5xl font-bold leading-tight text-transparent dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 md:text-6xl">
                        {event?.title}
                    </h1>
                    <ExpandableText text={event?.description} />
                    <div className="mt-8 flex justify-center">
                        {eventId && <NotificationButton eventId={eventId} />}
                    </div>
                </section>

                <section className="space-y-8">
                    {isFeedLoading ? (
                        <AnnouncementsFeedSkeleton />
                    ) : announcements.length > 0 ? (
                        announcements.map(ann => {
                            const isNew = (new Date().getTime() / 1000 - ann.createdAt.seconds) < 86400;

                            return (
                                <article key={ann.id} className="animate-fade-in rounded-2xl border border-gray-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-sm dark:border-zinc-800/50 dark:bg-zinc-900/50">
                                    <header className="mb-4">
                                        <div className="flex flex-wrap items-center gap-3">
                                            {ann.isPinned && (
                                                <div className="flex flex-shrink-0 items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 dark:bg-amber-900/30">
                                                    <BookmarkIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                                    <span className="text-xs font-medium text-amber-700 dark:text-amber-300">Pinned</span>
                                                </div>
                                            )}
                                            {isNew && (
                                                <div className="flex flex-shrink-0 items-center rounded-full bg-blue-100 px-2.5 py-1 dark:bg-blue-900/30">
                                                    <span className="text-xs font-medium text-blue-700 dark:text-blue-300">New</span>
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="mt-3 text-xl font-semibold text-gray-900 dark:text-zinc-100">{ann.title}</h3>
                                    </header>

                                    <p className="whitespace-pre-wrap leading-relaxed text-gray-700 dark:text-zinc-300">{ann.content}</p>

                                    <footer className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-gray-100 pt-4 text-sm text-gray-500 dark:border-zinc-800/50 dark:text-zinc-400">
                                        <div className="flex items-center gap-2">
                                            <UserCircleIcon className="h-4 w-4" />
                                            <span className="font-medium">{ann.authorName}</span>
                                        </div>
                                        <div className="flex items-center gap-2 opacity-80">
                                            <CalendarIcon className="h-4 w-4" />
                                            <span>{formatRelativeDate(ann.createdAt)}</span>
                                        </div>
                                    </footer>
                                </article>
                            );
                        })
                    ) : (
                        <div className="rounded-2xl border-2 border-dashed border-gray-300/50 bg-white/50 py-16 text-center backdrop-blur-sm dark:border-zinc-700/50 dark:bg-zinc-900/30">
                            <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-zinc-100">No announcements yet</h3>
                            <p className="text-gray-500 dark:text-zinc-400">Stay tuned for updates from the organizers!</p>
                        </div>
                    )}
                </section>
            </main>

            <footer className="w-full border-t border-gray-200/50 bg-white/30 py-6 backdrop-blur-sm dark:border-zinc-800/50 dark:bg-zinc-900/30">
                <div className="mx-auto flex max-w-3xl items-center justify-between px-6 text-sm text-gray-500 dark:text-zinc-500 md:px-8">
                    <div className="flex items-center gap-2">
                        <SparklesIcon className="h-4 w-4 text-indigo-500" />
                        <span>Powered by <span className="font-medium text-gray-700 dark:text-zinc-300">Luna</span></span>
                    </div>
                    <Link
                        href="/login"
                        className="text-sm text-gray-600 transition-colors hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400"
                    >
                        Create Your Event →
                    </Link>
                </div>
            </footer>
        </div>
    );
}