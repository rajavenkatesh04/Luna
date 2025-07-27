import { auth } from '@/app/lib/firebase-admin';
import { fetchEventById, fetchUserProfile } from '@/app/lib/data';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/app/ui/dashboard/events/breadcrumbs';
import Link from 'next/link';
import { EyeIcon, PencilIcon, QrCodeIcon } from '@heroicons/react/24/outline';
import AnnouncementsTab from '@/app/ui/dashboard/events/announcements-tab';
import AdminsTab from '@/app/ui/dashboard/events/admins-tab';
import SettingsTab from '@/app/ui/dashboard/events/settings-tab';
import clsx from 'clsx';
import { fetchUsersByUid } from '@/app/lib/data';

// Update the function signature to accept searchParams
export default async function Page({
                                       params,
                                       searchParams
                                   }: {
    params: { id: string };
     searchParams?: { tab?: string };
}) {

    const eventId = params.id;
    const session = await auth.getSession();
    if (!session) {
        notFound();
    }

    const [event, userProfile] = await Promise.all([
        fetchEventById(session.uid, eventId),
        fetchUserProfile(session.uid)
    ]);

    if (!event || !userProfile) {
        notFound();
    }

    // Determine the active tab, defaulting to 'announcements'
    const activeTab =await searchParams?.tab || 'announcements';

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

            {/* Header Section */}

            <div className="mb-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <h1 className="text-3xl font-bold truncate">{event.title}</h1>
                    <p className="md:hidden mt-2 text-gray-600">{event.description}</p>
                    <div className="flex gap-2">
                        <Link href={`/e/${event.id}`} target="_blank" className="flex items-center gap-2 px-4 py-2 text-sm  border rounded-md shadow-sm hover:bg-gray-500">
                            <EyeIcon className="w-4 h-4" />
                            View Public Page
                        </Link>
                        <button className="flex items-center gap-2 px-4 py-2 text-sm border rounded-md shadow-sm hover:bg-gray-500">
                            <QrCodeIcon className="w-4 h-4" />
                            Get QR Code
                        </button>
                        <Link href={`/dashboard/events/${event.docId}/edit`} className="flex items-center gap-2 px-4 py-2 text-sm  border border-blue-500 rounded-md shadow-sm hover:bg-blue-700">
                            <PencilIcon className="w-4 h-4" />
                            Edit
                        </Link>
                    </div>
                </div>
                <p className="hidden md:block mt-2 text-gray-600">{event.description}</p>
            </div>

            {/* Tabbed Interface */}
            <div className="w-full">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        {/* Use Link component and conditional classes */}
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
                    {activeTab === 'admins' && <AdminsTab eventId={event.docId} />}
                    {activeTab === 'settings' && <SettingsTab eventId={event.docId} />}
                </div>
            </div>
        </main>
    );
}