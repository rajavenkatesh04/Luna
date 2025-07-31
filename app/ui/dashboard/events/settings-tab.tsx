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
        // On the first click, prevent the form from submitting and ask for confirmation.
        if (!isConfirming) {
            event.preventDefault();
            setIsConfirming(true);
            // The confirmation state will reset after 3 seconds if not clicked again.
            setTimeout(() => setIsConfirming(false), 3000);
        }
        // If the button is clicked again while in the confirmation state, the form will submit.
    };

    // Reset the confirmation state if the form action begins.
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
            className={`w-full md:w-auto flex justify-center items-center px-4 py-2 text-white  rounded-md transition-colors duration-200 ${
                pending
                    ? 'bg-red-400 cursor-not-allowed'
                    : isConfirming
                        ? 'bg-yellow-500 hover:bg-yellow-600' // Confirmation state color
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
    // Corrected initial state to match the hook's expected type.
    // `message` is initialized to `undefined`.
    const initialState: DeleteEventState = { message: undefined };
    const [state, dispatch] = useActionState(deleteEvent, initialState);

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-lg ">Event Settings</h3>
                <p className="mt-1 text-sm text-gray-600">
                    General settings will be displayed here in the future.
                </p>
            </div>

            {/* Danger Zone */}
            <div className="p-4 border border-red-400 rounded-lg">
                <div className="flex items-center">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
                    <h3 className="text-lg font-semibold text-red-800">Danger Zone</h3>
                </div>
                <p className="mt-1 text-sm text-red-700">
                    This action is destructive and cannot be reversed. Please proceed with caution.
                </p>
                <div className="mt-4 pt-4 border-t border-red-200">
                    <form action={dispatch}>
                        <input type="hidden" name="eventId" value={eventId} />
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="space-y-1">
                                <p className=" ">Delete Event</p>
                                <p className="text-sm text-gray-600">This will permanently delete the event and all associated data.</p>
                            </div>
                            <div className="w-full md:w-auto">
                                <DeleteButton />
                            </div>
                        </div>
                        {state?.message && (
                            <p className="mt-2 text-sm text-red-600" aria-live="polite">
                                {state.message}
                            </p>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}
