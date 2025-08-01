'use client';

import { User } from '@/app/lib/definitions';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { sendInvite } from '@/app/lib/actions';
import LoadingSpinner from '@/app/ui/dashboard/loading-spinner';
import RemoveAdminButton from './remove-admin-button';

function InviteButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full whitespace-nowrap rounded-md bg-blue-600 px-4 py-2 text-sm text-white shadow-sm transition-colors hover:bg-blue-700 active:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-700 dark:hover:bg-blue-600 md:w-max"
        >
            {pending ? (
                <div className="flex items-center justify-center">
                    <LoadingSpinner className="mr-2" />
                    <span>Sending...</span>
                </div>
            ) : 'Send Invite'}
        </button>
    );
}

export default function AdminsTab({
                                      eventId,
                                      admins,
                                      orgId,
                                      ownerUid,
                                      currentUserId
                                  }: {
    eventId: string,
    admins: User[],
    orgId: string,
    ownerUid: string,
    currentUserId: string
}) {
    const [state, formAction] = useActionState(sendInvite, { message: null });

    const owner = admins.find(admin => admin.uid === ownerUid);
    const otherAdmins = admins.filter(admin => admin.uid !== ownerUid);

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-zinc-100">Manage Admins</h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-zinc-400">Invite or remove collaborators for this event.</p>
            </div>

            {/* Invite Form Section */}
            <div>
                <h3 className="font-medium text-gray-900 dark:text-zinc-100">Invite New Admin</h3>
                <form action={formAction} className="mt-2 flex flex-col items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 md:flex-row">
                    <input type="hidden" name="eventId" value={eventId} />
                    <input type="hidden" name="orgId" value={orgId} />
                    <input
                        type="email"
                        name="inviteeEmail"
                        required
                        placeholder="user@example.com"
                        className="block w-full rounded-md border border-gray-200 bg-gray-50 py-2 px-3 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                    />
                    <InviteButton />
                </form>
                {state?.message && <p className="mt-2 text-sm text-gray-600 dark:text-zinc-400">{state.message}</p>}
            </div>

            {/* List of Current Admins */}
            <div className="space-y-4">
                {/* Owner Section */}
                {owner && (
                    <div>
                        <h3 className="font-medium text-gray-900 dark:text-zinc-100">Owner</h3>
                        <div className="mt-2 rounded-lg border-2 border-amber-200 bg-amber-50 shadow-sm dark:border-amber-900 dark:bg-amber-950/20">
                            <div className="flex items-center justify-between px-6 py-4">
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-zinc-100">
                                        {owner.displayName}
                                        {currentUserId === owner.uid && <span className="ml-2 text-xs font-normal text-gray-500 dark:text-zinc-500">(You)</span>}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-zinc-400">{owner.email}</p>
                                </div>
                                <span className="inline-flex items-center rounded-md bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-900/50 dark:text-amber-300 dark:ring-amber-400/20">
                                    Owner
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Other Admins Section */}
                <div>
                    <h3 className="font-medium text-gray-900 dark:text-zinc-100">Event Admins</h3>
                    <div className="mt-2 rounded-lg border border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                        {otherAdmins.length > 0 ? (
                            <ul className="divide-y divide-gray-200 dark:divide-zinc-800">
                                {otherAdmins.map(admin => (
                                    <li key={admin.uid} className="flex items-center justify-between px-6 py-4">
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-zinc-100">
                                                {admin.displayName}
                                                {currentUserId === admin.uid && <span className="ml-2 text-xs font-normal text-pink-500">(You)</span>}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-zinc-400">{admin.email}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="inline-flex items-center rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 ring-1 ring-inset ring-blue-600/20 dark:bg-blue-900/50 dark:text-blue-300 dark:ring-blue-400/20">
                                                Admin
                                            </span>
                                            {currentUserId === ownerUid && (
                                                <RemoveAdminButton orgId={orgId} eventId={eventId} adminUidToRemove={admin.uid} />
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="px-6 py-4 text-sm text-gray-500 dark:text-zinc-400">There are no other admins for this event.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}