import { fetchAllUsers } from '@/app/lib/data';
import MasterDashboardClient from '@/app/ui/dashboard/master-dashboard-client';

// This is a React Server Component by default in the App Router.
// Note that it is an 'async' function.
export default async function MasterDashboardPage() {

    // 1. Fetch the initial data directly on the server.
    // This happens before any HTML is sent to the browser.
    const initialUsers = await fetchAllUsers();

    // 2. Render the Client Component and pass the fetched data as a prop.
    return <MasterDashboardClient initialUsers={initialUsers} />;
}