"use client"

import {usePathname} from "next/navigation";
import Link from "next/link";
import clsx from 'clsx';
import {
    HomeIcon,
    CalendarDaysIcon,
} from '@heroicons/react/24/outline';

const links = [
    { name: 'Overview', href: '/dashboard', icon: HomeIcon },
    { name: 'Events', href: '/dashboard/events', icon: CalendarDaysIcon },
]

export default function NavLinks() {

    const pathname = usePathname();

    return(
        <>
            {links.map((link) => {
                const LinkIcon = link.icon;

                return(
                    <Link
                        key={link.name}
                        href={link.href}
                        className={clsx(
                            'flex h-[48px] grow items-center justify-center gap-2 rounded-md border border-gray-700 p-3 text-sm font-medium hover:bg-gray-50 hover:text-gray-600 md:flex-none md:justify-start md:p-2 md:px-3',
                            {
                                'bg-gray-50 text-gray-500': pathname === link.href,
                            },
                        )}
                    >
                        <LinkIcon className={`w-6`}/>
                        <p className={`hidden md:block`}>{link.name}</p>
                    </Link>
                )
            })}
        </>
    )
}