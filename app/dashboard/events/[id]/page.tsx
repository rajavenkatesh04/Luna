import { Suspense } from 'react';
import { auth } from '@/app/lib/firebase-admin';
import { fetchEventById, fetchUserProfile, fetchUsersByUid, fetchSubscriberCount, fetchEventInvitations } from '@/app/lib/data';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/app/ui/dashboard/events/breadcrumbs';
import Link from 'next/link';
import { EyeIcon, UsersIcon } from '@heroicons/react/24/outline';
import AnnouncementsTab from '@/app/ui/dashboard/events/announcements-tab';
import AdminsTab from '@/app/ui/dashboard/events/admins-tab';
import SettingsTab from '@/app/ui/dashboard/events/settings-tab';
import clsx from 'clsx';
import QrCodeDisplay from "@/app/ui/dashboard/events/qr-code-display";
import { EventDetailsPageSkeleton, AnnouncementsTabSkeleton, AdminsTabSkeleton } from '@/app/ui/skeletons';
import { Event } from '@/app/lib/definitions';

type PageProps = {
    params: Promise<{ id: string }>;
    searchParams?: Promise<{ tab?: string }>;
};

function StatusBadge({ status }: { status: Event['status'] }) {
    const statusConfig = {
        scheduled: { text: 'Scheduled', style: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' },
        live: { text: 'Live', style: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 animate-pulse' },
        paused: { text: 'Paused', style: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' },
        ended: { text: 'Ended', style: 'bg-gray-200 text-gray-800 dark:bg-zinc-800 dark:text-zinc-400' },
        cancelled: { text: 'Cancelled', style: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' },
    };
    const { text, style } = statusConfig[status] || statusConfig.scheduled;

    return (
        <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${style}`}>
            {status === 'live' && <div className="h-2 w-2 rounded-full bg-green-500"></div>}
            <span>{text}</span>
        </div>
    );
}

async function EventDetails({ params, searchParams }: PageProps) {
    const resolvedParams = await params;
    const { id: eventId } = resolvedParams;

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

    const starts = new Date(event.startsAt.seconds * 1000).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
    const ends = new Date(event.endsAt.seconds * 1000).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });

    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                    { label: 'Events', href: '/dashboard/events' },
                    {
                        label: event.title,
                        href: `/dashboard/events/${event.id}`, // Use short ID for navigation
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
                            Preview
                        </Link>
                        <QrCodeDisplay eventId={event.id} />

                    </div>
                </div>
                <p className="hidden md:block mt-2 text-gray-600 dark:text-zinc-400">{event.description}</p>
            </div>

            {/* Redesigned Event Info Bar */}
            <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-lg border border-gray-200 bg-gray-50/50 p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900/50">
                <StatusBadge status={event.status} />
                <div className="flex items-center gap-2 text-gray-600 dark:text-zinc-300">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-gray-400 dark:text-zinc-500">
                        <path fillRule="evenodd" d="m9.69 18.933.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 0 0 .281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 1 0 3 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 0 0 2.273 1.765 11.842 11.842 0 0 0 .757.433.57.57 0 0 0 .281.14l.018.008.006.003ZM10 11.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z" clipRule="evenodd" />
                    </svg>
                    <span>{event.locationText}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-zinc-300">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-gray-400 dark:text-zinc-500">
                        <path fillRule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5h10.5a.75.75 0 0 0 0-1.5H4.75a.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
                    </svg>
                    <span>{starts} &mdash; {ends}</span>
                </div>
            </div>

            <div className="w-full">
                <div className="border-b border-gray-200 dark:border-zinc-800">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <Link
                            href={`/dashboard/events/${event.id}?tab=announcements`}
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
                            href={`/dashboard/events/${event.id}?tab=admins`}
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
                            href={`/dashboard/events/${event.id}?tab=settings`}
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
                    {activeTab === 'announcements' && (
                        <Suspense fallback={<AnnouncementsTabSkeleton />}>
                            <AnnouncementsTab eventId={event.docId} orgId={event.organizationId} />
                        </Suspense>
                    )}
                    {activeTab === 'admins' && (
                        <Suspense fallback={<AdminsTabSkeleton />}>
                            {(async () => {
                                const sentInvites = await fetchEventInvitations(event.docId);
                                return (
                                    <AdminsTab
                                        eventDocId={event.docId}
                                        eventShortId={event.id}
                                        admins={adminUsers}
                                        orgId={userProfile.organizationId}
                                        ownerUid={event.ownerUid}
                                        currentUserId={session.uid}
                                        sentInvites={sentInvites}
                                    />
                                );
                            })()}
                        </Suspense>
                    )}
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