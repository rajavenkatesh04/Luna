import CreateEventForm from "@/app/ui/dashboard/events/create-from";
import Breadcrumbs from '@/app/ui/dashboard/events/breadcrumbs';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Create Event',
};

export default async function Page() {
    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                    { label: 'Events', href: '/dashboard/events' },
                    {
                        label: 'Create Event',
                        href: '/dashboard/events/create',
                        active: true,
                    },
                ]}
            />
            <CreateEventForm />
        </main>
    );
}
