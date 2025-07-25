import Link from "next/link";
import LunaLogo from "@/app/ui/luna-logo";
import NavLinks from "@/app/ui/dashboard/nav-links";
import { logout } from "@/app/lib/actions";
import { PowerIcon } from '@heroicons/react/24/outline';
import { auth } from '@/app/lib/firebase-admin';
import UserAvatar from './user-avatar'; // Import our new Client Component

// This remains a Server Component to securely fetch data
export default async function SideNav() {
    const session = await auth.getSession();
    const user = {
        name: session?.name || 'User',
        email: session?.email || '',
        imageUrl: session?.picture || '/placeholder-user.jpg',
    };

    return (
        <div className="flex h-full flex-col px-3 py-4 md:px-2">
            <Link
                className="mb-2 flex h-20 items-end justify-start rounded-md  border border-gray-700 p-4 md:h-40"
                href="/"
            >
                <div className="w-32  md:w-40">
                    <LunaLogo />
                </div>
            </Link>

            <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
                <NavLinks />
                <div className="hidden h-auto w-full grow rounded-md  md:block"></div>

                {/* User Profile Section */}
                <div className="flex items-center gap-3 p-2 border-t border-gray-200">
                    {/* We use our new interactive component here */}
                    <UserAvatar name={user.name} imageUrl={user.imageUrl} />
                    <div className="hidden md:block">
                        <p className="">{user.name}</p>
                        <p className="text-xs overflow-ellipsis text-gray-500">{user.email}</p>
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
