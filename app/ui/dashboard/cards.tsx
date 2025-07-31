// app/ui/dashboard/cards.tsx

import { UserGroupIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import { fetchCardData } from '@/app/lib/data';
import { auth } from '@/app/lib/firebase-admin';

const iconMap = {
    events: CalendarDaysIcon,
    admins: UserGroupIcon,
};

function Card({ title, value, type }: { title: string; value: number; type: 'events' | 'admins' }) {
    const Icon = iconMap[type];
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center">
                {Icon ? <Icon className="h-5 w-5 text-gray-700 dark:text-zinc-200" /> : null}
                <h3 className="ml-2 text-sm font-medium text-gray-800 dark:text-zinc-200">{title}</h3>
            </div>
            <p className="mt-2 truncate rounded-xl bg-gray-50 px-4 py-8 text-center text-2xl font-bold dark:bg-black/50">
                {value}
            </p>
        </div>
    );
}

export default async function CardWrapper() {
    const session = await auth.getSession();
    if (!session) return null;

    const { totalEvents, totalAdmins } = await fetchCardData(session.uid);

    return (
        <>
            <Card title="Total Events" type="events" value={totalEvents} />
            <Card title="Total Admins" type="admins" value={totalAdmins} />
        </>
    );
}