'use client';

import { useEffect, useState, useRef, use } from 'react';
import { db } from '@/app/lib/firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { Announcement, Event } from '@/app/lib/definitions';
import { UserCircleIcon, CalendarIcon, SparklesIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { BookmarkIcon } from '@heroicons/react/24/solid';
import Navbar from "@/app/ui/Navbar";
import LoadingSpinner from "@/app/ui/dashboard/loading-spinner";
import NotificationButton from "@/app/ui/NotificationButton";
import { AnnouncementsFeedSkeleton } from '@/app/ui/skeletons';
import { formatRelativeDate } from '@/app/lib/utils';
import { APIProvider, Map, AdvancedMarker, useMap, InfoWindow } from '@vis.gl/react-google-maps';

// --- Reusable Expandable Text Component ---
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

// --- Event Header Component ---
function EventHeader({ event }: { event: Event }) {
    return (
        <header className="mb-8 border-b border-gray-200/80 pb-8 dark:border-zinc-800/50">
            <h1 className="text-4xl font-bold tracking-wide text-transparent bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text mb-4">
                {event.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 dark:text-zinc-500">
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

// --- Event Info Card (Sidebar) ---
function EventInfoCard({ eventId }: { eventId: string }) {
    return (
        <aside className="space-y-6 md:sticky md:top-24">
            <div className="rounded-lg border border-gray-200/80 bg-white p-5 dark:border-zinc-800/50 dark:bg-zinc-900">
                <NotificationButton eventId={eventId} />
            </div>
        </aside>
    );
}

// --- A dedicated map component for the announcement card ---
function AnnouncementMap({ location }: { location: Announcement['location'] }) {
    const map = useMap();
    // These state variables track the info window that appears when users click on map elements
    const [infoWindow, setInfoWindow] = useState<Announcement['location'] | null>(null);
    const [infoWindowPos, setInfoWindowPos] = useState<google.maps.LatLng | null>(null);

    // CRITICAL FIX: Properly type the ref to hold a Google Maps Polygon object or null
    // This tells TypeScript that polygonRef can contain either a Polygon instance or null
    const polygonRef = useRef<google.maps.Polygon | null>(null);

    useEffect(() => {
        // Early return if we don't have the required dependencies
        if (!map || !location) return;

        // Clean up any existing polygon before creating a new one
        // Now TypeScript knows that when polygonRef.current is truthy, it's definitely a Polygon
        if (polygonRef.current) {
            polygonRef.current.setMap(null); // Remove from map
            polygonRef.current = null; // Clear the reference
        }

        // Create a new polygon if the location type is polygon and has path data
        if (location.type === 'polygon' && location.path) {
            const poly = new google.maps.Polygon({
                paths: location.path,
                fillColor: location.fillColor || '#FF0000',
                fillOpacity: 0.3,
                strokeColor: location.strokeColor || '#FF0000',
                strokeWeight: 2,
            });

            // Add the polygon to the map
            poly.setMap(map);

            // Store the polygon reference so we can clean it up later
            polygonRef.current = poly;

            // CRITICAL FIX: Use the correct event type for Google Maps polygon clicks
            // We use a generic event type that has the latLng property we need
            poly.addListener('click', (e: { latLng: google.maps.LatLng }) => {
                setInfoWindowPos(e.latLng);
                setInfoWindow(location);
            });
        }
    }, [map, location]);

    // Handle marker clicks for pin-type locations
    const handleMarkerClick = () => {
        if (location?.center) {
            // Convert the center coordinates to a LatLng object for the info window
            const latLng = new google.maps.LatLng(location.center.lat, location.center.lng);
            setInfoWindowPos(latLng);
            setInfoWindow(location);
        }
    };

    return (
        <>
            {/* Render a marker if the location is a pin type */}
            {location?.type === 'pin' && location.center && (
                <AdvancedMarker position={location.center} onClick={handleMarkerClick} />
            )}

            {/* Show info window when user clicks on map elements */}
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

// --- Announcement Card Component (with "New" badge logic) ---
function AnnouncementCard({ announcement, isRecent }: { announcement: Announcement; isRecent: boolean }) {
    const [showNewBadge, setShowNewBadge] = useState(isRecent);

    useEffect(() => {
        if (isRecent) {
            // Hide the "New" badge after 2 minutes to prevent visual clutter
            const timer = setTimeout(() => {
                setShowNewBadge(false);
            }, 2 * 60 * 1000); // 2 minutes

            return () => clearTimeout(timer);
        }
    }, [isRecent]);

    const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const googleMapsId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_ID;

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
                <h2 className="text-xl text-gray-900 dark:text-zinc-100">
                    {announcement.title}
                </h2>
            </header>

            <div className="mb-5 text-base">
                <ExpandableText text={announcement.content} maxLines={4} />
            </div>

            {/* Render map section if announcement has location data */}
            {announcement.location && (
                <div className="mb-5">
                    <h4 className="text-sm font-medium text-gray-800 dark:text-zinc-200 flex items-center gap-1.5 mb-2">
                        <MapPinIcon className="h-4 w-4" />
                        {announcement.location.name}
                    </h4>
                    {googleMapsApiKey ? (
                        <div className="h-48 w-full rounded-lg overflow-hidden">
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
                                <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">Google Maps API key not configured</p>
                            </div>
                        </div>
                    )}
                <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${announcement.location.center.lat},${announcement.location.center.lng}`}
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

// Helper function to fetch initial event data
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

// --- Main Page Component ---
export default function PublicEventPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const eventId = resolvedParams.id;

    // State management for the page
    const [event, setEvent] = useState<Event | null>(null);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFeedLoading, setIsFeedLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [latestAnnouncementTime, setLatestAnnouncementTime] = useState<number>(0);

    useEffect(() => {
        if (!eventId) return;

        let unsubscribe = () => {};

        // Load initial event data and set up real-time announcements subscription
        getInitialEventData(eventId)
            .then(data => {
                if (data && data.eventData && data.eventPath) {
                    setEvent(data.eventData);
                    setIsLoading(false);

                    // Set up real-time listener for announcements
                    const announcementsQuery = query(
                        collection(db, `${data.eventPath}/announcements`),
                        orderBy('createdAt', 'desc')
                    );

                    unsubscribe = onSnapshot(announcementsQuery, (querySnapshot) => {
                        const announcementsData = querySnapshot.docs.map(doc => ({
                            id: doc.id,
                            ...doc.data()
                        } as Announcement));

                        // Sort announcements: pinned first, then by creation time
                        announcementsData.sort((a, b) => {
                            if (a.isPinned && !b.isPinned) return -1;
                            if (!a.isPinned && b.isPinned) return 1;
                            return b.createdAt.seconds - a.createdAt.seconds;
                        });

                        // Track the most recent announcement time for "new" badge logic
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

        // Cleanup function to unsubscribe from real-time updates
        return () => unsubscribe();
    }, [eventId, latestAnnouncementTime]);

    // Determine if an announcement should show the "new" badge
    const isAnnouncementRecent = (announcement: Announcement): boolean => {
        const currentTime = Date.now() / 1000;
        const announcementTime = announcement.createdAt.seconds;
        const isWithinTimeWindow = (currentTime - announcementTime) < (5 * 60); // Within 5 minutes
        const isAmongLatest = announcementTime >= latestAnnouncementTime - 60; // Within 1 minute of latest
        return isWithinTimeWindow && isAmongLatest;
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 text-gray-700 dark:bg-zinc-950 dark:text-zinc-300">
                <LoadingSpinner />
                <span className="ml-2">Loading Event...</span>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 text-center dark:bg-zinc-950">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">Event Not Found</h1>
                <p className="mt-2 text-gray-600 dark:text-zinc-400">The event code you entered is invalid or the event has ended.</p>
            </main>
        );
    }

    // Main page render
    return (
        <div className="bg-slate-50 text-slate-800 dark:bg-zinc-950 dark:text-slate-200">
            <Navbar />
            <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
                {event && <EventHeader event={event} />}

                <main className="grid grid-cols-1 gap-12 md:grid-cols-3">
                    {/* Sidebar with event info */}
                    <div className="md:col-span-1">
                        {eventId && <EventInfoCard eventId={eventId} />}
                    </div>

                    {/* Main content area with announcements */}
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

            {/* Footer */}
            <footer className="w-full border-t border-gray-200/80 bg-slate-100/50 py-6 dark:border-zinc-800/50 dark:bg-zinc-950/50">
                <div className="mx-auto flex max-w-6xl items-center justify-center px-6 text-sm text-gray-500 dark:text-zinc-500">
                    <a href={process.env.NEXT_PUBLIC_LUNA_URL || '#'} target="_blank">
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