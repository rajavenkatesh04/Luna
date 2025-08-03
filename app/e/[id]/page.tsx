'use client';

import { useEffect, useState, useRef } from 'react';
import { db } from '@/app/lib/firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { Announcement, Event } from '@/app/lib/definitions';
import { UserCircleIcon, CalendarIcon, SparklesIcon, MapPinIcon, UserIcon } from '@heroicons/react/24/outline';
import { BookmarkIcon } from '@heroicons/react/24/solid';
import Navbar from "@/app/ui/Navbar";
import LoadingSpinner from "@/app/ui/dashboard/loading-spinner";
import NotificationButton from "@/app/ui/NotificationButton";
import { AnnouncementsFeedSkeleton } from '@/app/ui/skeletons';
import { formatRelativeDate } from '@/app/lib/utils';
import Link from "next/link";

// --- CORRECTED: Reusable Expandable Text Component ---
function ExpandableText({ text, maxLines = 2 }: { text: string; maxLines?: number }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [canExpand, setCanExpand] = useState(false);
    const textRef = useRef<HTMLParagraphElement | null>(null); // Use useRef instead of useState

    useEffect(() => {
        // We need to check if the content is overflowing the clamped height.
        // A simple height check is more reliable across browsers than calculating line heights.
        if (textRef.current) {
            const element = textRef.current;
            // If the scroll height (full content height) is greater than the client height (visible height), it's clamped.
            if (element.scrollHeight > element.clientHeight) {
                setCanExpand(true);
            } else {
                // If text changes and is no longer clamped, hide the button.
                setCanExpand(false);
            }
        }
    }, [text, maxLines]); // Rerun when text or maxLines changes

    return (
        <div>
            <p
                ref={textRef}
                className={`whitespace-pre-wrap break-words text-gray-600 dark:text-zinc-400 ${
                    !isExpanded ? `line-clamp-${maxLines}` : ''
                }`}
            >
                {text}
            </p>
            {canExpand && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                    {isExpanded ? 'Show Less' : 'Show More'}
                </button>
            )}
        </div>
    );
}

// --- NEW: Event Header Component ---
function EventHeader({ event }: { event: Event }) {
    return (
        <header className="mb-8 border-b border-gray-200/80 pb-8 dark:border-zinc-800/50">
            <h1 className="text-4xl font-bold tracking-wide text-transparent bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text mb-4">
                {event.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 dark:text-zinc-500">
                <div className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4" />
                    <span>{event.ownerUid || 'Event Organizer'}</span>
                </div>
                <div className="flex items-center gap-2">
                    <MapPinIcon className="h-4 w-4" />
                    <span>Chennai, India</span>
                </div>
            </div>
            {event.description && (
                <div className="mt-4 max-w-3xl">
                    <ExpandableText text={event.description} maxLines={3} />
                </div>
            )}
        </header>
    );
}

// --- NEW: Event Info Card (Sidebar) ---
function EventInfoCard({ eventId }: { eventId: string }) {
    return (
        <aside className="space-y-6 md:sticky md:top-24">
            <div className="rounded-lg border border-gray-200/80 bg-white p-5 dark:border-zinc-800/50 dark:bg-zinc-900">
                <NotificationButton eventId={eventId} />
            </div>
        </aside>
    );
}

// --- NEW: Announcement Card Component ---
function AnnouncementCard({ announcement }: { announcement: Announcement }) {
    const isNew = (new Date().getTime() / 1000 - announcement.createdAt.seconds) < 86400; // is within 24 hours

    return (
        <article className="animate-fade-in rounded-lg border border-gray-200/80 bg-white p-5 shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900">
            <header className="mb-4">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                    {announcement.isPinned && (
                        <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                            <BookmarkIcon className="h-4 w-4" />
                            <span>Pinned</span>
                        </div>
                    )}
                    {isNew && (
                        <div className="flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                            <span>New</span>
                        </div>
                    )}
                </div>
                <h2 className="text-xl text-gray-900 dark:text-zinc-100">
                    {announcement.title}
                </h2>
            </header>

            <div className="mb-5 text-base">
                <ExpandableText text={announcement.content} maxLines={4} />
            </div>

            <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-200/80 pt-4 text-sm text-gray-500 dark:border-zinc-800/50 dark:text-zinc-400">
                <div className="flex items-center gap-2">
                    <UserCircleIcon className="h-5 w-5" />
                    <span className="font-medium">{announcement.authorName}</span>
                </div>
                <div className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    <span>{formatRelativeDate(announcement.createdAt)}</span>
                </div>
            </footer>
        </article>
    );
}

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
                const announcementsQuery = query(collection(db, `${data.eventPath}/announcements`), orderBy('createdAt', 'desc'));
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
            <div className="flex min-h-screen items-center justify-center bg-slate-50 text-gray-700 dark:bg-zinc-950 dark:text-zinc-300">
                <LoadingSpinner />
                <span className="ml-2">Loading Event...</span>
            </div>
        );
    }
    if (error) {
        return (
            <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 text-center dark:bg-zinc-950">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">Event Not Found</h1>
                <p className="mt-2 text-gray-600 dark:text-zinc-400">The event code you entered is invalid or the event has ended.</p>
            </main>
        );
    }

    return (
        <div className="bg-slate-50 text-slate-800 dark:bg-zinc-950 dark:text-slate-200">
            <Navbar />
            <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
                {event && <EventHeader event={event} />}

                <main className="grid grid-cols-1 gap-12 md:grid-cols-3">
                    <div className="md:col-span-1">
                        {eventId && <EventInfoCard eventId={eventId} />}
                    </div>

                    <section className="space-y-6 md:col-span-2">
                        {isFeedLoading ? (
                            <AnnouncementsFeedSkeleton />
                        ) : announcements.length > 0 ? (
                            announcements.map(ann => <AnnouncementCard key={ann.id} announcement={ann} />)
                        ) : (
                            <div className="rounded-lg border-2 border-dashed border-gray-300/80 bg-white/50 py-20 text-center dark:border-zinc-800/50 dark:bg-zinc-900/50">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">No Announcements Yet</h3>
                                <p className="mt-1 text-gray-500 dark:text-zinc-400">Stay tuned for updates from the organizer!</p>
                            </div>
                        )}
                    </section>
                </main>
            </div>

            <footer className="w-full border-t border-gray-200/80 bg-slate-100/50 py-6 dark:border-zinc-800/50 dark:bg-zinc-950/50">
                <div className="mx-auto flex max-w-6xl items-center justify-center px-6 text-sm text-gray-500 dark:text-zinc-500">
                    <a href={process.env.NEXT_PUBLIC_LUNA_URL} target={`_blank`} >
                        <div className="flex items-center gap-2">
                            <SparklesIcon className="h-4 w-4 text-indigo-500" />
                            <span>Powered by <span className="font-medium text-gray-700 dark:text-zinc-300">Luna</span></span>
                        </div>
                    </a>
                </div>
            </footer>
        </div>
    );
}