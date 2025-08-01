// app/dashboard/events/[id]/page.tsx

import { Suspense } from 'react';
import { auth } from '@/app/lib/firebase-admin';
import { fetchEventById, fetchUserProfile, fetchUsersByUid, fetchSubscriberCount } from '@/app/lib/data';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/app/ui/dashboard/events/breadcrumbs';
import Link from 'next/link';
import { EyeIcon, UsersIcon } from '@heroicons/react/24/outline';
import AnnouncementsTab from '@/app/ui/dashboard/events/announcements-tab';
import AdminsTab from '@/app/ui/dashboard/events/admins-tab';
import SettingsTab from '@/app/ui/dashboard/events/settings-tab';
import clsx from 'clsx';
import QrCodeDisplay from "@/app/ui/dashboard/events/qr-code-display";
import { EventDetailsPageSkeleton } from '@/app/ui/skeletons';

type PageProps = {
    params: Promise<{ id: string }>;
    searchParams?: Promise<{ tab?: string }>;
};

async function EventDetails({ params, searchParams }: PageProps) {
    // Await params and searchParams before using them
    const { id: eventId } = await params;
    const resolvedSearchParams = await searchParams;
    const activeTab = resolvedSearchParams?.tab || 'announcements';

    const session = await auth.getSession();
    if (!session) notFound();

    const [event, userProfile, subscriberCount] = await Promise.all([
        fetchEventById(session.uid, eventId),
        fetchUserProfile(session.uid),
        fetchSubscriberCount(session.uid, eventId)
    ]);

    if (!event || !userProfile) notFound();

    const adminUsers = await fetchUsersByUid(event.admins);

    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                    { label: 'Events', href: '/dashboard/events' },
                    {
                        label: event.title,
                        href: `/dashboard/events/${event.docId}`,
                        active: true,
                    },
                ]}
            />

            <div className="mb-8 mt-4">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                        <h1 className="truncate text-3xl tracking-wide text-gray-900 dark:text-zinc-100">{event.title}</h1>
                        <p className="mt-1 text-gray-500 dark:text-zinc-400 md:hidden">{event.description}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-2 rounded-md border border-gray-200 p-2 text-sm dark:border-zinc-800 dark:bg-zinc-900">
                            <UsersIcon className="h-5 w-5 text-gray-400 dark:text-zinc-500" />
                            <span className="font-medium text-blue-500">{subscriberCount}</span>
                            <span className="text-gray-500 dark:text-zinc-400">Subscribers</span>
                        </div>
                        <Link href={`/e/${event.id}`} target="_blank" className="flex items-center gap-2 rounded-md border border-gray-200 px-4 py-2 text-sm text-gray-700 shadow-sm hover:bg-gray-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800">
                            <EyeIcon className="h-4 w-4" />
                            View
                        </Link>
                        <QrCodeDisplay eventId={event.id} />
                    </div>
                </div>
                <p className="hidden md:block mt-2 text-gray-600 dark:text-zinc-400">{event.description}</p>
            </div>

            <div className="w-full">
                <div className="border-b border-gray-200 dark:border-zinc-800">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <Link
                            href={`/dashboard/events/${event.docId}?tab=announcements`}
                            className={clsx(
                                "whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium",
                                {
                                    'border-blue-500 text-blue-600 dark:text-blue-400': activeTab === 'announcements',
                                    'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:text-zinc-300': activeTab !== 'announcements'
                                }
                            )}
                        >
                            Announcements
                        </Link>
                        <Link
                            href={`/dashboard/events/${event.docId}?tab=admins`}
                            className={clsx(
                                "whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium",
                                {
                                    'border-blue-500 text-blue-600 dark:text-blue-400': activeTab === 'admins',
                                    'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:text-zinc-300': activeTab !== 'admins'
                                }
                            )}
                        >
                            Admins
                        </Link>
                        <Link
                            href={`/dashboard/events/${event.docId}?tab=settings`}
                            className={clsx(
                                "whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium",
                                {
                                    'border-blue-500 text-blue-600 dark:text-blue-400': activeTab === 'settings',
                                    'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:text-zinc-300': activeTab !== 'settings'
                                }
                            )}
                        >
                            Settings
                        </Link>
                    </nav>
                </div>

                <div className="py-6">
                    {activeTab === 'announcements' && <AnnouncementsTab eventId={event.docId} orgId={event.organizationId} />}
                    {activeTab === 'admins' && <AdminsTab eventId={event.docId} admins={adminUsers} orgId={userProfile.organizationId} ownerUid={event.ownerUid} currentUserId={session.uid} />}
                    {activeTab === 'settings' && <SettingsTab eventId={event.docId} />}
                </div>
            </div>
        </main>
    );
}

export default function PageWithSuspense(props: PageProps) {
    return (
        <Suspense fallback={<EventDetailsPageSkeleton />}>
            <EventDetails {...props} />
        </Suspense>
    );
}