'use client';

import { useActionState } from "react";
import { useFormStatus } from 'react-dom';
import { createEvent, CreateEventState } from '@/app/lib/actions';
import Link from 'next/link';
import LoadingSpinner from "@/app/ui/dashboard/loading-spinner";

function CreateButton() {
    const { pending } = useFormStatus();
    return (
        <button type="submit" disabled={pending} className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50">
            {pending ? (
                <>
                    <LoadingSpinner className="mr-2" />
                    <span>Creating...</span>
                </>
                ) : (<span>Create Event</span>)}
        </button>
    );
}

export default function CreateEventForm() {
    const initialState: CreateEventState = { message: null, errors: {} };
    const [state, dispatch] = useActionState(createEvent, initialState);

    return (
        <form action={dispatch}>
            <div className="rounded-md  p-4 md:p-6">
                {/* Event Title */}
                <div className="mb-4">
                    <label htmlFor="title" className="mb-2 block text-sm font-medium">
                        Event Title
                    </label>
                    <input
                        id="title"
                        name="title"
                        type="text"
                        placeholder="Enter the name of your event"
                        className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
                        required
                    />
                    {state.errors?.title && <p className="mt-2 text-xs text-red-500">{state.errors.title}</p>}
                </div>

                {/* Event Description */}
                <div className="mb-4">
                    <label htmlFor="description" className="mb-2 block text-sm font-medium">
                        Description (Optional)
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        placeholder="Tell us a little about your event"
                        rows={4}
                        className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
                    />
                </div>

                {/* General Error Message */}
                {state.message && (
                    <div className="mb-4">
                        <p className="text-sm text-red-500">{state.message}</p>
                    </div>
                )}
            </div>
            <div className="mt-6 flex justify-end gap-4">
                <Link
                    href="/dashboard/events"
                    className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
                >
                    Cancel
                </Link>
                <CreateButton />
            </div>
        </form>
    );
}
