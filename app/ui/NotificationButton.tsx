'use client';

import { useState, useEffect } from 'react';
import { BellIcon, CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { messaging } from '@/app/lib/firebase';
import { getToken, Messaging } from 'firebase/messaging';
import { subscribeToTopic } from '@/app/lib/actions';
import LoadingSpinner from "@/app/ui/dashboard/loading-spinner";

// Define a type for the status for better type safety
type NotificationStatus = 'loading' | 'subscribed' | 'denied' | 'default' | 'unsupported';

// A small helper component for displaying status badges. This keeps the main component cleaner.
function StatusBadge({ icon: Icon, message, className }: { icon: React.ElementType, message: string, className: string }) {
    return (
        <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${className}`}>
            <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
            <p className="font-medium">{message}</p>
        </div>
    );
}


export default function NotificationButton({ eventId }: { eventId: string }) {
    const [status, setStatus] = useState<NotificationStatus>('loading');

    useEffect(() => {
        // Feature detection
        if (!('Notification' in window) || !('serviceWorker' in navigator) || !messaging) {
            setStatus('unsupported');
            return;
        }

        // Check existing permissions and subscription status
        if (Notification.permission === 'denied') {
            setStatus('denied');
        } else if (localStorage.getItem(`subscribed_to_${eventId}`) === 'true') {
            setStatus('subscribed');
        } else {
            setStatus('default');
        }
    }, [eventId]);

    const handleSubscribe = async () => {
        if (!messaging) {
            console.error("Firebase Messaging is not available.");
            setStatus('unsupported');
            return;
        }

        setStatus('loading');

        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                const swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
                const currentToken = await getToken(messaging, { serviceWorkerRegistration: swRegistration });

                if (currentToken) {
                    await subscribeToTopic(currentToken, eventId);
                    localStorage.setItem(`subscribed_to_${eventId}`, 'true');
                    setStatus('subscribed');
                } else {
                    console.error('Failed to get FCM token. Permission might be granted but token is missing.');
                    setStatus('denied'); // Treat missing token as a failure state
                }
            } else {
                setStatus('denied');
            }
        } catch (error) {
            console.error('An error occurred while subscribing to notifications: ', error);
            setStatus('default');
        }
    };

    // Render the appropriate status badge if the user can't subscribe
    if (status === 'subscribed') {
        return <StatusBadge icon={CheckCircleIcon} message="You are subscribed to notifications." className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300" />;
    }
    if (status === 'denied') {
        return <StatusBadge icon={ExclamationTriangleIcon} message="Notification permissions are blocked." className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300" />;
    }
    if (status === 'unsupported') {
        return <StatusBadge icon={XCircleIcon} message="Notifications are not supported on this browser." className="bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300" />;
    }

    // By default, render the subscription button
    return (
        <button
            onClick={handleSubscribe}
            disabled={status === 'loading'}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400 dark:disabled:bg-zinc-700"
        >
            {status === 'loading' ? (
                <LoadingSpinner className="mr-2" />
            ) : (
                <BellIcon className="h-5 w-5" />
            )}
            {status === 'loading' ? 'Subscribing...' : 'Get Notifications'}
        </button>
    );
}