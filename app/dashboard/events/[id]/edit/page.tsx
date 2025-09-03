import { auth } from '@/app/lib/firebase-admin';
import { fetchEventById } from '@/app/lib/data';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/app/ui/dashboard/events/breadcrumbs';
import EditEventForm from '@/app/ui/dashboard/events/edit-form';
import { Metadata } from 'next';
import { Event } from '@/app/lib/definitions';

export const metadata: Metadata = {
    title: 'Edit Event',
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id: eventId } = await params;

    const session = await auth.getSession();
    if (!session) {
        notFound();
    }

    const event = await fetchEventById(session.uid, eventId);

    if (!event) {
        notFound();
    }

    // The `event` object returned from `fetchEventById` is already perfectly
    // serialized and has the correct shape for our Client Component.
    // We can pass it directly.

    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                    { label: 'Events', href: '/dashboard/events' },
                    {
                        label: event.title,
                        href: `/dashboard/events/${event.id}`,
                    },
                    {
                        label: 'Edit',
                        href: `/dashboard/events/${event.id}/edit`,
                        active: true,
                    },
                ]}
            />
            {/* Pass the event object directly to the form */}
            <EditEventForm event={event as Event} />
        </main>
    );
}