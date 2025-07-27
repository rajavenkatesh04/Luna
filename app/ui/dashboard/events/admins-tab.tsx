'use client';

import { User } from '@/app/lib/definitions';

export default function AdminsTab({ eventId, admins }: { eventId: string, admins: User[] }) {
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl ">Manage Admins</h3>
                    <p className="text-sm text-gray-500">Invite collaborators to help manage this event.</p>
                </div>
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
