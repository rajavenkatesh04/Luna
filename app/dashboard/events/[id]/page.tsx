// app/dashboard/events/[id]/page.tsx
import { auth } from '@/app/lib/firebase-admin';
import { fetchEventById, fetchUserProfile } from '@/app/lib/data';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/app/ui/dashboard/events/breadcrumbs';
import Link from 'next/link';
import { EyeIcon, PencilIcon, QrCodeIcon } from '@heroicons/react/24/outline';
import AnnouncementsTab from '@/app/ui/dashboard/events/announcements-tab';

export default async function Page({ params }: { params: { id: string } }) {

    // Destructuring the id from params resolves the dynamic access warning.
    const { id: eventId } = params;

    const session = await auth.getSession();
    if (!session) {
        notFound();
    }

    // We fetch both the event and user profile data at the same time for efficiency.
    const [event, userProfile] = await Promise.all([
        fetchEventById(session.uid, eventId),
        fetchUserProfile(session.uid)
    ]);

    if (!event || !userProfile) {
        notFound();
    }

    return (
        <main>
            {/* Dynamic Breadcrumbs now use the fetched event title */}
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
                        <a href="#" className="border-blue-500 text-blue-600 whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium">
                            Announcements
                        </a>
                        <a href="#" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium">
                            Admins
                        </a>
                        <a href="#" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium">
                            Settings
                        </a>
                    </nav>
                </div>

                {/* Tab Content Area */}
                <div className="py-6">
                    <AnnouncementsTab eventId={event.docId} orgId={userProfile.organizationId} />
                </div>
            </div>
        </main>
    );
}
