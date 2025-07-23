import Link from "next/link";
import LunaLogo from "@/app/ui/luna-logo";
import NavLinks from "@/app/ui/dashboard/nav-links";
import {logout} from "@/app/lib/actions";
import { PowerIcon } from '@heroicons/react/24/outline';

export default function SideNav() {
    return(
        <div className={`flex h-full flex-col px-3 py-4 md: px-2`}>
            <Link
                className={`mb-2 flex h-20 items-end justify-start rounded-md border border-gray-700 p-4 md: h-40`}
                href={"/"}
            >
                <div className={`w-32 md:w-40`}>
                    <LunaLogo/>
                </div>
            </Link>

            <div className={`flex grow flex-row justify-between space-x-2 md:flex-col md:flex-col md:space-x-0 md:space-y-2`}>
                <NavLinks />
                <div className="hidden h-auto w-full grow rounded-md border border-gray-700 md:block"></div>
                <form action={logout}>
                    <button
                        className={`flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md border border-red-500 p-3 text-sm font-medium hover:bg-red-500 hover:text-white md:flex-none md:justify-start md:p-2 md:px-3`}
                    >
                        <PowerIcon className="w-6" />
                        <div className="hidden md:block">Sign Out</div>
                    </button>
                </form>
            </div>
        </div>
    )
}