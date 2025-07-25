import { auth } from '@/app/lib/firebase-admin';
import { fetchEventById } from '@/app/lib/data';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/app/ui/dashboard/events/breadcrumbs';
import EditEventForm from '@/app/ui/dashboard/events/edit-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Edit Event',
};

export default async function Page({ params }: { params: { id: string } }) {
    const session = await auth.getSession();
    if (!session) {
        notFound();
    }

    const eventId = params.id;
    const event = await fetchEventById(session.uid, eventId);

    if (!event) {
        notFound();
    }

    const eventData = await fetchEventById(session.uid, eventId);

    if (!eventData) {
        notFound();
    }

    const plainEvent = {
        ...eventData,
        createdAt: new Date(eventData.createdAt.seconds * 1000).toISOString(),
    };

    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                    { label: 'Events', href: '/dashboard/events' },
                    {
                        label: event.title,
                        href: `/dashboard/events/${event.docId}`,
                    },
                    {
                        label: 'Edit',
                        href: `/dashboard/events/${event.docId}/edit`,
                        active: true,
                    },
                ]}
            />
            <EditEventForm event={plainEvent} />
        </main>
    );
}
