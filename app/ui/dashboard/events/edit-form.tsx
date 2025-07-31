'use client';

import { useActionState } from "react";
import { useFormStatus } from 'react-dom';
import { updateEvent, UpdateEventState } from '@/app/lib/actions';
import Link from 'next/link';
import { Event } from '@/app/lib/definitions';
import LoadingSpinner from "@/app/ui/dashboard/loading-spinner";

function UpdateButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400"
        >
            {pending ? (
                <>
                    <LoadingSpinner className="mr-2" />
                    <span>Saving...</span>
                </>
            ) : (<span>Save Changes</span>)}
        </button>
    );
}

export default function EditEventForm({ event }: { event: Event }) {
    const initialState: UpdateEventState = { message: null, errors: {} };
    const [state, dispatch] = useActionState(updateEvent, initialState);

    return (
        <form action={dispatch}>
            <div className="rounded-md border border-gray-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 md:p-6">
                <input type="hidden" name="id" value={event.docId} />

                <div className="mb-4">
                    <label htmlFor="title" className="mb-2 block text-sm font-medium text-gray-900 dark:text-zinc-100">
                        Event Title
                    </label>
                    <input
                        id="title"
                        name="title"
                        type="text"
                        defaultValue={event.title}
                        className="block w-full rounded-md border border-gray-200 bg-gray-50 py-2 px-3 text-sm text-gray-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                        required
                    />
                    {state.errors?.title && <p className="mt-2 text-xs text-red-500">{state.errors.title}</p>}
                </div>

                <div className="mb-4">
                    <label htmlFor="description" className="mb-2 block text-sm font-medium text-gray-900 dark:text-zinc-100">
                        Description
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        defaultValue={event.description}
                        rows={4}
                        className="block w-full rounded-md border border-gray-200 bg-gray-50 py-2 px-3 text-sm text-gray-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    />
                </div>

                {state.message && <p className="text-sm text-red-600 dark:text-red-500">{state.message}</p>}
            </div>
            <div className="mt-6 flex justify-end gap-4">
                <Link
                    href={`/dashboard/events/${event.docId}`}
                    className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                >
                    Cancel
                </Link>
                <UpdateButton />
            </div>
        </form>
    );
}