// app/ui/NotificationButton.tsx
'use client';

import { useState, useEffect } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { messaging } from '@/app/lib/firebase';
import { getToken, Messaging } from 'firebase/messaging'; // Import Messaging type
import { subscribeToTopic } from '@/app/lib/actions';

export default function NotificationButton({ eventId }: { eventId: string }) {
    const [status, setStatus] = useState<'loading' | 'subscribed' | 'denied' | 'default' | 'unsupported'>('loading');

    useEffect(() => {
        if (!('Notification' in window) || !('serviceWorker' in navigator) || !messaging) {
            setStatus('unsupported');
            return;
        }

        if (Notification.permission === 'denied') {
            setStatus('denied');
        } else if (localStorage.getItem(`subscribed_to_${eventId}`) === 'true') {
            setStatus('subscribed');
        } else {
            setStatus('default');
        }
    }, [eventId]);

    const handleSubscribe = async () => {
        // --- THIS IS THE FIX ---
        // This guard clause proves to TypeScript that 'messaging' is not null for the code below.
        if (!messaging) {
            console.error("Firebase Messaging is not available.");
            setStatus('unsupported');
            return;
        }
        // --- END OF FIX ---

        setStatus('loading');

        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                const swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
                // Now, TypeScript knows 'messaging' is of type 'Messaging', not 'Messaging | null'
                const currentToken = await getToken(messaging, { serviceWorkerRegistration: swRegistration });

                if (currentToken) {
                    await subscribeToTopic(currentToken, eventId);
                    localStorage.setItem(`subscribed_to_${eventId}`, 'true');
                    setStatus('subscribed');
                } else {
                    setStatus('denied');
                }
            } else {
                setStatus('denied');
            }
        } catch (error) {
            console.error('An error occurred while subscribing to notifications: ', error);
            setStatus('default');
        }
    };

    if (status === 'unsupported') {
        return <p className="text-sm text-gray-500">❌ Notifications not supported on this browser.</p>;
    }
    if (status === 'subscribed') {
        return <p className="text-sm text-green-600">✅ Subscribed to notifications.</p>;
    }
    if (status === 'denied') {
        return <p className="text-sm text-red-600">❌ Permissions blocked in browser.</p>;
    }

    return (
        <button
            onClick={handleSubscribe}
            disabled={status === 'loading'}
            className="flex items-center justify-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
            <BellIcon className="w-5 h-5" />
            {status === 'loading' ? 'Subscribing...' : 'Get Notifications'}
        </button>
    );
}