'use client';

import { useActionState, useEffect, useState, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { createAnnouncement, CreateAnnouncementState, deleteAnnouncement } from '@/app/lib/actions';
import { db } from '@/app/lib/firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { Announcement } from '@/app/lib/definitions';
import { UserCircleIcon, CalendarIcon, TrashIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { BookmarkIcon } from '@heroicons/react/24/solid';
import LoadingSpinner from "@/app/ui/dashboard/loading-spinner";
import { AnnouncementsTabSkeleton } from '@/app/ui/skeletons';
import MapLocationModal from './map-location-modal';
import { APIProvider, Map, AdvancedMarker, useMap, InfoWindow } from '@vis.gl/react-google-maps';

// --- Sub-component: SubmitButton ---
function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400 md:w-max"
            aria-disabled={pending}
        >
            {pending ? <><LoadingSpinner className="mr-2" /><span>Sending...</span></> : <span>Send Announcement</span>}
        </button>
    );
}

// --- Sub-component: SlideSwitch ---
function SlideSwitch() {
    return (
        <label htmlFor="isPinned" className="flex cursor-pointer items-center justify-between">
            <span className="mr-3 text-sm font-medium text-gray-900 dark:text-zinc-100">Pin Announcement</span>
            <div className="relative">
                <input type="checkbox" id="isPinned" name="isPinned" className="peer sr-only" />
                <div className="h-6 w-11 rounded-full bg-gray-200 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all peer-checked:bg-green-600 peer-checked:after:translate-x-full peer-checked:after:border-white dark:bg-zinc-700 dark:after:border-zinc-600 dark:after:bg-zinc-900"></div>
            </div>
        </label>
    );
}

// --- Sub-component: DeleteButton ---
function DeleteButton() {
    const { pending } = useFormStatus();
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        if (!window.confirm('Are you sure you want to delete this announcement?')) {
            event.preventDefault();
        }
    };
    return (
        <button type="submit" onClick={handleClick} disabled={pending} aria-disabled={pending} className="p-1 text-gray-400 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-500 dark:hover:text-red-500">
            {pending ? <LoadingSpinner className="h-4 w-4" /> : <TrashIcon className="h-5 w-5" />}
        </button>
    );
}

// --- Sub-component: AnnouncementMap ---
function AnnouncementMap({ location }: { location: Announcement['location'] }) {
    const map = useMap();
    const [infoWindow, setInfoWindow] = useState<Announcement['location'] | null>(null);
    const [infoWindowPos, setInfoWindowPos] = useState<google.maps.LatLng | null>(null);
    const polygonRef = useRef<google.maps.Polygon | null>(null);

    useEffect(() => {
        if (!map || !location) return;

        // Clean up any existing polygon before creating a new one
        if (polygonRef.current) {
            polygonRef.current.setMap(null);
            polygonRef.current = null;
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

// --- Main AnnouncementsTab Component ---
export default function AnnouncementsTab({ eventId, orgId }: { eventId: string, orgId: string }) {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const formRef = useRef<HTMLFormElement>(null);
    const initialState: CreateAnnouncementState = { message: null, errors: {} };
    const [state, dispatch] = useActionState(createAnnouncement, initialState);

    const [isMapModalOpen, setIsMapModalOpen] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<Announcement['location'] | null>(null);

    const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const googleMapsId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_ID;

    useEffect(() => {
        const q = query(
            collection(db, `organizations/${orgId}/events/${eventId}/announcements`),
            orderBy('createdAt', 'desc')
        );
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const announcementsData = querySnapshot.docs.map(doc => ({...doc.data(), id: doc.id } as Announcement));
            announcementsData.sort((a, b) => {
                if (a.isPinned && !b.isPinned) return -1;
                if (!a.isPinned && b.isPinned) return 1;
                const dateA = a.createdAt?.seconds ? a.createdAt.seconds : 0;
                const dateB = b.createdAt?.seconds ? b.createdAt.seconds : 0;
                return dateB - dateA;
            });
            setAnnouncements(announcementsData);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, [eventId, orgId]);

    useEffect(() => {
        if (state.message?.startsWith('Successfully')) {
            formRef.current?.reset();
            setSelectedLocation(null);
        }
    }, [state]);

    if (isLoading) {
        return <AnnouncementsTabSkeleton />;
    }

    const handleLocationSave = (location: NonNullable<Announcement['location']>) => {
        setSelectedLocation(location);
    };

    return (
        <div>
            <form action={dispatch} ref={formRef} className="rounded-lg border border-gray-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="mb-2 font-semibold tracking-wide text-gray-900 dark:text-zinc-100">Create New Announcement</h3>
                <input type="hidden" name="eventId" value={eventId} />
                <div className="mb-2">
                    <input type="text" name="title" id="title" required placeholder="Announcement Title" className="block w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500" />
                </div>
                <div className="mb-4">
                    <textarea name="content" id="content" required rows={3} placeholder="Write your update here..." className="block w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"></textarea>
                </div>

                {selectedLocation && (
                    <input type="hidden" name="location" value={JSON.stringify(selectedLocation)} />
                )}

                <div className="mt-4 space-y-4 md:flex md:items-center md:justify-between md:space-y-0">
                    <div className="flex items-center gap-4">
                        <SlideSwitch />
                        <button type="button" onClick={() => setIsMapModalOpen(true)} className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                            <MapPinIcon className="h-5 w-5" />
                            {selectedLocation ? "Edit Location" : "Add Location"}
                        </button>
                    </div>
                    <SubmitButton />
                </div>
                {selectedLocation && (
                    <div className="mt-2 text-xs text-gray-500 dark:text-zinc-400">
                        📍 Location Added: {selectedLocation.name}
                    </div>
                )}
            </form>

            <MapLocationModal
                isOpen={isMapModalOpen}
                onClose={() => setIsMapModalOpen(false)}
                onSave={handleLocationSave}
            />

            <div className="mt-8">
                <h3 className="mb-4 font-semibold text-gray-900 dark:text-zinc-100">Posted Announcements</h3>
                {announcements.length > 0 ? (
                    <ul className="space-y-4 ">
                        {announcements.map((ann) => (
                            <li key={ann.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 pr-4">
                                        <div className="flex items-center gap-2">
                                            {ann.isPinned && <BookmarkIcon className="h-5 w-5 text-amber-500" title="Pinned Announcement" />}
                                            <h3 className="font-semibold text-gray-900 dark:text-zinc-100">{ann.title}</h3>
                                        </div>
                                        <p className="mt-1 whitespace-pre-wrap break-words text-sm text-gray-600 dark:text-zinc-300">{ann.content}</p>
                                    </div>
                                    <form action={deleteAnnouncement}>
                                        <input type="hidden" name="eventId" value={eventId} />
                                        <input type="hidden" name="announcementId" value={ann.id} />
                                        <DeleteButton />
                                    </form>
                                </div>

                                {ann.location && (
                                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-zinc-800">
                                        <h4 className="text-sm font-medium text-gray-800 dark:text-zinc-200 flex items-center gap-1">
                                            <MapPinIcon className="h-4 w-4" />
                                            {ann.location.name}
                                        </h4>
                                        {googleMapsApiKey ? (
                                            <div className="mt-2 h-48 w-full rounded-lg overflow-hidden">
                                                <APIProvider apiKey={googleMapsApiKey}>
                                                    <Map
                                                        defaultCenter={ann.location.center}
                                                        defaultZoom={16}
                                                        gestureHandling={'greedy'}
                                                        disableDefaultUI={true}
                                                        mapId={googleMapsId}
                                                    >
                                                        <AnnouncementMap location={ann.location} />
                                                    </Map>
                                                </APIProvider>
                                            </div>
                                        ) : (
                                            <div className="mt-2 h-48 w-full rounded-lg bg-gray-100 dark:bg-zinc-800 flex items-center justify-center border border-gray-200 dark:border-zinc-700">
                                                <div className="text-center">
                                                    <MapPinIcon className="h-8 w-8 text-gray-400 dark:text-zinc-500 mx-auto mb-2" />
                                                    <p className="text-sm text-gray-500 dark:text-zinc-400">Map unavailable</p>
                                                    <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">Google Maps API key not configured</p>
                                                </div>
                                            </div>
                                        )}
                                        <a
                                            href={`https://www.google.com/maps/dir/?api=1&destination=${ann.location.center.lat},${ann.location.center.lng}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-2 inline-block text-xs font-semibold text-blue-600 hover:underline"
                                        >
                                            Get Directions
                                        </a>
                                    </div>
                                )}

                                <div className="mt-3 flex items-center justify-between gap-4 border-t border-gray-200 pt-3 text-xs text-gray-500 dark:border-zinc-800 dark:text-zinc-400">
                                    <span className="flex items-center gap-1.5 font-medium"><UserCircleIcon className="w-4 h-4" /> {ann.authorName}</span>
                                    {ann.createdAt?.seconds && (
                                        <span className="flex items-center gap-1.5"><CalendarIcon className="w-4 h-4" />
                                            {new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(ann.createdAt.seconds * 1000))}
                                        </span>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="rounded-lg border border-dashed border-gray-300 bg-white py-12 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <p className="text-gray-500 dark:text-zinc-400">No announcements have been sent for this event yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}