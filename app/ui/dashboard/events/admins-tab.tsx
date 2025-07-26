'use client';

import { useState } from 'react';
import { createInvite } from '@/app/lib/actions';
import { User } from '@/app/lib/definitions';
import { DocumentDuplicateIcon, CheckIcon } from '@heroicons/react/24/outline';

// A small client component to handle the "generating invite" state
function InviteButton({ eventId }: { eventId: string }) {
    const [inviteLink, setInviteLink] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const generateLink = async () => {
        setIsLoading(true);
        const result = await createInvite(eventId);
        if (result.inviteId) {
            const origin = window.location.origin;
            setInviteLink(`${origin}/join/${result.inviteId}`);
        } else {
            // Handle error, maybe show a toast notification
            console.error(result.error);
        }
        setIsLoading(false);
    };

    const copyToClipboard = () => {
        if (inviteLink) {
            navigator.clipboard.writeText(inviteLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
        }
    };

    if (inviteLink) {
        return (
            <div className="flex items-center gap-2">
                <input type="text" readOnly value={inviteLink} className="block w-full rounded-md border-gray-200 bg-gray-100 py-1.5 px-3 text-sm" />
                <button onClick={copyToClipboard} className="p-2 rounded-md bg-gray-200 hover:bg-gray-300">
                    {copied ? <CheckIcon className="w-5 h-5 text-green-600" /> : <DocumentDuplicateIcon className="w-5 h-5" />}
                </button>
            </div>
        );
    }

    return (
        <button onClick={generateLink} disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700  disabled:bg-blue-300">
            {isLoading ? 'Generating...' : '+ Invite Admin'}
        </button>
    );
}


export default function AdminsTab({ eventId, admins }: { eventId: string, admins: User[] }) {
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl ">Manage Admins</h3>
                    <p className="text-sm text-gray-500">Invite collaborators to help manage this event.</p>
                </div>
                <InviteButton eventId={eventId} />
            </div>

            <div className="bg-white border rounded-lg">
                <ul className="divide-y divide-gray-200">
                    {admins.map(admin => (
                        <li key={admin.uid} className="px-6 py-4 flex items-center justify-between">
                            <div>
                                <p className="font-medium">{admin.displayName}</p>
                                <p className="text-sm text-gray-500">{admin.email}</p>
                            </div>
                            <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                                {admin.role.charAt(0).toUpperCase() + admin.role.slice(1)}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
