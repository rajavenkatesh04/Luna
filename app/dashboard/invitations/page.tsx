// app/dashboard/invitations/page.tsx
import { fetchPendingInvites } from '@/app/lib/data';
import { auth } from '@/app/lib/firebase-admin';
import { acceptInvite } from '@/app/lib/actions';
import { notFound } from 'next/navigation';

export default async function InvitationsPage() {
    const session = await auth.getSession();
    if (!session) notFound();

    const invites = await fetchPendingInvites(session.uid);

    return (
        <main>
            <h1 className="text-3xl">Event Invitations</h1>
            <p className="mt-2 text-gray-600">Accept an invitation to become an admin for an event.</p>
            <div className="mt-6 space-y-4">
                {invites.length > 0 ? (
                    invites.map(invite => (
                        <div key={invite.id} className="flex items-center justify-between rounded-lg border p-4">
                            <div>
                                <p>You&apos;ve been invited to be an admin for the event:</p>
                                <p className="font-semibold text-lg">{invite.eventTitle}</p>
                            </div>
                            <form action={acceptInvite}>
                                <input type="hidden" name="invitationId" value={invite.id} />
                                <button type="submit" className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-500">
                                    Accept
                                </button>
                            </form>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-500 py-8">You have no pending invitations.</p>
                )}
            </div>
        </main>
    );
}