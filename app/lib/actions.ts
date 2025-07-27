// app/lib/actions.ts
"use server"

import { z } from "zod";
import { nanoid } from 'nanoid';
import { signOut } from 'firebase/auth';
import { auth, db } from '@/app/lib/firebase';
import { auth as adminAuth } from '@/app/lib/firebase-admin';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, Timestamp, getDocs, writeBatch, query, limit } from 'firebase/firestore';
import { type AdminPermission, type Event } from '@/app/lib/definitions';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

/**
 * Handles the complete user logout process.
 */
export async function logout() {
    try {
        await signOut(auth);

        const cookieStore = await cookies();
        cookieStore.set('session', '', { maxAge: -1 });

    } catch (error) {
        console.error('Logout Error:', error);
    }

    // Always redirect to login after attempting to log out
    redirect('/login');
}



// --- EVENT CREATION ---
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
    const userId = session.uid;

    try {
        const userDocRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
            return { message: "Database error: User profile not found." };
        }
        const organizationId = userDoc.data().organizationId;

        const eventId = nanoid(6).toUpperCase();
        const eventRef = doc(db, `organizations/${organizationId}/events`, eventId);


        const ownerAsAdmin: AdminPermission = {
            uid: userId,
            permissions: {
                canEditEvent: true,
                canDeleteEvent: true,
                canManageAdmins: true,
                canSendAnnouncements: true
            }
        };

        await setDoc(eventRef, {
            id: eventId,
            title: title,
            description: description || '',
            ownerUid: userId,
            admins: [ownerAsAdmin], // Use the new object
            createdAt: Timestamp.now(),
        });

    } catch (error) {
        console.error("Event Creation Error:", error);
        return { message: "Database error: Failed to create event." };
    }

    revalidatePath('/dashboard/events');
    redirect('/dashboard/events');
}



// --- ANNOUNCEMENT CREATION ---
export type CreateAnnouncementState = {
    errors?: {
        title?: string[];
        content?: string[];
    };
    message?: string | null;
};

const CreateAnnouncementSchema = z.object({
    title: z.string().min(1, { message: "Title is required." }),
    content: z.string().min(1, { message: "Content is required." }),
    eventId: z.string(), // Hidden input to know which event this belongs to
});

export async function createAnnouncement(prevState: CreateAnnouncementState, formData: FormData): Promise<CreateAnnouncementState> {
    const session = await adminAuth.getSession();
    if (!session?.uid) {
        return { message: "Authentication error: Not logged in." };
    }

    const validatedFields = CreateAnnouncementSchema.safeParse({
        title: formData.get('title'),
        content: formData.get('content'),
        eventId: formData.get('eventId'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing or invalid fields.',
        };
    }

    const { title, content, eventId } = validatedFields.data;
    const user = session;

    try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
            return { message: "Database error: User profile not found." };
        }
        const organizationId = userDoc.data().organizationId;

        // Create a new announcement in the sub-collection of the event
        const announcementRef = doc(collection(db, `organizations/${organizationId}/events/${eventId}/announcements`));

        await setDoc(announcementRef, {
            id: announcementRef.id,
            authorName: user.name || 'Admin',
            authorId: user.uid,
            title: title,
            content: content,
            isPinned: false, // Announcements are not pinned by default
            createdAt: Timestamp.now(),
        });

    } catch (error) {
        console.error("Announcement Creation Error:", error);
        return { message: "Database error: Failed to create announcement." };
    }

    // Revalidate the event page path to ensure data is fresh
    revalidatePath(`/dashboard/events/${eventId}`);
    return { message: `Successfully created announcement.` };
}


// --- EVENT UPDATE ---
export type UpdateEventState = CreateEventState;

const UpdateEventSchema = z.object({
    id: z.string(), // We now get the ID from a hidden form input
    title: z.string().min(3, { message: "Title must be at least 3 characters." }),
    description: z.string().optional(),
});

export async function updateEvent(prevState: UpdateEventState, formData: FormData): Promise<UpdateEventState> {
    const session = await adminAuth.getSession();
    if (!session?.uid) {
        return { message: "Authentication error: Not logged in." };
    }

    const validatedFields = UpdateEventSchema.safeParse({
        id: formData.get('id'),
        title: formData.get('title'),
        description: formData.get('description'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing or invalid fields.',
        };
    }

    const { id: eventId, title, description } = validatedFields.data;
    const userId = session.uid;

    try {
        const userDocRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
            return { message: "Database error: User profile not found." };
        }
        const organizationId = userDoc.data().organizationId;

        const eventRef = doc(db, `organizations/${organizationId}/events`, eventId);

        await updateDoc(eventRef, {
            title: title,
            description: description || '',
        });

    } catch (error) {
        console.error("Event Update Error:", error);
        return { message: "Database error: Failed to update event." };
    }

    revalidatePath(`/dashboard/events`);
    revalidatePath(`/dashboard/events/${eventId}`);
    redirect(`/dashboard/events/${eventId}`);
}

/**
 * Recursively deletes all documents in a collection and its sub-collections.
 * Uses batched writes for efficiency.
 * @param {string} collectionPath The path to the collection to delete.
 */
async function deleteCollection(collectionPath: string) {
    const collectionRef = collection(db, collectionPath);
    const q = query(collectionRef, limit(50)); // Process in batches of 50

    const snapshot = await getDocs(q);
    if (snapshot.size === 0) {
        return; // Collection is empty
    }

    // Delete documents in a batch
    const batch = writeBatch(db);
    snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });
    await batch.commit();

    // Recurse on the same collection to delete remaining documents
    await deleteCollection(collectionPath);
}


// --- EVENT DELETION ---

export type DeleteEventState = {
    message: string | null;
    errors?: {
        eventId?: string[];
        auth?: string[];
        server?: string[];
    };
};

const DeleteEventSchema = z.object({
    eventId: z.string().min(1, { message: 'Event ID is missing.' }),
});

export async function deleteEvent(
    prevState: DeleteEventState,
    formData: FormData,
): Promise<DeleteEventState> {

    // 1. Authenticate the user
    const session = await adminAuth.getSession();
    if (!session?.uid) {
        return { message: "Authentication error: Not logged in.", errors: { auth: ["You must be logged in to delete an event."] } };
    }

    // 2. Validate the form data
    const validatedFields = DeleteEventSchema.safeParse({
        eventId: formData.get('eventId'),
    });

    if (!validatedFields.success) {
        return {
            message: 'Validation failed. Could not delete event.',
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { eventId } = validatedFields.data;
    const userId = session.uid;

    try {
        // 3. Get the user's organization ID to build the correct path
        const userDocRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
            return { message: "Database error: User profile not found." };
        }
        const organizationId = userDoc.data().organizationId;

        // 4. Define paths for the event and its sub-collections
        const eventPath = `organizations/${organizationId}/events/${eventId}`;
        const announcementsPath = `${eventPath}/announcements`;
        // Add other sub-collection paths here if you create them later (e.g., polls)

        // 5. Delete all sub-collections first
        console.log(`Deleting announcements for event: ${eventId}`);
        await deleteCollection(announcementsPath);

        // 6. Once sub-collections are empty, delete the main event document
        console.log(`Deleting event document: ${eventId}`);
        const eventRef = doc(db, eventPath);
        await deleteDoc(eventRef);

        console.log(`Successfully deleted event: ${eventId}`);

    } catch (error) {
        console.error('Event Deletion Error:', error);
        return {
            message: 'An error occurred while trying to delete the event.',
            errors: { server: ["Please try again later."] }
        };
    }

    // 7. On success, revalidate the cache and redirect
    revalidatePath('/dashboard/events');
    redirect('/dashboard/events');
}



import { arrayUnion, arrayRemove } from 'firebase/firestore';



// --- ADMIN MANAGEMENT ACTIONS ---

export type GenerateInviteState = {
    link?: string;
    error?: string;
}

/**
 * Generates a reusable invite link for an event with specific permissions.
 */
export async function generateInviteLink(eventId: string, permissions: AdminPermission['permissions']): Promise<GenerateInviteState> {
    const session = await adminAuth.getSession();
    if (!session?.uid) return { error: "Authentication required." };

    try {
        const userDocRef = doc(db, 'users', session.uid);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) throw new Error("User profile not found.");
        const organizationId = userDoc.data().organizationId;

        const inviteId = nanoid(16);
        const inviteRef = doc(db, 'eventInvites', inviteId);

        await setDoc(inviteRef, {
            id: inviteId,
            eventId,
            organizationId,
            creatorUid: session.uid,
            createdAt: Timestamp.now(),
            defaultPermissions: permissions,
        });

        const inviteLink = `${process.env.NEXT_PUBLIC_BASE_URL}/invite/${inviteId}`;
        return { link: inviteLink };
    } catch (error) {
        console.error("Invite Link Generation Error:", error);
        return { error: "Failed to create invite link." };
    }
}

/**
 * Accepts an event invitation, adding the user to the event's admin list.
 */
export async function acceptInvite(inviteId: string) {
    const session = await adminAuth.getSession();
    if (!session?.uid) return redirect('/login');

    const inviteRef = doc(db, 'eventInvites', inviteId);
    const inviteDoc = await getDoc(inviteRef);

    if (!inviteDoc.exists()) {
        return redirect('/dashboard?error=invalid_invite');
    }

    const { eventId, organizationId, defaultPermissions } = inviteDoc.data();
    const eventRef = doc(db, `organizations/${organizationId}/events`, eventId);
    const eventDoc = await getDoc(eventRef);

    if (!eventDoc.exists()) {
        return redirect('/dashboard?error=event_not_found');
    }

    const eventData = eventDoc.data() as Event;
    const isAlreadyAdmin = eventData.admins.some(admin => admin.uid === session.uid);

    if (isAlreadyAdmin) {
        return redirect(`/dashboard/events/${eventId}?notice=already_admin`);
    }

    const newAdmin: AdminPermission = {
        uid: session.uid,
        permissions: defaultPermissions
    };

    await updateDoc(eventRef, {
        admins: arrayUnion(newAdmin)
    });

    revalidatePath(`/dashboard/events/${eventId}`);
    redirect(`/dashboard/events/${eventId}`);
}

/**
 * Removes an admin from an event.
 */
export async function removeAdmin(eventId: string, targetUid: string) {
    const session = await adminAuth.getSession();
    if (!session?.uid) throw new Error("Authentication required.");

    try {
        const userDocRef = doc(db, 'users', session.uid);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) throw new Error("User profile not found.");
        const organizationId = userDoc.data().organizationId;

        const eventRef = doc(db, `organizations/${organizationId}/events`, eventId);
        const eventDoc = await getDoc(eventRef);

        if (!eventDoc.exists()) throw new Error("Event not found.");

        const eventData = eventDoc.data() as Event;
        if (targetUid === eventData.ownerUid) {
            throw new Error("Cannot remove the event owner.");
        }

        const adminToRemove = eventData.admins.find(admin => admin.uid === targetUid);
        if (!adminToRemove) throw new Error("Admin not found in the list.");

        await updateDoc(eventRef, {
            admins: arrayRemove(adminToRemove)
        });

        revalidatePath(`/dashboard/events/${eventId}`);
        return { success: true };
    } catch (error) {
        console.error("Remove Admin Error:", error);
        return { success: false, error: (error as Error).message };
    }
}