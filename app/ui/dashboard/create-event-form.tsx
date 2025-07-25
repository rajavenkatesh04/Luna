'use client';

import { useActionState } from "react";
import { useFormStatus } from 'react-dom';
import { createEvent, CreateEventState } from '@/app/lib/actions';
import { useEffect, useRef, useState } from 'react';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button type="submit" disabled={pending} className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300">
            {pending ? 'Creating...' : 'Create Event'}
        </button>
    );
}

export default function CreateEventForm() {
    const [isOpen, setIsOpen] = useState(false);
    const initialState: CreateEventState = { message: null, errors: {} };
    const [state, dispatch] = useActionState(createEvent, initialState);
    const formRef = useRef<HTMLFormElement>(null);

    // Close the modal on successful creation
    useEffect(() => {
        if (state.message?.startsWith('Successfully')) {
            setIsOpen(false);
            formRef.current?.reset();
        }
    }, [state]);

    return (
        <>
            <button onClick={() => setIsOpen(true)} className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold">
                + Create Event
            </button>

            {isOpen && (
                <div className="bg-gray-900 fixed inset-0  bg-opacity-50 z-40 flex items-center justify-center p-4" onClick={() => setIsOpen(false)}>
                    <div className=" p-8 rounded-lg shadow-2xl w-full max-w-md z-50" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">New Event</h2>
                            <button onClick={() => setIsOpen(false)} className="  text-2xl">&times;</button>
                        </div>
                        <form action={dispatch} ref={formRef} className="space-y-4">
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium ">Event Title</label>
                                <input type="text" name="title" id="title" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                                {state.errors?.title && <p className="mt-1 text-xs text-red-500">{state.errors.title}</p>}
                            </div>
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium">Description (Optional)</label>
                                <textarea name="description" id="description" rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"></textarea>
                            </div>
                            <SubmitButton />
                            {state.message && !state.errors && <p className="mt-2 text-sm text-green-600">{state.message}</p>}
                            {state.message && state.errors && <p className="mt-2 text-sm text-red-500">{state.message}</p>}
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
