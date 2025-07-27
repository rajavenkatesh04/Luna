import { acceptInvite } from "@/app/lib/actions";
import { Loader } from 'lucide-react';

export default async function InvitePage({ params }: { params: { inviteId: string } }) {

    // The server action will handle the logic and redirection
    await acceptInvite(params.inviteId);

    // This UI will only be shown briefly, or if the redirect fails for some reason.
    return (
        <div className="flex min-h-screen flex-col items-center justify-center space-y-4">
            <Loader className="h-12 w-12 animate-spin text-indigo-600" />
            <h1 className="text-xl font-medium text-gray-700">Joining event...</h1>
            <p className="text-gray-500">Please wait while we add you to the event.</p>
        </div>
    );
}