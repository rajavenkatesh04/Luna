// app/ui/dashboard/events/announcements-tab.tsx

'use client';

import { useActionState, useEffect, useState, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { createAnnouncement, CreateAnnouncementState, deleteAnnouncement } from '@/app/lib/actions';
import { db } from '@/app/lib/firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { Announcement } from '@/app/lib/definitions';
import { UserCircleIcon, CalendarIcon, TrashIcon } from '@heroicons/react/24/outline';
import { BookmarkIcon } from '@heroicons/react/24/solid';
import LoadingSpinner from "@/app/ui/dashboard/loading-spinner";
import { AnnouncementsTabSkeleton } from '@/app/ui/skeletons';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400 md:w-max"
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
            className="p-1 text-gray-400 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-500 dark:hover:text-red-500"
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

    useEffect(() => {
        const q = query(
            collection(db, `organizations/${orgId}/events/${eventId}/announcements`),
            orderBy('createdAt', 'desc')
        );
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const announcementsData = querySnapshot.docs.map(doc => doc.data() as Announcement);
            // Sort by pinned status first, then by date
            announcementsData.sort((a, b) => {
                if (a.isPinned && !b.isPinned) return -1;
                if (!a.isPinned && b.isPinned) return 1;
                return b.createdAt.seconds - a.createdAt.seconds;
            });
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

    if (isLoading) {
        return <AnnouncementsTabSkeleton />;
    }

    return (
        <div>
            <form action={dispatch} ref={formRef} className="rounded-lg border border-gray-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="mb-2 font-semibold tracking-wide text-gray-900 dark:text-zinc-100">Create New Announcement</h3>
                <input type="hidden" name="eventId" value={eventId} />
                <input type="hidden" name="organizationId" value={orgId} />
                <div className="mb-2">
                    <label htmlFor="title" className="sr-only">Title</label>
                    <input type="text" name="title" id="title" required placeholder="Announcement Title" className="block w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500" />
                    {state.errors?.title && <p className="mt-1 text-xs text-red-500">{state.errors.title}</p>}
                </div>
                <div className="mb-4">
                    <label htmlFor="content" className="sr-only">Content</label>
                    <textarea name="content" id="content" required rows={3} placeholder="Write your update here..." className="block w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"></textarea>
                    {state.errors?.content && <p className="mt-1 text-xs text-red-500">{state.errors.content}</p>}
                </div>
                <div className="mt-4 space-y-2 md:flex md:items-center md:justify-between">
                    <SlideSwitch />
                    <SubmitButton />
                </div>
            </form>

            <div className="mt-8">
                <h3 className="mb-4 font-semibold text-gray-900 dark:text-zinc-100">Posted Announcements</h3>
                {announcements.length > 0 ? (
                    <ul className="space-y-4">
                        {announcements.map((ann) => (
                            <li key={ann.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 pr-4">
                                        <div className="flex items-center gap-2">
                                            {ann.isPinned && (
                                                <BookmarkIcon className="h-5 w-5 text-blue-500" title="Pinned Announcement" />
                                            )}
                                            <h3 className="font-semibold text-gray-900 dark:text-zinc-100">{ann.title}</h3>
                                        </div>
                                        <p className="mt-1 whitespace-pre-wrap text-sm text-gray-600 dark:text-zinc-300">{ann.content}</p>
                                    </div>
                                    <form action={deleteAnnouncement}>
                                        <input type="hidden" name="orgId" value={orgId} />
                                        <input type="hidden" name="eventId" value={eventId} />
                                        <input type="hidden" name="announcementId" value={ann.id} />
                                        <DeleteButton />
                                    </form>
                                </div>
                                <div className="mt-3 flex items-center gap-4 border-t border-gray-200 pt-3 text-xs text-gray-500 dark:border-zinc-800 dark:text-zinc-400">
                                    <span className="flex items-center gap-1"><UserCircleIcon className="h-4 w-4" /> {ann.authorName}</span>
                                    <span className="flex items-center gap-1"><CalendarIcon className="h-4 w-4" /> {new Date(ann.createdAt.seconds * 1000).toLocaleString()}</span>
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