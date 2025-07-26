'use client';

import { useState } from 'react';
import { joinEventByCode} from '@/app/lib/actions';
import { useRouter } from 'next/navigation';

export default function AcceptInviteButton({ inviteId }: { inviteId: string }) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleAccept = async () => {
        setIsLoading(true);
        setError(null);
        const result = await joinEventByCode(inviteId);
        if (result.success && result.eventId) {
            // On success, redirect to the event dashboard
            router.push(`/dashboard/events/${result.eventId}`);
        } else {
            setError(result.error || "An unknown error occurred.");
            setIsLoading(false);
        }
    };

    return (
        <div>
            <button
                onClick={handleAccept}
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md font-semibold disabled:bg-blue-300"
            >
                {isLoading ? 'Accepting...' : 'Accept Invitation'}
            </button>
            {error && <p className="mt-2 text-red-500 text-sm">{error}</p>}
        </div>
    );
}
