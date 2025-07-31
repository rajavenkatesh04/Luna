// app/dashboard/invitations/page.tsx

import { Suspense } from 'react';
import { fetchPendingInvites } from '@/app/lib/data';
import { auth } from '@/app/lib/firebase-admin';
import { acceptInvite } from '@/app/lib/actions';
import { notFound } from 'next/navigation';
import { InvitationsSkeleton } from '@/app/ui/skeletons';

async function InvitationsList() {
    const session = await auth.getSession();
    if (!session) return null;

    const invites = await fetchPendingInvites(session.uid);

    return (
        <div className="mt-6">
            {invites.length > 0 ? (
                <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <ul className="divide-y divide-gray-200 dark:divide-zinc-800">
                        {invites.map(invite => (
                            <li key={invite.id} className="flex items-center justify-between p-4">
                                <p className="font-medium text-gray-900 dark:text-zinc-100">
                                    Invitation to join <span className="font-semibold">{invite.eventTitle}</span>
                                </p>
                                <form action={acceptInvite}>
                                    <input type="hidden" name="invitationId" value={invite.id} />
                                    <button
                                        type="submit"
                                        className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                                    >
                                        Accept
                                    </button>
                                </form>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <div className="rounded-lg border border-dashed border-gray-300 bg-white py-12 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <p className="text-gray-500 dark:text-zinc-400">You have no pending invitations.</p>
                </div>
            )}
        </div>
    );
}

export default async function InvitationsPage() {
    const session = await auth.getSession();
    if (!session) notFound();

    return (
        <main>
            <h1 className="text-3xl font-semibold text-gray-900 dark:text-zinc-100">Event Invitations</h1>
            <p className="mt-1 text-gray-600 dark:text-zinc-400">Accept an invitation to become an admin for an event.</p>

            <Suspense fallback={<InvitationsSkeleton />}>
                <InvitationsList />
            </Suspense>
        </main>
    );
}