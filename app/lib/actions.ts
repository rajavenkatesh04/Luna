// app/lib/actions.ts
"use server";

import { z } from "zod";
import { nanoid } from 'nanoid';
import { signOut } from 'firebase/auth';
import { auth } from '@/app/lib/firebase'; // Client auth is ONLY for the signOut function
import { auth as adminAuth } from '@/app/lib/firebase-admin';
import admin from 'firebase-admin';
import { adminDb, adminMessaging } from "@/app/lib/firebase-server"; // USE THE ADMIN DB
import { Timestamp, FieldValue, DocumentSnapshot  } from 'firebase-admin/firestore'; // USE THE ADMIN SDK TOOLS
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

// NOTE: All database operations in this file now consistently use the Admin SDK (`adminDb`).

// =================================================================================
// --- AUTH ACTIONS ---
// =================================================================================

export async function logout() {
    try {
        // This signs the user out of the client-side authentication state.
        await signOut(auth);
        // This clears the server-side session cookie.
        const cookieStore = await cookies();
        cookieStore.set('session', '', { maxAge: -1 });
    } catch (error) {
        console.error('Logout Error:', error);
    }
    // Always redirect to login after attempting to log out
    redirect('/login');
}


// =================================================================================
// --- EVENT ACTIONS ---
// =================================================================================

export type CreateEventState = {
    errors?: {
        title?: string[];
        description?: string[];
    };
    message?: string | null;
};

const CreateEventSchema = z.object({
    title: z.string().min(3, { message: "Title must be at least 3 characters." }),
    description: z.string().optional(),
});

export async function createEvent(prevState: CreateEventState, formData: FormData): Promise<CreateEventState> {
    const session = await adminAuth.getSession();
    if (!session?.uid) {
        return { message: "Authentication error: Not logged in." };
    }

    const validatedFields = CreateEventSchema.safeParse({
        title: formData.get('title'),
        description: formData.get('description'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing or invalid fields.',
        };
    }

    const { title, description } = validatedFields.data;

    try {
        const userDoc = await adminDb.doc(`users/${session.uid}`).get();
        if (!userDoc.exists) {
            return { message: "Database error: User profile not found." };
        }

        const organizationId = userDoc.data()!.organizationId;
        const eventId = nanoid(6).toUpperCase();
        const eventRef = adminDb.doc(`organizations/${organizationId}/events/${eventId}`);

        await eventRef.set({
            id: eventId,
            title: title,
            description: description || '',
            ownerUid: session.uid,
            admins: [session.uid],
            createdAt: Timestamp.now(),
        });
    } catch (error) {
        console.error("Event Creation Error:", error);
        return { message: "Database error: Failed to create event." };
    }

    revalidatePath('/dashboard/events');
    redirect('/dashboard/events');
}


export type UpdateEventState = CreateEventState;
const UpdateEventSchema = z.object({
    id: z.string(),
    title: z.string().min(3, { message: "Title must be at least 3 characters." }),
    description: z.string().optional(),
});

export async function updateEvent(prevState: UpdateEventState, formData: FormData): Promise<UpdateEventState> {
    const session = await adminAuth.getSession();
    if (!session?.uid) return { message: "Authentication error." };

    const validatedFields = z.object({ id: z.string(), title: z.string().min(3), description: z.string().optional() }).safeParse(Object.fromEntries(formData));
    if (!validatedFields.success) return { errors: validatedFields.error.flatten().fieldErrors, message: 'Missing fields.' };
    const { id: eventId, title, description } = validatedFields.data;

    try {
        const eventDoc = await findEventAndVerifyAdmin(eventId, session.uid);
        await eventDoc.ref.update({ title, description: description || '' });
    } catch (error: unknown) {
        console.error("Event Update Error:", error);
        return { message: error instanceof Error ? error.message : "Database error." };
    }
    revalidatePath(`/dashboard/events/${eventId}`);
    redirect(`/dashboard/events/${eventId}`);
}



export type DeleteEventState = {
    // Change 'null' to 'undefined' to match useActionState
    message?: string;
    errors?: {
        server?: string[];
    };
};
export async function deleteEvent(prevState: DeleteEventState, formData: FormData): Promise<DeleteEventState> {
    const session = await adminAuth.getSession();
    if (!session?.uid) return { message: "Authentication error." };

    const eventId = formData.get('eventId')?.toString();
    if (!eventId) return { message: "Event ID is missing." };

    try {
        // Use the event's short ID to find it
        const eventDocSnapshot = await adminDb.collectionGroup('events').where('id', '==', eventId).limit(1).get();
        if (eventDocSnapshot.empty) throw new Error("Event not found.");
        const eventDoc = eventDocSnapshot.docs[0];
        const eventData = eventDoc.data()!;

        if (eventData.ownerUid !== session.uid) {
            return { message: "Permission denied. Only the event owner can delete this event." };
        }

        const eventPath = eventDoc.ref.path;
        await deleteCollection(`${eventPath}/subscribers`, 50);
        await deleteCollection(`${eventPath}/announcements`, 50);
        await adminDb.doc(eventPath).delete();
    } catch (error: unknown) {
        console.error('Event Deletion Error:', error);
        return { message: error instanceof Error ? error.message : 'An error occurred.' };
    }
    revalidatePath('/dashboard/events');
    redirect('/dashboard/events');
}


// =================================================================================
// --- ANNOUNCEMENT ACTIONS ---
// =================================================================================

export type CreateAnnouncementState = {
    errors?: { title?: string[]; content?: string[]; };
    message?: string | null;
};

const CreateAnnouncementSchema = z.object({
    title: z.string().min(1, { message: "Title is required." }),
    content: z.string().min(1, { message: "Content is required." }),
    eventId: z.string(),
    organizationId: z.string(),
    isPinned: z.preprocess((value) => value === 'on', z.boolean()),
});

export async function createAnnouncement(prevState: CreateAnnouncementState, formData: FormData): Promise<CreateAnnouncementState> {
    const session = await adminAuth.getSession();
    if (!session?.uid) return { message: "Authentication error." };

    // Updated Schema: No longer needs organizationId from the client
    const CreateAnnouncementSchema = z.object({
        title: z.string().min(1),
        content: z.string().min(1),
        eventId: z.string(), // This is the Firestore Document ID
        isPinned: z.preprocess((v) => v === 'on', z.boolean())
    });

    const validatedFields = CreateAnnouncementSchema.safeParse(Object.fromEntries(formData));
    if (!validatedFields.success) return { errors: validatedFields.error.flatten().fieldErrors, message: 'Missing fields.' };

    const { title: announcementTitle, content, eventId, isPinned } = validatedFields.data;

    try {
        // Step 1: Find the event and verify the user is an admin
        const eventDoc = await findEventAndVerifyAdmin(eventId, session.uid);
        const eventData = eventDoc.data()!;

        // Step 2: Create the new announcement document
        const announcementRef = eventDoc.ref.collection('announcements').doc();
        await announcementRef.set({
            id: announcementRef.id,
            authorName: session.name || 'Admin',
            authorId: session.uid,
            title: announcementTitle,
            content: content,
            isPinned: isPinned,
            createdAt: Timestamp.now(),
        });

        // Step 3: Construct and send the FCM notification
        const topic = `event_${eventData.id.replace(/-/g, '_')}`; // Use the short ID for the topic
        const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
        const messagePayload = {
            topic: topic,
            notification: {
                title: eventData.title || 'Event Update',
                body: announcementTitle
            },
            data: {
                url: `${baseUrl}/e/${eventData.id}` // Use the short ID for the public URL
            }
        };
        await adminMessaging.send(messagePayload);

    } catch (error: unknown) {
        console.error("Announcement Creation Error:", error);
        return { message: error instanceof Error ? error.message : "Database error." };
    }

    revalidatePath(`/dashboard/events/${eventId}?tab=announcements`);
    return { message: `Successfully created announcement.` };
}

export async function deleteAnnouncement(formData: FormData) {
    const session = await adminAuth.getSession();
    if (!session?.uid) throw new Error("Not authenticated.");

    // Updated Schema: No longer needs orgId from the client
    const { eventId, announcementId } = z.object({
        eventId: z.string(), // This is the Firestore Document ID
        announcementId: z.string()
    }).parse(Object.fromEntries(formData));

    try {
        // Step 1: Find the event and verify the user is an admin
        const eventDoc = await findEventAndVerifyAdmin(eventId, session.uid);

        // Step 2: Delete the specific announcement
        await eventDoc.ref.collection('announcements').doc(announcementId).delete();

        revalidatePath(`/dashboard/events/${eventId}`);
    } catch (error) {
        console.error("Delete Announcement Error:", error);
        // In a real app, you might want to return an error to the UI
    }
}


// =================================================================================
// --- INVITATION ACTIONS ---
// =================================================================================

export type SendInviteState = { message: string | null; };

export async function sendInvite(prevState: SendInviteState, formData: FormData): Promise<SendInviteState> {
    const session = await adminAuth.getSession();
    if (!session) return { message: 'Not authenticated.' };

    const validatedFields = z.object({ eventId: z.string(), orgId: z.string(), inviteeEmail: z.string().email() }).safeParse(Object.fromEntries(formData));
    if (!validatedFields.success) return { message: 'Invalid fields.' };
    const { eventId, orgId, inviteeEmail } = validatedFields.data;

    try {
        const eventRef = adminDb.doc(`organizations/${orgId}/events/${eventId}`);
        const eventSnap = await eventRef.get();
        if (!eventSnap.exists) throw new Error("Event not found.");

        // SECURITY CHECK: User must be an admin of the event to send invites.
        if (!eventSnap.data()!.admins.includes(session.uid)) {
            return { message: "Permission denied." };
        }

        const usersRef = adminDb.collection('users');
        const userQuery = usersRef.where("email", "==", inviteeEmail).limit(1);
        const userSnapshot = await userQuery.get();
        if (userSnapshot.empty) return { message: `No user with email: ${inviteeEmail}` };

        const inviteeUser = userSnapshot.docs[0].data();
        if (eventSnap.data()?.admins.includes(inviteeUser.uid)) {
            return { message: 'This user is already an admin for this event.' };
        }

        const invitesRef = adminDb.collection('invitations');
        const invitesQuery = invitesRef.where("inviteeUid", "==", inviteeUser.uid).where("eventId", "==", eventId).where("status", "==", "pending").limit(1);
        const existingInviteSnap = await invitesQuery.get();
        if (!existingInviteSnap.empty) {
            return { message: 'An invitation for this user is already pending.' };
        }

        const invitationRef = invitesRef.doc();
        await invitationRef.set({
            id: invitationRef.id, inviterUid: session.uid, inviteeEmail, inviteeUid: inviteeUser.uid, organizationId: orgId, eventId, eventTitle: eventSnap.data()?.title || 'an event', status: 'pending', createdAt: Timestamp.now(),
        });
        revalidatePath(`/dashboard/events/${eventId}`);
        return { message: `Invite sent successfully to ${inviteeEmail}.` };
    } catch (error) {
        console.error("Send Invite Error:", error);
        return { message: 'Failed to send invite.' };
    }
}


export async function acceptInvite(formData: FormData) {
    const session = await adminAuth.getSession();
    if (!session) throw new Error("Not authenticated.");

    const invitationId = formData.get('invitationId')?.toString();
    if (!invitationId) throw new Error("Missing ID.");

    const invitationRef = adminDb.doc(`invitations/${invitationId}`);
    const inviteDoc = await invitationRef.get();
    if (!inviteDoc.exists || inviteDoc.data()?.inviteeUid !== session.uid) {
        throw new Error("Invitation not found or invalid.");
    }

    const { organizationId, eventId } = inviteDoc.data()!;
    const eventRef = adminDb.doc(`organizations/${organizationId}/events/${eventId}`);

    const batch = adminDb.batch();
    batch.update(eventRef, { admins: FieldValue.arrayUnion(session.uid) });
    batch.update(invitationRef, { status: 'accepted' });
    await batch.commit();

    revalidatePath('/dashboard/events');
    redirect('/dashboard/events');
}

export async function rejectInvite(formData: FormData) {
    const session = await adminAuth.getSession();
    if (!session) throw new Error("Not authenticated.");

    const invitationId = formData.get('invitationId')?.toString();
    if (!invitationId) throw new Error("Missing ID.");

    const invitationRef = adminDb.doc(`invitations/${invitationId}`);
    const inviteDoc = await invitationRef.get();
    if (!inviteDoc.exists || inviteDoc.data()?.inviteeUid !== session.uid) {
        throw new Error("Invitation not found or invalid.");
    }

    await invitationRef.update({ status: 'rejected' });

    revalidatePath('/dashboard/invitations');
}

export async function removeAdmin(formData: FormData) {
    const session = await adminAuth.getSession();
    if (!session) throw new Error("Not authenticated.");

    const orgId = formData.get('orgId')?.toString();
    const eventId = formData.get('eventId')?.toString();
    const adminUidToRemove = formData.get('adminUidToRemove')?.toString();

    if (!orgId || !eventId || !adminUidToRemove) {
        throw new Error("Missing required fields.");
    }

    try {
        const eventRef = adminDb.doc(`organizations/${orgId}/events/${eventId}`);
        const eventSnap = await eventRef.get();

        if (!eventSnap.exists) throw new Error("Event not found.");

        const eventData = eventSnap.data()!;

        // SECURITY CHECK: Only the owner of the event can remove an admin.
        if (eventData.ownerUid !== session.uid) {
            throw new Error("Only the event owner can remove admins.");
        }

        // SECURITY CHECK: The owner cannot be removed.
        if (eventData.ownerUid === adminUidToRemove) {
            throw new Error("The event owner cannot be removed.");
        }

        // Perform the update
        await eventRef.update({
            admins: FieldValue.arrayRemove(adminUidToRemove)
        });

        revalidatePath(`/dashboard/events/${eventId}?tab=admins`);

    } catch (error) {
        console.error("Remove Admin Error:", error);
        // You can return an error message to the client if you use useActionState
    }
}


// =================================================================================
// --- NOTIFICATION ACTIONS ---
// =================================================================================

export async function subscribeToTopic(token: string, eventId: string) {
    if (!token || !eventId) throw new Error('Missing FCM token or eventId');

    const topic = `event_${eventId.replace(/-/g, '_')}`;
    try {
        await adminMessaging.subscribeToTopic(token, topic);

        // Note: This lookup can be slow on a very large number of organizations.
        // It can be optimized later if needed.
        const orgsQuery = adminDb.collection('organizations');
        const orgsSnapshot = await orgsQuery.get();
        let eventPath = '';
        for (const orgDoc of orgsSnapshot.docs) {
            const potentialEventRef = adminDb.doc(`organizations/${orgDoc.id}/events/${eventId}`);
            const eventSnap = await potentialEventRef.get();
            if (eventSnap.exists) {
                eventPath = potentialEventRef.path;
                break;
            }
        }

        if (eventPath) {
            await adminDb.doc(`${eventPath}/subscribers/${token}`).set({ subscribedAt: Timestamp.now() });
        }

        return { success: true };
    } catch (error) {
        console.error('Error subscribing to topic:', error);
        return { success: false, error: 'Could not subscribe to topic.' };
    }
}


// =================================================================================
// --- HELPER FUNCTIONS ---
// =================================================================================

async function deleteCollection(collectionPath: string, batchSize: number) {
    const collectionRef = adminDb.collection(collectionPath);
    const query = collectionRef.orderBy('__name__').limit(batchSize);

    return new Promise((resolve, reject) => {
        deleteQueryBatch(query, resolve).catch(reject);
    });
}

async function deleteQueryBatch(query: FirebaseFirestore.Query, resolve: (value: unknown) => void) {
    const snapshot = await query.get();

    if (snapshot.size === 0) {
        resolve(0);
        return;
    }

    const batch = adminDb.batch();
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });
    await batch.commit();

    // Recurse on the same query to process next batch.
    process.nextTick(() => {
        deleteQueryBatch(query, resolve);
    });
}


/**
 * Finds an event by its short ID across all organizations and verifies
 * if the current user is an admin for that event.
 * @returns The event's DocumentSnapshot if found and authorized.
 * @throws An error if the event is not found or the user is not an admin.
 */
async function findEventAndVerifyAdmin(eventId: string, userId: string): Promise<DocumentSnapshot> {
    // FIX: Query by the 'id' field inside the document, not the document's path ID.
    const eventsQuery = adminDb.collectionGroup('events').where('id', '==', eventId).limit(1);
    const eventSnapshot = await eventsQuery.get();

    if (eventSnapshot.empty) {
        throw new Error("Event not found.");
    }

    const eventDoc = eventSnapshot.docs[0];
    const eventData = eventDoc.data();

    if (!eventData.admins.includes(userId)) {
        throw new Error("Permission denied: You are not an admin for this event.");
    }

    return eventDoc;
}