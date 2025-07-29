'use client';

import { User } from '@/app/lib/definitions';
import UserAvatar from '../user-avatar';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { sendInvite } from '@/app/lib/actions';

function InviteButton() {
    const { pending } = useFormStatus();
    return (
        <button type="submit" disabled={pending} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50">
            {pending ? 'Sending...' : 'Send Invite'}
        </button>
    );
}

export default function AdminsTab({ eventId, admins, orgId }: { eventId: string, admins: User[], orgId: string }) {
    const [state, formAction] = useActionState(sendInvite, { message: null });

    return (
        <div className="space-y-8">
            {/* Header Section from your preferred design */}
            <div>
                <h2 className="text-xl font-semibold">Manage Admins</h2>
                <p className="mt-1 text-sm text-gray-500">Invite collaborators to help manage this event.</p>
            </div>

            {/* Functional Invite Form */}
            <div>
                <h3 className="font-medium text-gray-700">Invite New Admin</h3>
                <form action={formAction} className="mt-2 flex items-center gap-3 rounded-lg border p-4">
                    <input type="hidden" name="eventId" value={eventId} />
                    <input type="hidden" name="orgId" value={orgId} />
                    <input
                        type="email"
                        name="inviteeEmail"
                        required
                        placeholder="user@example.com"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                    <InviteButton />
                </form>
                {state?.message && <p className="mt-2 text-sm text-gray-600">{state.message}</p>}
            </div>

            {/* Styled List of Current Admins */}
            <div>
                <h3 className="font-medium text-gray-700">Current Admins</h3>
                <div className="mt-2 border rounded-lg">
                    <ul className="divide-y divide-gray-200">
                        {admins.map(admin => (
                            <li key={admin.uid} className="px-6 py-4 flex items-center justify-between">
                                {/* User info with Avatar */}
                                <div className="flex items-center gap-4">
                                    <div>
                                        <p className="font-medium text-gray-900">{admin.displayName}</p>
                                        <p className="text-sm text-gray-500">{admin.email}</p>
                                    </div>
                                </div>
                                {/* Styled Role Badge */}
                                <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                                    {admin.role ? admin.role.charAt(0).toUpperCase() + admin.role.slice(1) : 'Member'}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}