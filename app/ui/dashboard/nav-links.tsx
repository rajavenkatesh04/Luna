// app/ui/dashboard/nav-links.tsx

"use client"

import { usePathname } from "next/navigation";
import Link from "next/link";
import clsx from 'clsx';
import { HomeIcon, CalendarDaysIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

const links = [
    { name: 'Overview', href: '/dashboard', icon: HomeIcon },
    { name: 'Events', href: '/dashboard/events', icon: CalendarDaysIcon },
    { name: 'Invitations', href: '/dashboard/invitations', icon: EnvelopeIcon },
];

export default function NavLinks() {
    const pathname = usePathname();

    return (
        <>
            {links.map((link) => {
                const LinkIcon = link.icon;

                return (
                    <Link
                        key={link.name}
                        href={link.href}
                        className={clsx(
                            // Base styles for all links
                            'flex h-[48px] grow items-center justify-center gap-2 rounded-md border border-transparent p-3 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 md:flex-none md:justify-start md:p-2 md:px-3',
                            {
                                // Active link styles
                                'bg-gray-100 text-gray-900 dark:bg-zinc-800 dark:text-zinc-100': pathname === link.href,
                            },
                        )}
                    >
                        <LinkIcon className="w-6" />
                        <p className="hidden md:block">{link.name}</p>
                    </Link>
                );
            })}
        </>
    );
}