'use client';

import { useActionState, useState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { deleteEvent, type DeleteEventState } from '@/app/lib/actions';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import LoadingSpinner from "@/app/ui/dashboard/loading-spinner";

/**
 * A dedicated submit button for the delete action that includes a non-blocking
 * confirmation step to prevent accidental deletion.
 */
function DeleteButton() {
    const { pending } = useFormStatus();
    const [isConfirming, setIsConfirming] = useState(false);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        if (!isConfirming) {
            event.preventDefault();
            setIsConfirming(true);
            setTimeout(() => setIsConfirming(false), 3000);
        }
    };

    useEffect(() => {
        if (pending) {
            setIsConfirming(false);
        }
    }, [pending]);

    return (
        <button
            type="submit"
            onClick={handleClick}
            disabled={pending}
            className={`w-full justify-center md:w-auto flex items-center px-4 py-2 text-white rounded-md transition-colors duration-200 ${
                pending
                    ? 'bg-red-400 cursor-not-allowed'
                    : isConfirming
                        ? 'bg-yellow-500 hover:bg-yellow-600'
                        // The solid red color works well in both light and dark mode as an accent.
                        : 'bg-red-600 hover:bg-red-700'
            }`}
        >
            {pending ? (
                <>
                    <LoadingSpinner className="mr-2 h-5 w-5" />
                    <span>Deleting...</span>
                </>
            ) : isConfirming ? (
                'Click Again to Confirm'
            ) : (
                <span>Delete this Event</span>
            )}
        </button>
    );
}

/**
 * Renders the settings tab for an event, including the "Danger Zone"
 * for deleting the event.
 */
export default function SettingsTab({ eventId }: { eventId: string }) {
    const initialState: DeleteEventState = { message: undefined };
    const [state, dispatch] = useActionState(deleteEvent, initialState);

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">Event Settings</h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-zinc-400">
                    General settings will be displayed here in the future.
                </p>
            </div>

            {/* Danger Zone */}
            <div className="rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/20">
                <div className="flex items-center">
                    <ExclamationTriangleIcon className="mr-2 h-5 w-5 text-red-500" />
                    <h3 className="text-lg font-semibold text-red-800 dark:text-red-400">Danger Zone</h3>
                </div>
                <p className="mt-1 text-sm text-red-700 dark:text-red-400/80">
                    This action is destructive and cannot be reversed. Please proceed with caution.
                </p>
                <div className="mt-4 border-t border-red-200 pt-4 dark:border-red-900/50">
                    <form action={dispatch}>
                        <input type="hidden" name="eventId" value={eventId} />
                        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                            <div className="space-y-1">
                                <p className="font-medium text-gray-900 dark:text-zinc-200">Delete Event</p>
                                <p className="text-sm text-gray-600 dark:text-zinc-400">This will permanently delete the event and all associated data.</p>
                            </div>
                            <div className="w-full md:w-auto">
                                <DeleteButton />
                            </div>
                        </div>
                        {state?.message && (
                            <p className="mt-2 text-sm text-red-600 dark:text-red-500" aria-live="polite">
                                {state.message}
                            </p>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}