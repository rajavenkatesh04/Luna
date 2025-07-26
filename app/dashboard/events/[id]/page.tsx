import { auth } from '@/app/lib/firebase-admin';
import { fetchEventById, fetchUserProfile, fetchEventAdmins } from '@/app/lib/data';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/app/ui/dashboard/events/breadcrumbs';
import Link from 'next/link';
import { EyeIcon, PencilIcon, QrCodeIcon } from '@heroicons/react/24/outline';
import AnnouncementsTab from '@/app/ui/dashboard/events/announcements-tab';
import AdminsTab from "@/app/ui/dashboard/events/admins-tab";
import { User } from '@/app/lib/definitions';
import clsx from 'clsx';

// This page now accepts searchParams to handle the active tab
export default async function Page({ params, searchParams }: { params: { id: string }, searchParams?: { tab?: string } }) {
    const { id: eventId } = params;
    const session = await auth.getSession();
    if (!session) notFound();

    const activeTab = searchParams?.tab || 'announcements';

    // Fetch all necessary data in parallel for maximum efficiency
    const [event, userProfile, admins] = await Promise.all([
        fetchEventById(session.uid, eventId),
        fetchUserProfile(session.uid),
        fetchEventAdmins(session.uid, eventId) // We need the full admin profiles
    ]);

    if (!event || !userProfile) {
        notFound();
    }

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
                    <div className="flex gap-2">
                        <Link href={`/e/${event.id}`} target="_blank" className="flex items-center gap-2 px-4 py-2 text-sm bg-white border rounded-md shadow-sm hover:bg-gray-50">
                            <EyeIcon className="w-4 h-4" />
                            View Public Page
                        </Link>
                        <button className="flex items-center gap-2 px-4 py-2 text-sm bg-white border rounded-md shadow-sm hover:bg-gray-50">
                            <QrCodeIcon className="w-4 h-4" />
                            Get QR Code
                        </button>
                        <Link href={`/dashboard/events/${event.docId}/edit`} className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700">
                            <PencilIcon className="w-4 h-4" />
                            Edit
                        </Link>
                    </div>
                </div>
                <p className="mt-2 text-gray-600">{event.description}</p>
            </div>

            {/* Tabbed Interface */}
            <div className="w-full">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <Link href={`/dashboard/events/${eventId}`} className={clsx("whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium", {
                            "border-blue-500 text-blue-600": activeTab === 'announcements',
                            "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700": activeTab !== 'announcements'
                        })}>
                            Announcements
                        </Link>
                        <Link href={`/dashboard/events/${eventId}?tab=admins`} className={clsx("whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium", {
                            "border-blue-500 text-blue-600": activeTab === 'admins',
                            "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700": activeTab !== 'admins'
                        })}>
                            Admins
                        </Link>
                    </nav>
                </div>

                {/* Tab Content Area */}
                <div className="py-6">
                    {activeTab === 'announcements' && <AnnouncementsTab eventId={event.docId} orgId={userProfile.organizationId} />}
                    {activeTab === 'admins' && <AdminsTab eventId={event.docId} admins={admins as User[]} />}
                </div>
            </div>
        </main>
    );
}
