'use client';

import { useEffect, useState, useRef, use } from 'react';
import { db } from '@/app/lib/firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { Announcement, Event } from '@/app/lib/definitions';
import {
    UserCircleIcon,
    CalendarIcon,
    SparklesIcon,
    MapPinIcon,
    PaperClipIcon,
    EyeIcon,
    ArrowDownTrayIcon,
    DocumentTextIcon,
    ArrowPathIcon // --- FIX --- Added for download loading state
} from '@heroicons/react/24/outline';
import { BookmarkIcon } from '@heroicons/react/24/solid';
import LoadingSpinner from "@/app/ui/dashboard/loading-spinner";
import NotificationButton from "@/app/ui/NotificationButton";
import { AnnouncementsFeedSkeleton } from '@/app/ui/skeletons';
import { formatRelativeDate } from '@/app/lib/utils';
import { APIProvider, Map, AdvancedMarker, useMap, InfoWindow } from '@vis.gl/react-google-maps';
import NavbarForSRM from "@/app/ui/NavbarForSRM";

// --- Reusable Expandable Text Component (No changes) ---
function ExpandableText({ text, maxLines = 2 }: { text: string; maxLines?: number }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [canExpand, setCanExpand] = useState(false);
    const textRef = useRef<HTMLParagraphElement | null>(null);

    useEffect(() => {
        if (textRef.current) {
            const element = textRef.current;
            if (element.scrollHeight > element.clientHeight) {
                setCanExpand(true);
            } else {
                setCanExpand(false);
            }
        }
    }, [text, maxLines]);

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

// --- FIX: REDESIGNED AttachmentCard with WORKING Download & Mobile View ---
function AttachmentCard({ attachment }: { attachment: Announcement['attachment'] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    // --- FIX: State to track if download is in progress ---
    const [isDownloading, setIsDownloading] = useState(false);

    if (!attachment) return null;

    const isImage = attachment.type.startsWith('image/');
    const isPdf = attachment.type === 'application/pdf';

    // --- FIX: Function to handle forced file download ---
    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            const response = await fetch(attachment.url);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = attachment.name;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Download failed:', error);
            // Fallback: open in a new tab if blob method fails
            window.open(attachment.url, '_blank');
        } finally {
            setIsDownloading(false);
        }
    };


    const renderPreview = () => {
        if (isImage) {
            return (
                <img
                    src={attachment.url}
                    alt={attachment.name}
                    className="h-full w-full object-cover"
                />
            );
        }
        const Icon = isPdf ? DocumentTextIcon : PaperClipIcon;
        return (
            <div className="flex h-full w-full items-center justify-center bg-slate-100 dark:bg-zinc-800">
                <Icon className="h-10 w-10 text-slate-400 dark:text-zinc-500" />
            </div>
        );
    };

    const PreviewModal = () => {
        // --- FIX: Use Google Docs viewer for PDFs for better mobile compatibility ---
        const pdfPreviewUrl = `https://docs.google.com/gview?url=${encodeURIComponent(attachment.url)}&embedded=true`;

        return (
            <div
                className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
                onClick={() => setIsModalOpen(false)}
            >
                <div className="relative bg-white dark:bg-zinc-900 rounded-lg max-w-4xl max-h-[90vh] w-full h-full flex flex-col" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-between items-center p-4 border-b dark:border-zinc-700">
                        <h3 className="font-semibold text-lg dark:text-white truncate">{attachment.name}</h3>
                        <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white text-2xl leading-none">×</button>
                    </div>
                    <div className="flex-grow overflow-auto">
                        {isImage ? (
                            <img src={attachment.url} alt={attachment.name} className="max-w-full max-h-full mx-auto my-auto object-contain p-2" />
                        ) : isPdf ? (
                            <iframe src={pdfPreviewUrl} className="w-full h-full" title={attachment.name} />
                        ) : (
                            <div className="p-8 text-center flex flex-col items-center justify-center h-full">
                                <p className="dark:text-white mb-4">Preview is not available for this file type.</p>
                                <button onClick={handleDownload} disabled={isDownloading} className="mt-4 inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-white">
                                    {isDownloading ? <ArrowPathIcon className="h-5 w-5 animate-spin" /> : <ArrowDownTrayIcon className="h-5 w-5" />}
                                    {isDownloading ? 'Downloading...' : 'Download File'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="mt-5 mb-5">
            <div className="rounded-lg border border-gray-200/80 dark:border-zinc-800/50 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-3">
                    <div className="md:col-span-1 h-32 md:h-auto bg-slate-50 dark:bg-zinc-800/50">
                        {renderPreview()}
                    </div>
                    <div className="md:col-span-2 p-4 flex flex-col justify-center">
                        <h4 className="font-semibold text-gray-800 dark:text-zinc-100 flex items-center gap-2">
                            <PaperClipIcon className="h-5 w-5 text-gray-400 dark:text-zinc-500" />
                            <span>Attachment</span>
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-zinc-400 truncate mt-1" title={attachment.name}>
                            {attachment.name}
                        </p>
                        <div className="flex items-center gap-3 mt-4">
                            <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center gap-2 rounded-md bg-white dark:bg-zinc-700 px-3 py-2 text-sm font-medium text-gray-700 dark:text-zinc-200 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-zinc-600 hover:bg-gray-50 dark:hover:bg-zinc-600">
                                <EyeIcon className="h-4 w-4" />
                                View
                            </button>
                            {/* --- FIX: Changed from <a> to <button> to trigger download function --- */}
                            <button
                                onClick={handleDownload}
                                disabled={isDownloading}
                                className="flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
                            >
                                {isDownloading ? (
                                    <ArrowPathIcon className="h-4 w-4 animate-spin" />
                                ) : (
                                    <ArrowDownTrayIcon className="h-4 w-4" />
                                )}
                                {isDownloading ? 'Downloading' : 'Download'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {isModalOpen && <PreviewModal />}
        </div>
    );
}

// --- Event Header Component (No changes) ---
function EventHeader({ event }: { event: Event }) {
    return (
        <header className="mb-8 border-b border-gray-200/80 pb-8 dark:border-zinc-800/50">
            <h1 className="text-4xl font-bold tracking-wide text-transparent bg-gradient-to-r from-blue-500 to-teal-300 bg-clip-text mb-4">
                {event.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 dark:text-zinc-500">
                <div className="flex items-center gap-2">
                    <MapPinIcon className="h-4 w-4" />
                    <span>Kattankulathur, Chennai.</span>
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

// --- Event Info Card (Sidebar) (No changes) ---
function EventInfoCard({ eventId }: { eventId: string }) {
    return (
        <aside className="space-y-6 md:sticky md:top-24">
            <div className="rounded-lg border border-gray-200/80 bg-white p-5 dark:border-zinc-800/50 dark:bg-zinc-900">
                <NotificationButton eventId={eventId} />
            </div>
        </aside>
    );
}

// --- AnnouncementMap Component (No changes) ---
function AnnouncementMap({ location }: { location: Announcement['location'] }) {
    const map = useMap();
    const [infoWindow, setInfoWindow] = useState<Announcement['location'] | null>(null);
    const [infoWindowPos, setInfoWindowPos] = useState<google.maps.LatLng | null>(null);
    const polygonRef = useRef<google.maps.Polygon | null>(null);

    useEffect(() => {
        if (!map || !location) return;
        if (polygonRef.current) {
            polygonRef.current.setMap(null);
            polygonRef.current = null;
        }
        if (location.type === 'polygon' && location.path) {
            const poly = new google.maps.Polygon({
                paths: location.path,
                fillColor: location.fillColor || '#FF0000',
                fillOpacity: 0.3,
                strokeColor: location.strokeColor || '#FF0000',
                strokeWeight: 2,
            });
            poly.setMap(map);
            polygonRef.current = poly;
            poly.addListener('click', (e: { latLng: google.maps.LatLng }) => {
                setInfoWindowPos(e.latLng);
                setInfoWindow(location);
            });
        }
    }, [map, location]);

    const handleMarkerClick = () => {
        if (location?.center) {
            const latLng = new google.maps.LatLng(location.center.lat, location.center.lng);
            setInfoWindowPos(latLng);
            setInfoWindow(location);
        }
    };

    return (
        <>
            {location?.type === 'pin' && location.center && (
                <AdvancedMarker position={location.center} onClick={handleMarkerClick} />
            )}
            {infoWindow && infoWindowPos && (
                <InfoWindow position={infoWindowPos} onCloseClick={() => setInfoWindow(null)}>
                    <div className="p-2 text-black">
                        <h4 className="font-semibold">{infoWindow.name}</h4>
                        <p className="text-sm">{infoWindow.details}</p>
                    </div>
                </InfoWindow>
            )}
        </>
    );
}

// --- Announcement Card Component (with corrected "Get Directions" link) ---
function AnnouncementCard({ announcement, isRecent }: { announcement: Announcement; isRecent: boolean }) {
    const [showNewBadge, setShowNewBadge] = useState(isRecent);

    useEffect(() => {
        if (isRecent) {
            const timer = setTimeout(() => setShowNewBadge(false), 2 * 60 * 1000); // 2 minutes
            return () => clearTimeout(timer);
        }
    }, [isRecent]);

    const googleMapsApiKey = process.env.NEXT_PUBLIC_Maps_API_KEY;
    const googleMapsId = process.env.NEXT_PUBLIC_Maps_ID;

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
                    {showNewBadge && (
                        <div className="flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                            <span>New</span>
                        </div>
                    )}
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-zinc-100">
                    {announcement.title}
                </h2>
            </header>

            <div className="mb-5 text-base">
                <ExpandableText text={announcement.content} maxLines={4} />
            </div>

            <AttachmentCard attachment={announcement.attachment} />

            {announcement.location && (
                <div className="mt-5 mb-5">
                    <h4 className="text-sm font-medium text-gray-800 dark:text-zinc-200 flex items-center gap-1.5 mb-2">
                        <MapPinIcon className="h-4 w-4" />
                        {announcement.location.name}
                    </h4>
                    {googleMapsApiKey ? (
                        <div className="h-48 w-full rounded-lg overflow-hidden border dark:border-zinc-800">
                            <APIProvider apiKey={googleMapsApiKey}>
                                <Map
                                    defaultCenter={announcement.location.center}
                                    defaultZoom={18}
                                    gestureHandling={'greedy'}
                                    disableDefaultUI={true}
                                    mapId={googleMapsId}
                                >
                                    <AnnouncementMap location={announcement.location} />
                                </Map>
                            </APIProvider>
                        </div>
                    ) : (
                        <div className="h-48 w-full rounded-lg bg-gray-100 dark:bg-zinc-800 flex items-center justify-center border border-gray-200 dark:border-zinc-700">
                            <div className="text-center">
                                <MapPinIcon className="h-8 w-8 text-gray-400 dark:text-zinc-500 mx-auto mb-2" />
                                <p className="text-sm text-gray-500 dark:text-zinc-400">Map unavailable</p>
                            </div>
                        </div>
                    )}
                    {/* --- FIX: Corrected the Google Maps URL for "Get Directions" --- */}
                    <a
                        href={`https://www.google.com/maps?q=${announcement.location.center.lat},${announcement.location.center.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                        Get Directions
                    </a>
                </div>
            )}

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

// Helper function to fetch initial event data (No changes)
async function getInitialEventData(eventCode: string) {
    try {
        const baseUrl = typeof window !== 'undefined' ? '' : (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
        const response = await fetch(`${baseUrl}/api/events/${eventCode}`);
        if (!response.ok) return null;
        return response.json();
    } catch (error) {
        console.error("Failed to fetch initial event data:", error);
        return null;
    }
}

// --- Main Page Component (with performance fix) ---
export default function PublicEventPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const eventId = resolvedParams.id;

    const [event, setEvent] = useState<Event | null>(null);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFeedLoading, setIsFeedLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [latestAnnouncementTime, setLatestAnnouncementTime] = useState<number>(0);

    useEffect(() => {
        if (!eventId) return;

        let unsubscribe = () => {};

        getInitialEventData(eventId)
            .then(data => {
                if (data && data.eventData && data.eventPath) {
                    setEvent(data.eventData);
                    setIsLoading(false);

                    const announcementsQuery = query(
                        collection(db, `${data.eventPath}/announcements`),
                        orderBy('createdAt', 'desc')
                    );

                    unsubscribe = onSnapshot(announcementsQuery, (querySnapshot) => {
                        const announcementsData = querySnapshot.docs.map(doc => ({
                            id: doc.id,
                            ...doc.data()
                        } as Announcement));

                        announcementsData.sort((a, b) => {
                            if (a.isPinned && !b.isPinned) return -1;
                            if (!a.isPinned && b.isPinned) return 1;
                            return b.createdAt.seconds - a.createdAt.seconds;
                        });

                        if (announcementsData.length > 0) {
                            const mostRecentTime = Math.max(...announcementsData.map(a => a.createdAt.seconds));
                            if (mostRecentTime > latestAnnouncementTime) {
                                setLatestAnnouncementTime(mostRecentTime);
                            }
                        }

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
        // --- FIX: Optimized dependency array to prevent unnecessary re-subscriptions ---
    }, [eventId]);

    const isAnnouncementRecent = (announcement: Announcement): boolean => {
        const currentTime = Date.now() / 1000;
        const announcementTime = announcement.createdAt.seconds;
        // The "New" badge shows if the announcement arrived within the last 5 mins
        // AND is the one that just arrived. This prevents old posts from showing "New" on a page reload.
        const isWithinTimeWindow = (currentTime - announcementTime) < (5 * 60);
        const isAmongLatest = announcementTime === latestAnnouncementTime;
        return isWithinTimeWindow && isAmongLatest;
    };

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
            <NavbarForSRM />
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
                            announcements.map(ann =>
                                <AnnouncementCard
                                    key={ann.id}
                                    announcement={ann}
                                    isRecent={isAnnouncementRecent(ann)}
                                />
                            )
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
                    <a href="/" target="_blank">
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