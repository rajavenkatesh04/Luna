import { auth } from '@/app/lib/firebase-admin';
import { fetchEventById, fetchUserProfile, fetchUsersByUid, fetchSubscriberCount  } from '@/app/lib/data';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/app/ui/dashboard/events/breadcrumbs';
import Link from 'next/link';
import { EyeIcon, PencilIcon, UsersIcon  } from '@heroicons/react/24/outline';
import AnnouncementsTab from '@/app/ui/dashboard/events/announcements-tab';
import AdminsTab from '@/app/ui/dashboard/events/admins-tab';
import SettingsTab from '@/app/ui/dashboard/events/settings-tab';
import clsx from 'clsx';
import QrCodeDisplay from "@/app/ui/dashboard/events/qr-code-display";


type PageProps = {
    params: Promise<{ id: string }>;
    searchParams?: Promise<{ tab?: string }>;
};

export default async function Page({ params, searchParams }: PageProps) {

    // Await the props to get their resolved values
    const { id: eventId } = await params;
    const resolvedSearchParams = await searchParams;

    const session = await auth.getSession();
    if (!session) {
        notFound();
    }

    // Fetch primary data
    const [event, userProfile, subscriberCount] = await Promise.all([
        fetchEventById(session.uid, eventId),
        fetchUserProfile(session.uid),
        fetchSubscriberCount(session.uid, eventId)
    ]);


    if (!event || !userProfile) {
        notFound();
    }

    // Determine the active tab from the resolved searchParams
    const activeTab = resolvedSearchParams?.tab || 'announcements';

    // Fetch the full profiles for the admins of this event
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

            {/* Header Section start */}
            <div className="mb-8">
                {/* 1. Main container: Adjusted alignment for medium screens */}
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">

                    {/* Left side: Title and mobile description */}
                    <div className="flex-1">
                        <h1 className="text-3xl truncate">{event.title}</h1>
                        <p className="md:hidden mt-1 text-gray-500">{event.description}</p>
                    </div>

                    {/* Right side: Button group */}
                    {/* 2. Button container: Added 'flex-wrap' to allow buttons to wrap on small screens */}
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-2 p-2 border rounded-md text-sm">
                            <UsersIcon className="h-5 w-5 text-gray-400" />
                            <span className="font-medium text-blue-500">{subscriberCount}</span>
                            <span className="text-gray-400">Subscribers</span>
                        </div>
                        <Link href={`/e/${event.id}`} target="_blank" className="flex items-center gap-2 px-4 py-2 text-sm  border rounded-md shadow-sm hover:bg-gray-500">
                            <EyeIcon className="h-4 w-4" />
                            View Public Page
                        </Link>
                        <QrCodeDisplay eventId={event.id} />
                        <Link href={`/dashboard/events/${event.docId}/edit`} className="flex items-center gap-2 px-4 py-2 text-sm  border border-blue-500 rounded-md shadow-sm hover:bg-blue-700">
                            <PencilIcon className="h-4 w-4" />
                            Edit
                        </Link>
                    </div>
                </div>

                {/* Desktop description */}
                <p className="hidden md:block mt-2 text-gray-600">{event.description}</p>
            </div>
            {/* End of Header Section */}

            {/* Tabbed Interface */}
            <div className="w-full">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <Link
                            href={`/dashboard/events/${event.docId}?tab=announcements`}
                            className={clsx(
                                "whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium",
                                {
                                    'border-blue-500 text-blue-600': activeTab === 'announcements',
                                    'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700': activeTab !== 'announcements'
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
                                    'border-blue-500 text-blue-600': activeTab === 'admins',
                                    'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700': activeTab !== 'admins'
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
                                    'border-blue-500 text-blue-600': activeTab === 'settings',
                                    'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700': activeTab !== 'settings'
                                }
                            )}
                        >
                            Settings
                        </Link>
                    </nav>
                </div>

                {/* Conditionally render Tab Content */}
                <div className="py-6">
                    {activeTab === 'announcements' && <AnnouncementsTab eventId={event.docId} orgId={userProfile.organizationId} />}
                    {activeTab === 'admins' && <AdminsTab eventId={event.docId} admins={adminUsers} orgId={userProfile.organizationId} ownerUid={event.ownerUid} />}
                    {activeTab === 'settings' && <SettingsTab eventId={event.docId} />}
                </div>
            </div>
        </main>
    );
}
