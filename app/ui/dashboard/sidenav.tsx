import Link from "next/link";
import LunaLogo from "@/app/ui/luna-logo";
import NavLinks from "@/app/ui/dashboard/nav-links";
import { logout } from "@/app/lib/actions";
import { PowerIcon } from '@heroicons/react/24/outline';
import { auth } from '@/app/lib/firebase-admin';
import UserAvatar from './user-avatar';
import { fetchUserProfile } from '@/app/lib/data';

// This remains a Server Component to securely fetch data
export default async function SideNav() {
    const session = await auth.getSession();
    const userProfile = session ? await fetchUserProfile(session.uid) : null;

    // Combine session data with Firestore data for a complete profile
    const user = {
        name: session?.name || 'User',
        email: session?.email || '',
        imageUrl: session?.picture || '/placeholder-user.jpg',
        role: userProfile?.role || 'member',
        organizationName: userProfile?.organizationName || 'Your Workspace',
    };

    const roleStyles = {
        master: 'bg-red-100 text-red-800 ring-red-600/20',     // Garnet
        owner:  'bg-amber-100 text-amber-800 ring-amber-600/20', // Gold
        admin:  'bg-blue-100 text-blue-800 ring-blue-600/20',  // Blue
        member: 'bg-gray-100 text-gray-800 ring-gray-600/20', // Default
    };

    return (
        <div className="flex h-full flex-col px-3 py-4 md:px-2">
            <Link
                className="bg-gradient-to-r from-red-400 to-pink-700 mb-2 flex  items-end justify-start rounded-md p-4 h-40"
                href="/"
            >
                <div className="w-32 text-white md:w-40">
                    <LunaLogo />
                </div>
            </Link>

            <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
                <NavLinks />
                <div className="hidden h-auto w-full grow rounded-md  md:block"></div>

                {/* User Profile Section */}
                <div className="flex flex-col border-t border-gray-200">
                    {/* Main user info area */}
                    <div className="flex w-full items-center border gap-3 p-3">
                        <UserAvatar name={user.name} imageUrl={user.imageUrl} />
                        <div className="hidden md:block min-w-0">
                            <p className=" truncate">{user.name}</p>
                            <p className="text-xs text-gray-500 text-wrap wrap-anywhere">{user.email}</p>
                        </div>
                    </div>

                    {/* Workspace and Role Info (Desktop only) */}
                    <div className="hidden md:block space-y-2 border-t border-gray-200 px-3 py-3 text-sm">
                        <div className="flex justify-between items-center gap-2 ">
                            <span className="font-semibold text-gray-600">Workspace:</span>
                            <p className="text-gray-700 text-wrap wrap-anywhere text-xs ">{user.organizationName}</p>
                        </div>
                        <div className="flex justify-start gap-3 ">
                            <span className="font-semibold text-gray-600">Role:</span>
                            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${roleStyles[user.role as keyof typeof roleStyles] || roleStyles.member}`}>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span>
                        </div>
                    </div>
                </div>

                <form action={logout}>
                    <button className="flex h-[48px] w-full grow items-center border border-red-500 justify-center gap-2 rounded-md  p-3 text-sm font-medium hover:bg-red-500  md:flex-none md:justify-start md:p-2 md:px-3">
                        <PowerIcon className="w-6" />
                        <div className="hidden md:block">Sign Out</div>
                    </button>
                </form>
            </div>
        </div>
    );
}