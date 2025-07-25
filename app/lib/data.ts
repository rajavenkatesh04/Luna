import { collection, getDocs, query, doc, getDoc, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase';
import { unstable_noStore as noStore } from 'next/cache';

// Helper function to get the user's organization ID from their user document
async function getOrganizationId(userId: string): Promise<string | null> {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) {
        console.error("No user document found for UID:", userId);
        return null;
    }
    return userDoc.data().organizationId;
}

// Fetches the data for the stat cards on the dashboard overview
export async function fetchCardData(userId: string) {
    noStore(); // Opts out of caching for this dynamic data
    try {
        const orgId = await getOrganizationId(userId);
        if (!orgId) return { totalEvents: 0, totalAdmins: 0 };

        const eventsRef = collection(db, `organizations/${orgId}/events`);
        const eventsSnapshot = await getDocs(eventsRef);
        const totalEvents = eventsSnapshot.size;

        // Efficiently calculate total unique admins across all events
        const adminSets = eventsSnapshot.docs.map(doc => new Set(doc.data().admins));
        const totalAdmins = new Set(adminSets.flatMap(s => Array.from(s))).size;

        return { totalEvents, totalAdmins };
    } catch (error) {
        console.error('Database Error fetching card data:', error);
        return { totalEvents: 0, totalAdmins: 0 };
    }
}

// Fetches the 5 most recently created events
export async function fetchLatestEvents(userId: string) {
    noStore();
    try {
        const orgId = await getOrganizationId(userId);
        if (!orgId) return [];

        const eventsQuery = query(
            collection(db, `organizations/${orgId}/events`),
            orderBy('createdAt', 'desc'),
            limit(5)
        );

        const eventsSnapshot = await getDocs(eventsQuery);
        return eventsSnapshot.docs.map(doc => ({ ...doc.data(), docId: doc.id }));
    } catch (error) {
        console.error('Database Error fetching latest events:', error);
        return [];
    }
}
