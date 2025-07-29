'use client';
import { useActionState } from "react";
import { useEffect, useState, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { createAnnouncement, CreateAnnouncementState, deleteAnnouncement } from '@/app/lib/actions';
import { db } from '@/app/lib/firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { Announcement } from '@/app/lib/definitions';
import { UserCircleIcon, CalendarIcon, TrashIcon  } from '@heroicons/react/24/outline';
import LoadingSpinner from "@/app/ui/dashboard/loading-spinner";

// No changes to SubmitButton
function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
            aria-disabled={pending}
        >
            {pending ? (
                <>
                    <LoadingSpinner className="mr-2" />
                    <span>Sending...</span>
                </>
            ) : (
                <span>Send Announcement</span>
            )}
        </button>
    );
}

// No changes to DeleteButton
function DeleteButton() {
    const { pending } = useFormStatus();
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        if (!window.confirm('Are you sure you want to delete this announcement?')) {
            event.preventDefault();
        }
    };
    return (
        <button
            type="submit"
            onClick={handleClick}
            disabled={pending}
            aria-disabled={pending}
            className="p-1 text-gray-400 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
            {pending ? <LoadingSpinner className="h-4 w-4" /> : <TrashIcon className="h-5 w-5" />}
        </button>
    );
}

export default function AnnouncementsTab({ eventId, orgId }: { eventId: string, orgId: string }) {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const formRef = useRef<HTMLFormElement>(null);
    const initialState: CreateAnnouncementState = { message: null, errors: {} };
    const [state, dispatch] = useActionState(createAnnouncement, initialState);

    // No changes to useEffect hooks
    useEffect(() => {
        const q = query(
            collection(db, `organizations/${orgId}/events/${eventId}/announcements`),
            orderBy('createdAt', 'desc')
        );
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const announcementsData = querySnapshot.docs.map(doc => doc.data() as Announcement);
            setAnnouncements(announcementsData);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, [eventId, orgId]);

    useEffect(() => {
        if (state.message?.startsWith('Successfully')) {
            formRef.current?.reset();
        }
    }, [state]);

    return (
        <div>
            {/* Create Announcement Form */}
            <form action={dispatch} ref={formRef} className="p-4 rounded-lg border">
                <h3 className="mb-2">Create New Announcement</h3>
                <input type="hidden" name="eventId" value={eventId} />
                <input type="hidden" name="organizationId" value={orgId} />
                <div className="mb-2">
                    <label htmlFor="title" className="sr-only">Title</label>
                    <input type="text" name="title" id="title" required placeholder="Announcement Title" className="block w-full px-3 py-2 border border-gray-300 rounded-md"/>
                    {state.errors?.title && <p className="mt-1 text-xs text-red-500">{state.errors.title}</p>}
                </div>
                <div className="mb-4">
                    <label htmlFor="content" className="sr-only">Content</label>
                    <textarea name="content" id="content" required rows={3} placeholder="Write your update here..." className="block w-full px-3 py-2 border border-gray-300 rounded-md"></textarea>
                    {state.errors?.content && <p className="mt-1 text-xs text-red-500">{state.errors.content}</p>}
                </div>
                <div className="flex justify-end">
                    <SubmitButton />
                </div>
            </form>


            {/* Announcements List */}
            <div className="mt-8">
                <h3 className=" mb-4">Posted Announcements</h3>
                {isLoading ? (
                    <p className={`text-center animate-pulse`}>Loading announcements...</p>
                ) : announcements.length > 0 ? (
                    <ul className="space-y-4">
                        {announcements.map((ann) => (
                            <li key={ann.id} className="p-4 border rounded-lg shadow-sm">
                                {/* Flex container to put content and button side-by-side */}
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 pr-4">
                                        <h3 className="font-semibold">{ann.title}</h3>
                                        <p className="mt-1 text-sm text-gray-600 whitespace-pre-wrap">{ann.content}</p>
                                    </div>

                                    {/* <<< THE DELETE FORM GOES HERE, INSIDE THE LOOP >>> */}
                                    <form action={deleteAnnouncement}>
                                        <input type="hidden" name="orgId" value={orgId} />
                                        <input type="hidden" name="eventId" value={eventId} />
                                        <input type="hidden" name="announcementId" value={ann.id} />
                                        <DeleteButton />
                                    </form>
                                </div>

                                {/* Meta info remains at the bottom */}
                                <div className="flex items-center gap-4 text-xs text-gray-500 mt-3 pt-3 border-t">
                                    <span className="flex items-center gap-1"><UserCircleIcon className="w-4 h-4" /> {ann.authorName}</span>
                                    <span className="flex items-center gap-1"><CalendarIcon className="w-4 h-4" /> {new Date(ann.createdAt.seconds * 1000).toLocaleString()}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-gray-500 py-8">No announcements have been sent for this event yet.</p>
                )}
            </div>
        </div>
    );
}