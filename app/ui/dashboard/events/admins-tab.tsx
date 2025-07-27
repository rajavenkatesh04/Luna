'use client';

import { useState } from 'react';
import { User } from '@/app/lib/definitions';
import { generateInviteLink, removeAdmin } from '@/app/lib/actions';
import Image from 'next/image';
import { UserPlus, Settings, Link as LinkIcon, Check, Copy, Trash2, ShieldAlert } from 'lucide-react';
import { useFormState } from 'react-dom';

type AdminWithPermissions = User & {
    permissions: {
        canEditEvent: boolean;
        canDeleteEvent: boolean;
        canManageAdmins: boolean;
        canSendAnnouncements: boolean;
    }
};

function PermissionCheckbox({ label, id, checked, onChange }: { label: string, id: string, checked: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
    return (
        <label htmlFor={id} className="flex items-center space-x-3 p-3 rounded-md hover:bg-gray-100 transition-colors cursor-pointer">
            <input id={id} name={id} type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"/>
            <span className="text-sm font-medium text-gray-700">{label}</span>
        </label>
    );
}

export default function AdminsTab({ eventId, admins, ownerUid }: { eventId: string, admins: AdminWithPermissions[], ownerUid: string }) {
    const [modal, setModal] = useState<'invite' | 'remove' | null>(null);
    const [selectedAdmin, setSelectedAdmin] = useState<AdminWithPermissions | null>(null);
    const [permissions, setPermissions] = useState({
        canEditEvent: true,
        canDeleteEvent: false,
        canManageAdmins: false,
        canSendAnnouncements: true,
    });
    const [inviteState, setInviteState] = useState<{ link?: string; error?: string; loading: boolean }>({ loading: false });
    const [copied, setCopied] = useState(false);

    const handlePermissionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPermissions({ ...permissions, [e.target.name]: e.target.checked });
    };

    const handleGenerateLink = async () => {
        setInviteState({ loading: true });
        const result = await generateInviteLink(eventId, permissions);
        setInviteState({ ...result, loading: false });
    };

    const copyToClipboard = () => {
        if (inviteState.link) {
            navigator.clipboard.writeText(inviteState.link);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleRemoveAdmin = async () => {
        if (!selectedAdmin) return;
        await removeAdmin(eventId, selectedAdmin.uid);
        setModal(null);
        setSelectedAdmin(null);
    };

    return (
        <div>
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-xl font-bold ">Manage Admins</h3>
                    <p className="text-sm text-gray-500">Invite or manage collaborators for this event.</p>
                </div>
                <button
                    onClick={() => { setModal('invite'); setInviteState({ loading: false }); }}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white  rounded-lg shadow-sm hover:bg-indigo-700 transition-all transform hover:scale-105"
                >
                    <UserPlus className="h-4 w-4" />
                    Invite Admin
                </button>
            </div>

            <div className="border rounded-lg ">
                <ul className="divide-y divide-gray-200">
                    {admins.map(admin => (
                        <li key={admin.uid} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                            <div className="flex items-center gap-4">
                                <Image src={admin.photoURL || '/default-avatar.png'} alt={`${admin.displayName}'s profile picture`} width={40} height={40} className="rounded-full"/>
                                <div>
                                    <p className="font-medium text-gray-900">{admin.displayName}</p>
                                    <p className="text-sm text-gray-500">{admin.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {ownerUid === admin.uid ? (
                                    <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">Owner</span>
                                ) : (
                                    <button onClick={() => { setSelectedAdmin(admin); setModal('remove'); }} className="p-2 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50" title="Remove Admin">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Invite Admin Modal */}
            {modal === 'invite' && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-bold mb-1">Generate Invite Link</h3>
                        <p className="text-sm text-gray-500 mb-4">Configure permissions for this reusable invite link.</p>
                        {!inviteState.link && (
                            <div className="space-y-1">
                                <PermissionCheckbox id="canEditEvent" label="Can edit event details" checked={permissions.canEditEvent} onChange={handlePermissionChange} />
                                <PermissionCheckbox id="canSendAnnouncements" label="Can send announcements" checked={permissions.canSendAnnouncements} onChange={handlePermissionChange} />
                                <PermissionCheckbox id="canManageAdmins" label="Can manage other admins" checked={permissions.canManageAdmins} onChange={handlePermissionChange} />
                                <PermissionCheckbox id="canDeleteEvent" label="Can delete the event (destructive)" checked={permissions.canDeleteEvent} onChange={handlePermissionChange} />
                            </div>
                        )}
                        {inviteState.link && (
                            <div className="mt-4 p-3 bg-gray-100 rounded-md">
                                <p className="text-sm font-medium text-gray-800">Share this link with new admins:</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <LinkIcon className="h-4 w-4 text-gray-400 shrink-0" />
                                    <input type="text" readOnly value={inviteState.link} className="w-full bg-transparent text-sm text-indigo-700 outline-none truncate" />
                                    <button onClick={copyToClipboard} className="p-1.5 rounded-md hover:bg-gray-200 shrink-0">
                                        {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-gray-500" />}
                                    </button>
                                </div>
                            </div>
                        )}
                        {inviteState.error && <p className="text-sm text-red-500 mt-4">{inviteState.error}</p>}
                        <div className="mt-6 flex justify-end gap-3">
                            <button onClick={() => setModal(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
                            {!inviteState.link && (
                                <button onClick={handleGenerateLink} disabled={inviteState.loading} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300">{inviteState.loading ? 'Generating...' : 'Generate Link'}</button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Remove Admin Confirmation Modal */}
            {modal === 'remove' && selectedAdmin && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md">
                        <div className="flex items-start">
                            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                <ShieldAlert className="h-6 w-6 text-red-600" aria-hidden="true" />
                            </div>
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">Remove Admin</h3>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500">
                                        Are you sure you want to remove <strong className="text-gray-900">{selectedAdmin.displayName}</strong>? They will lose all access to manage this event. This action cannot be undone.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                            <button onClick={handleRemoveAdmin} type="button" className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 sm:ml-3 sm:w-auto sm:text-sm">Remove</button>
                            <button onClick={() => setModal(null)} type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}