// app/dashboard/invitations/page.tsx

import { Suspense } from 'react';
import { fetchPendingInvites } from '@/app/lib/data';
import { auth } from '@/app/lib/firebase-admin';
import { acceptInvite } from '@/app/lib/actions';
import { notFound } from 'next/navigation';
import { InvitationsSkeleton } from '@/app/ui/skeletons';

async function InvitationsList() {
    const session = await auth.getSession();
    // This check is good practice, although the parent will also check
    if (!session) return null;

    const invites = await fetchPendingInvites(session.uid);

    return (
        <div className="mt-6 space-y-4">
            {invites.length > 0 ? (
                invites.map(invite => (
                    <div key={invite.id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-zinc-400">You&apos;ve been invited to be an admin for the event:</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-zinc-100">{invite.eventTitle}</p>
                        </div>
                        <form action={acceptInvite}>
                            <input type="hidden" name="invitationId" value={invite.id} />
                            <button type="submit" className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700 active:bg-green-800">
                                Accept
                            </button>
                        </form>
                    </div>
                ))
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