// app/ui/dashboard/invitation-badge.tsx
"use client";

import { useState, useEffect } from 'react';
import { auth, db } from '@/app/lib/firebase'; // Your CLIENT-SIDE firebase config
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

// This component takes the initial server-fetched count for an instant-load experience
export default function InvitationBadge({ initialCount }: { initialCount: number }) {
    // State for the real-time count, initialized with the server's value
    const [count, setCount] = useState(initialCount);

    useEffect(() => {
        // First, we need to know who the current user is on the client
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                // If the user is logged in, set up the real-time listener
                const q = query(
                    collection(db, "invitations"),
                    where("inviteeUid", "==", user.uid),
                    where("status", "==", "pending")
                );

                // onSnapshot creates the real-time listener
                const unsubscribeSnapshot = onSnapshot(q, (querySnapshot) => {
                    // When the data changes, update our state with the new count
                    setCount(querySnapshot.size);
                });

                // Return a cleanup function to remove the listener when the component unmounts
                return () => unsubscribeSnapshot();
            } else {
                // If user logs out, reset count
                setCount(0);
            }
        });

        // Cleanup the auth subscription
        return () => unsubscribeAuth();
    }, []); // Empty dependency array means this runs once on mount

    // Don't render anything if there are no invitations
    if (count === 0) {
        return null;
    }

    // Render the same badge UI as before, but using the real-time 'count' state
    return (
        <>
            {/* Mobile: Red Dot */}
            <span className="absolute right-2 top-2 block h-2 w-2 rounded-full bg-red-500 md:hidden" />

            {/* Desktop: Red Circle with Number */}
            <span className="ml-auto hidden h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white md:flex">
                {count}
            </span>
        </>
    );
}