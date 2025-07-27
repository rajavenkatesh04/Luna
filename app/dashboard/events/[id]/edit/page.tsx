import { auth } from '@/app/lib/firebase-admin';
import { fetchEventById } from '@/app/lib/data';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/app/ui/dashboard/events/breadcrumbs';
import EditEventForm from '@/app/ui/dashboard/events/edit-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Edit Event',
};

// The 'params' prop is now a Promise, so we need to await it.
export default async function Page({ params }: { params: Promise<{ id: string }> }) {

    // Await the params Promise to get the resolved value
    const { id: eventId } = await params;

    const session = await auth.getSession();
    if (!session) {
        notFound();
    }

    // Fetch the event data just once using the resolved eventId
    const event = await fetchEventById(session.uid, eventId);

    if (!event) {
        notFound();
    }

    // Convert the Firestore Timestamp to a string so it can be passed to a Client Component
    const plainEvent = {
        ...event,
        // Ensure createdAt is a string. If it's already a string, this won't break it.
        // If it's a Firestore Timestamp object, it will be converted.
        createdAt: typeof event.createdAt === 'string'
            ? event.createdAt
            : new Date(event.createdAt.seconds * 1000).toISOString(),
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
