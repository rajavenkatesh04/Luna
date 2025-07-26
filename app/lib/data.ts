import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { unstable_noStore as noStore } from 'next/cache';
import { Invite, Event, User } from '@/app/lib/definitions';
import {collection, collectionGroup, getDocs, limit, orderBy, query, where} from "firebase/firestore";

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

// Helper function to get the user's full profile, including their organization
async function fetchUserAndOrg(userId: string): Promise<{ user: User, orgId: string } | null> {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) {
        console.error("No user document found for UID:", userId);
        return null;
    }
    const user = userDoc.data() as User;
    return { user, orgId: user.organizationId };
}


// Function to fetch the 5 most recent events
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

        const events = eventsSnapshot.docs.map(doc => {
            return { ...doc.data(), docId: doc.id } as Event;
        });

        return events;

    } catch (error) {
        console.error('Database Error fetching latest events:', error);
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
            return { ...userData, organizationName: 'Unknown Workspace' };
        }

        return {
            ...userData,
            organizationName: orgDoc.data().name,
        };

    } catch (error) {
        console.error('Database Error fetching user profile:', error);
        return null;
    }
}


export async function fetchUserEvents(userId: string): Promise<Event[]> {
    noStore();
    try {
        const profile = await fetchUserAndOrg(userId);
        if (!profile) return [];

        const { user, orgId } = profile;

        // Query 1: Get events owned by the user's primary organization
        const ownedEventsQuery = query(collection(db, `organizations/${orgId}/events`));

        // Query 2: Get events the user is collaborating on
        const collaboratingIds = user.collaboratingOn || [];
        let collaboratingEventsQuery = null;
        if (collaboratingIds.length > 0) {
            // This is a complex query that needs to find events across different organizations
            // For simplicity and performance, we'll fetch them individually for now.
            // A more advanced implementation might use a different data structure.
        }

        const [ownedEventsSnapshot] = await Promise.all([
            getDocs(ownedEventsQuery),
            // We will add the collaborating events fetch here later
        ]);

        const ownedEvents = ownedEventsSnapshot.docs.map(doc => ({ ...doc.data(), docId: doc.id } as Event));

        // In the future, we will merge ownedEvents and collaboratingEvents
        return ownedEvents;

    } catch (error) {
        console.error('Database Error fetching user events:', error);
        return [];
    }
}


// --- UPDATED FUNCTIONS ---

export async function fetchCardData(userId: string) {
    noStore();
    try {
        const events = await fetchUserEvents(userId);
        const totalEvents = events.length;

        // Correctly get admin IDs from the map
        const adminSets = events.map(event => Object.keys(event.admins));
        const totalAdmins = new Set(adminSets.flat()).size;

        return { totalEvents, totalAdmins };
    } catch (error) {
        console.error('Database Error fetching card data:', error);
        return { totalEvents: 0, totalAdmins: 0 };
    }
}

export async function fetchEventById(userId: string, eventId: string) {
    noStore();
    try {
        const profile = await fetchUserAndOrg(userId);
        if (!profile) return null;

        // This needs to be updated to check both owned and collaborating events
        // For now, we assume the event is in the user's primary org
        const eventRef = doc(db, `organizations/${profile.orgId}/events`, eventId);
        const eventDoc = await getDoc(eventRef);

        if (!eventDoc.exists()) return null;

        // Security check: is the user in the admin map?
        const eventData = eventDoc.data();
        if (!eventData.admins[userId]) {
            console.warn(`Permission denied: User ${userId} tried to access event ${eventId}`);
            return null;
        }

        return { ...eventData, docId: eventDoc.id } as Event;
    } catch (error) {
        console.error('Database Error fetching event by ID:', error);
        return null;
    }
}

export async function fetchEventAdmins(userId: string, eventId: string): Promise<User[]> {
    noStore();
    try {
        const event = await fetchEventById(userId, eventId);
        if (!event) return [];

        // Correctly get admin IDs from the map
        const adminIds = Object.keys(event.admins);
        if (adminIds.length === 0) return [];

        const adminPromises = adminIds.map(id => getDoc(doc(db, 'users', id)));
        const adminDocs = await Promise.all(adminPromises);

        return adminDocs
            .filter(doc => doc.exists())
            .map(doc => doc.data() as User);

    } catch (error) {
        console.error('Database Error fetching event admins:', error);
        return [];
    }
}



// --- PUBLIC DATA FETCHER ---
// This function is for the public /e/[id] page. It does not require authentication.
// It finds an event by its short, public ID across all organizations.
export async function fetchPublicEventByCode(eventCode: string) {
    noStore();
    try {
        // This is a powerful Firestore query that searches all 'events' sub-collections
        const eventsQuery = query(
            collectionGroup(db, 'events'),
            where('id', '==', eventCode),
            limit(1)
        );

        const snapshot = await getDocs(eventsQuery);

        if (snapshot.empty) {
            console.error(`No public event found with code: ${eventCode}`);
            return null;
        }

        const eventDoc = snapshot.docs[0];
        const eventData = { ...eventDoc.data(), docId: eventDoc.id } as Event;

        // We need the full path to the document for our real-time listener
        const eventPath = eventDoc.ref.path;

        return {
            eventData,
            eventPath // e.g., "organizations/ORG_ID/events/EVENT_ID"
        };

    } catch (error) {
        console.error('Database Error fetching public event:', error);
        return null;
    }
}


