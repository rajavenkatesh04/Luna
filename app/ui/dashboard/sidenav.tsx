// app/ui/dashboard/sidenav.tsx

import Link from "next/link";
import LunaLogo from "@/app/ui/luna-logo";
import NavLinks from "@/app/ui/dashboard/nav-links";
import { logout } from "@/app/lib/actions";
import { PowerIcon } from '@heroicons/react/24/outline';
import { auth } from '@/app/lib/firebase-admin';
import UserAvatar from './user-avatar';
import { fetchUserProfile } from '@/app/lib/data';

export default async function SideNav() {
    const session = await auth.getSession();
    const userProfile = session ? await fetchUserProfile(session.uid) : null;

    const user = {
        name: session?.name || 'User',
        email: session?.email || '',
        imageUrl: session?.picture || '/placeholder-user.jpg',
        role: userProfile?.role || 'member',
        organizationName: userProfile?.organizationName || 'Your Workspace',
    };

    const roleStyles = {
        master: 'bg-red-100 text-red-800 ring-red-600/20 dark:bg-red-900/50 dark:text-red-300 dark:ring-red-400/20',
        owner:  'bg-amber-100 text-amber-800 ring-amber-600/20 dark:bg-amber-900/50 dark:text-amber-300 dark:ring-amber-400/20',
        admin:  'bg-blue-100 text-blue-800 ring-blue-600/20 dark:bg-blue-900/50 dark:text-blue-300 dark:ring-blue-400/20',
        member: 'bg-gray-100 text-gray-800 ring-gray-600/20 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700/50',
    };

    return (
        <div className="flex h-full flex-col bg-white px-3 py-4 text-gray-900 dark:bg-zinc-900 dark:text-zinc-100 md:px-2">
            <Link
                className="mb-2 flex h-40 items-end justify-start rounded-md bg-gradient-to-r from-red-400 to-pink-700 p-4"
                href="/"
            >
                <div className="w-32 text-white md:w-40">
                    <LunaLogo />
                </div>
            </Link>

            <div className="flex grow flex-row justify-between md:flex-col md:space-x-0 md:space-y-2">
                <NavLinks />
                <div className="hidden h-auto w-full grow rounded-md md:block"></div>

                <div className="flex flex-col border-t border-gray-200 dark:border-zinc-800">
                    <div className="flex w-full items-center py-2">
                        <div className="mr-2 "><UserAvatar name={user.name} imageUrl={user.imageUrl} /></div>
                        <div className="hidden min-w-0 md:block">
                            <p className="truncate font-medium">{user.name}</p>
                            <p className="text-xs text-gray-500 wrap-anywhere dark:text-zinc-400">{user.email}</p>
                        </div>
                    </div>

                    <div className="hidden space-y-2 border-t border-gray-200 px-3 py-3 text-sm dark:border-zinc-800 md:block">
                        <div className="flex items-center justify-between gap-2">
                            <span className="">Workspace:</span>
                            <p className="wrap-anywhere text-xs text-gray-600 dark:text-zinc-300">{user.organizationName}</p>
                        </div>
                        <div className="flex items-start justify-between gap-3">
                            <span className="">Role:</span>
                            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${roleStyles[user.role as keyof typeof roleStyles] || roleStyles.member}`}>
                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </span>
                        </div>
                    </div>
                </div>

                <form action={logout}>
                    <button className="flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md border border-red-500 p-3 text-sm font-medium text-red-500 hover:bg-red-500 hover:text-white dark:border-red-600/50 dark:text-red-400 dark:hover:bg-red-600/30 dark:hover:text-white md:flex-none md:justify-start md:p-2 md:px-3">
                        <PowerIcon className="w-6" />
                        <div className="hidden md:block">Sign Out</div>
                    </button>
                </form>
            </div>
        </div>
    );
}