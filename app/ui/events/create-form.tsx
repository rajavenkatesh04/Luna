"use client"

import {useFormStatus} from "react-dom";
import {createEvent, CreateEventState} from "@/app/lib/actions";
import {useActionState, useEffect, useRef, useState} from "react";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type={`submit`}
            disabled={pending}
            className={`w-full bg-blue-600 py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300`}
        >
            { pending ? 'Creating...' : 'Create Event' }
        </button>
    );
}


export default function CreateForm() {
    const [isOpen, setIsOpen] = useState(false);
    const initialState: CreateEventState = { message: null };
    const [state, dispatch] = useActionState(createEvent, initialState);
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (state.message) {
            setIsOpen(false);
            formRef.current?.reset();
        }
    }, [state]);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className={`rounded-md p-2 border border-gray-700 hover:bg-gray-50 hover:text-green-600`}
            >
                + Create Event
            </button>

            {isOpen && (
                <div className={`fixed   bg-opacity-50 z-40 flex items-center justify-center`}>
                    <div className={`p-8 rounded-lg shadow-2xl w-full max-w-md z-50`}>
                        <div className={`flex justify-between items-center mb-4`}>
                            <h2 className={`text-2xl font-bold`}>New Event</h2>
                            <button
                            onClick={() => setIsOpen(false)}
                            className={`text-gray-500 hover:text-gray-800`}
                            >
                                &times;
                            </button>
                        </div>

                        <form action={dispatch} ref={formRef} className={`space-y-4`}>

                            {/* Event Title*/}
                            <div>
                                <label htmlFor={`title`} className={`block text-sm font-medium text-gray-700`}>Event Title</label>
                                <input
                                    type={`text`}
                                    name={`title`}
                                    id={`title`}
                                    required
                                    className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                                />
                                { state.errors?.title && <p className={`mt-1 text-xs text-red-500`}>{state.errors.title}</p>}
                            </div>

                        {/*    Event Description */}
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description (Optional)</label>
                                <textarea name="description" id="description" rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"></textarea>
                            </div>
                            <SubmitButton />
                            { state.message && !state.errors && <p className={`mt-2 text-sm text-green-600`}>{state.message}</p>}
                            {state.message && state.errors && <p className="mt-2 text-sm text-red-500">{state.message}</p>}
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}