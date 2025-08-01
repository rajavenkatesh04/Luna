// app/lib/data.ts

import { unstable_noStore as noStore } from 'next/cache';
import { User, Event } from '@/app/lib/definitions';
// Switch to using the ADMIN Firestore instance for all server-side data fetching
import { adminDb } from './firebase-server';

// Helper function to get the user's organization ID
async function getOrganizationId(userId: string): Promise<string | null> {
    const userDocRef = adminDb.collection('users').doc(userId);
    const userDoc = await userDocRef.get();
    if (!userDoc.exists) {
        console.error("No user document found for UID:", userId);
        return null;
    }
    return userDoc.data()!.organizationId;
}

// Function to fetch the data for the stat cards
export async function fetchCardData(userId: string) {
    noStore();
    try {
        const orgId = await getOrganizationId(userId);
        if (!orgId) return { totalEvents: 0, totalAdmins: 0 };

        // Use Admin SDK syntax
        const eventsSnapshot = await adminDb.collection(`organizations/${orgId}/events`).get();

        const totalEvents = eventsSnapshot.size;
        const adminSets = eventsSnapshot.docs.map(doc => new Set(doc.data().admins));
        const totalAdmins = new Set(adminSets.flatMap(s => Array.from(s))).size;

        return { totalEvents, totalAdmins };
    } catch (error) {
        console.error('Database Error fetching card data:', error);
        return { totalEvents: 0, totalAdmins: 0 };
    }
}

// Fetches the 5 most recent events a user is an admin of
export async function fetchLatestEvents(userId: string) {
    noStore();
    try {
        // Use Admin SDK syntax for collection group query
        const eventsSnapshot = await adminDb.collectionGroup('events')
            .where("admins", "array-contains", userId)
            .orderBy('createdAt', 'desc')
            .limit(5)
            .get();

        const events = eventsSnapshot.docs.map(doc => {
            return { ...doc.data(), docId: doc.id } as Event;
        });

        return events;
    } catch (error) {
        console.error('Database Error fetching latest events:', error);
        return [];
    }
}

// Fetches the complete user profile
export async function fetchUserProfile(userId: string) {
    noStore();
    try {
        const userDoc = await adminDb.collection('users').doc(userId).get();
        if (!userDoc.exists) return null;

        const userData = userDoc.data() as User;
        const orgDoc = await adminDb.collection('organizations').doc(userData.organizationId).get();

        if (!orgDoc.exists) {
            return { ...userData, organizationName: 'Unknown Workspace' };
        }

        return {
            ...userData,
            organizationName: orgDoc.data()!.name,
        };
    } catch (error) {
        console.error('Database Error fetching user profile:', error);
        return null;
    }
}

// Fetches a single event by its short ID
export async function fetchEventById(userId: string, eventId: string) {
    noStore();
    try {
        const eventSnapshot = await adminDb.collectionGroup('events').where('id', '==', eventId).limit(1).get();

        if (eventSnapshot.empty) return null;

        const eventDoc = eventSnapshot.docs[0];
        const eventData = eventDoc.data() as Event;

        if (!eventData.admins.includes(userId)) {
            console.error(`User ${userId} does not have permission for event ${eventId}.`);
            return null;
        }

        const organizationId = eventDoc.ref.parent.parent!.id;

        return { ...eventData, docId: eventDoc.id, organizationId: organizationId };
    } catch (error) {
        console.error('Database Error fetching event by ID:', error);
        return null;
    }
}

// Fetches multiple user profiles based on an array of UIDs
export async function fetchUsersByUid(uids: string[]): Promise<User[]> {
    noStore();
    if (!uids || uids.length === 0) return [];
    try {
        const userDocs = await adminDb.collection('users').where('uid', 'in', uids).get();
        return userDocs.docs.map(doc => doc.data() as User);
    } catch (error) {
        console.error('Database Error fetching users by UID:', error);
        return [];
    }
}

// Fetches the subscriber count for an event
export async function fetchSubscriberCount(userId: string, eventId: string) {
    noStore();
    try {
        const eventData = await fetchEventById(userId, eventId);
        if (!eventData || !eventData.organizationId) return 0;

        const subscribersPath = `organizations/${eventData.organizationId}/events/${eventData.docId}/subscribers`;
        const subscribersSnapshot = await adminDb.collection(subscribersPath).get();

        return subscribersSnapshot.size;
    } catch (error) {
        console.error('Database Error fetching subscriber count:', error);
        return 0;
    }
}

// Fetches pending invitations for the logged-in user
export async function fetchPendingInvites(userId: string) {
    noStore();
    try {
        const snapshot = await adminDb.collection('invitations')
            .where("inviteeUid", "==", userId)
            .where("status", "==", "pending")
            .get();

        return snapshot.docs.map(doc => doc.data());
    } catch (error) {
        console.error('Database Error fetching pending invites:', error);
        return [];
    }
}