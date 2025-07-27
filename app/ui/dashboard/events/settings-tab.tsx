'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { deleteEvent, DeleteEventState } from '@/app/lib/actions';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import LoadingSpinner from "@/app/ui/dashboard/loading-spinner";

// A dedicated submit button for the delete action
function DeleteButton() {
    const { pending } = useFormStatus();

    const handleClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        if (!confirm('Are you sure you want to permanently delete this event? This action cannot be undone.')) {
            event.preventDefault();
        }
    };

    return (
        <button
            type="submit"
            onClick={handleClick}
            disabled={pending}
            className="w-full px-4 py-2 bg-red-600 text-white  rounded-md hover:bg-red-700 disabled:bg-red-300"
        >
            {pending ? (
                <>
                    <LoadingSpinner className="mr-2" />
                    <span>Deleting...</span>
                </>
            ) : (<span>Delete this Event</span>)}
        </button>
    );
}


export default function SettingsTab({ eventId }: { eventId: string }) {
    const initialState: DeleteEventState = { message: null, errors: {} };
    const [state, dispatch] = useActionState(deleteEvent, initialState);

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-lg ">Event Settings</h3>
                <p className="mt-1 text-sm text-gray-600">
                    General settings will be displayed here.
                </p>
                {/* Placeholder for future general settings */}
            </div>

            {/* Danger Zone */}
            <div className="p-4 border border-red-400 bg-red-50 rounded-lg">
                <div className="flex items-center">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
                    <h3 className="text-lg  text-red-800">Danger Zone</h3>
                </div>
                <p className="mt-1 text-sm text-red-700">
                    These actions are destructive and cannot be reversed. Please proceed with caution.
                </p>
                <div className="mt-4 pt-4 border-t border-red-200">
                    <form action={dispatch}>
                        <input type="hidden" name="eventId" value={eventId} />
                        <div className="flex justify-between items-center ">
                            <div className={`space-y-1 `}>
                                <p className="">Delete Event</p>
                                <p className="text-sm text-gray-600">This will permanently delete the event and all associated data.</p>
                                <span className={`block md:hidden`}><DeleteButton /></span>
                            </div>
                            <span className={`hidden md:block`}><DeleteButton /></span>
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