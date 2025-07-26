import { auth } from '@/app/lib/firebase-admin';
import { notFound } from 'next/navigation';
import AcceptInviteButton from '@/app/ui/join/accept-invite-button';
import Link from 'next/link';
import {joinEventByCode} from "@/app/lib/actions";

export default async function Page({ params }: { params: { id: string } }) {
    const { id: inviteId } = params;
    const session = await auth.getSession();
    const invite = await joinEventByCode(inviteId);

    if (!invite) {
        // This handles invalid or already used invites
        return (
            <main className="flex items-center justify-center min-h-screen text-center">
                <div>
                    <h1 className="text-2xl font-bold">Invitation Not Found</h1>
                    <p>This invite link is invalid or has already been used. Please request a new one.</p>
                    <Link href="/dashboard" className="mt-4 inline-block text-blue-600">Go to Dashboard</Link>
                </div>
            </main>
        );
    }

    // If the user is not logged in, show a message prompting them to sign in.
    if (!session) {
        return (
            <main className="flex items-center justify-center min-h-screen text-center">
                <div>
                    <h1 className="text-2xl font-bold">You're Invited!</h1>
                    <p className="mt-2">You've been invited to collaborate on the event:</p>
                    <p className="text-xl font-semibold my-2">"{invite.eventTitle}"</p>
                    <p className="mb-4">Please sign in to accept the invitation.</p>
                    <Link href="/login" className="px-6 py-2 bg-blue-600 text-white rounded-md font-semibold">
                        Sign In with Google
                    </Link>
                </div>
            </main>
        );
    }

    // If the user is logged in, show the accept button.
    return (
        <main className="flex items-center justify-center min-h-screen text-center">
            <div>
                <h1 className="text-2xl font-bold">You're Invited!</h1>
                <p className="mt-2">You've been invited to collaborate on the event:</p>
                <p className="text-xl font-semibold my-2">"{invite.eventTitle}"</p>
                <AcceptInviteButton inviteId={inviteId} />
            </div>
        </main>
    );
}
