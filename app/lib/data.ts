import {collection, getDocs, query, doc, getDoc, orderBy, limit, where} from 'firebase/firestore';
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

// Fetches a single event by its ID, ensuring the user has permission.
export async function fetchEventById(userId: string, eventId: string) {
    noStore();
    try {
        const orgId = await getOrganizationId(userId);
        if (!orgId) {
            console.error("User has no organization ID.");
            return null;
        }
        const eventRef = doc(db, `organizations/${orgId}/events`, eventId);
        const eventDoc = await getDoc(eventRef);
        if (!eventDoc.exists()) {
            console.error(`Event with ID ${eventId} not found.`);
            return null;
        }
        return { ...eventDoc.data(), docId: eventDoc.id } as Event;
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

