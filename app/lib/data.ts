import {collection, getDocs, query, doc, getDoc, orderBy, limit, where, collectionGroup} from 'firebase/firestore';
import { db } from './firebase';
import { unstable_noStore as noStore } from 'next/cache';
import { User, Event } from '@/app/lib/definitions'

// Helper function to get the user's organization ID
async function getOrganizationId(userId: string): Promise<string | null> {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) {
        console.error("No user document found for UID:", userId);
        return null;
    }
    return userDoc.data().organizationId;
}

// Function to fetch the data for the stat cards
export async function fetchCardData(userId: string) {
    noStore();
    try {
        const orgId = await getOrganizationId(userId);
        if (!orgId) return { totalEvents: 0, totalAdmins: 0 };
        const eventsRef = collection(db, `organizations/${orgId}/events`);
        const eventsSnapshot = await getDocs(eventsRef);
        const totalEvents = eventsSnapshot.size;
        const adminSets = eventsSnapshot.docs.map(doc => new Set(doc.data().admins));
        const totalAdmins = new Set(adminSets.flatMap(s => Array.from(s))).size;
        return { totalEvents, totalAdmins };
    } catch (error) {
        console.error('Database Error fetching card data:', error);
        return { totalEvents: 0, totalAdmins: 0 };
    }
}

// Fetches the 5 most recent events a user is an admin of, across ALL organizations.
export async function fetchLatestEvents(userId: string) {
    noStore(); // Recommended for dynamic data in Next.js

    try {
        // 1. Create a reference to the 'events' collection group.
        // This tells Firestore to search in every subcollection named 'events'.
        const eventsRef = collectionGroup(db, 'events');

        // 2. Build the query.
        const eventsQuery = query(
            eventsRef,
            // Find all documents where the 'admins' array contains the user's ID.
            where("admins", "array-contains", userId),
            // Order the results by creation date, newest first.
            orderBy('createdAt', 'desc'),
            // Limit to the 5 most recent events.
            limit(5)
        );

        // 3. Execute the query.
        const eventsSnapshot = await getDocs(eventsQuery);

        // 4. Map the results to an array of event objects.
        const events = eventsSnapshot.docs.map(doc => {
            return { ...doc.data(), docId: doc.id } as Event;
        });

        return events;

    } catch (error) {
        console.error('Database Error fetching latest events:', error);
        // Return an empty array on error to prevent the page from crashing.
        return [];
    }
}
// Fetches the complete user profile, including organization name and role
export async function fetchUserProfile(userId: string) {
    noStore();
    try {
        const userDocRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
            console.error("No user document found for UID:", userId);
            return null;
        }
        const userData = userDoc.data() as User;
        const orgId = userData.organizationId;
        const orgDocRef = doc(db, 'organizations', orgId);
        const orgDoc = await getDoc(orgDocRef);
        if (!orgDoc.exists()) {
            console.error("No organization document found for ID:", orgId);
// Return user data even if org is missing, with a default name
            return { ...userData, organizationName: 'Unknown Workspace' };
        }
// Combine user data with the organization's name
        return {
            ...userData,
            organizationName: orgDoc.data().name,
        };
    } catch (error) {
        console.error('Database Error fetching user profile:', error);
        return null;
    }
}

export async function fetchEventById(userId: string, eventId: string) {
    noStore();
    try {
        const eventsRef = collectionGroup(db, 'events');
        const q = query(eventsRef, where('id', '==', eventId), limit(1));
        const eventSnapshot = await getDocs(q);

        if (eventSnapshot.empty) {
            console.error(`Event with ID ${eventId} not found in any organization.`);
            return null;
        }

        const eventDoc = eventSnapshot.docs[0];
        const eventData = eventDoc.data() as Event;

        // Get the parent organization ID from the document's path.
        // eventDoc.ref.parent is the 'events' collection.
        // eventDoc.ref.parent.parent is the organization document.
        const organizationId = eventDoc.ref.parent.parent?.id;

        if (!organizationId) {
            console.error(`Could not determine organizationId for event ${eventId}.`);
            return null;
        }

        if (!eventData.admins.includes(userId)) {
            console.error(`User ${userId} does not have permission for event ${eventId}.`);
            return null;
        }

        // Now, we return the organizationId along with the event data!
        return { ...eventData, docId: eventDoc.id, organizationId: organizationId };

    } catch (error) {
        console.error('Database Error fetching event by ID:', error);
        return null;
    }
}

// Fetches multiple user profiles based on an array of UIDs
export async function fetchUsersByUid(uids: string[]): Promise<User[]> {
    noStore();
    if (!uids || uids.length === 0) {
        return [];
    }
    try {
// Firestore 'in' queries are limited to 30 items.
// For more, you'd need to batch the requests.
        const usersQuery = query(collection(db, 'users'), where('uid', 'in', uids));
        const userDocs = await getDocs(usersQuery);
        return userDocs.docs.map(doc => doc.data() as User);
    } catch (error) {
        console.error('Database Error fetching users by UID:', error);
        return [];
    }
}


// Subscriber count
// Function to get the number of notification subscribers for an event
export async function fetchSubscriberCount(userId: string, eventId: string) {
    noStore(); // Prevents caching of this value
    try {
        const orgId = await getOrganizationId(userId);
        if (!orgId) return 0;

        const subscribersPath = `organizations/${orgId}/events/${eventId}/subscribers`;
        const subscribersSnapshot = await getDocs(collection(db, subscribersPath));

        return subscribersSnapshot.size;
    } catch (error) {
        console.error('Database Error fetching subscriber count:', error);
        return 0; // Return 0 in case of an error
    }
}


// Fetches pending invitations for the logged-in user.
export async function fetchPendingInvites(userId: string) {
    noStore();
    const invitesRef = collection(db, 'invitations');
    const q = query(invitesRef, where("inviteeUid", "==", userId), where("status", "==", "pending"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
}
