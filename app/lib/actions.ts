// app/lib/actions.ts
"use server"

import { signOut } from 'firebase/auth';
import {auth, db} from '@/app/lib/firebase';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { auth as adminAuth } from '@/app/lib/firebase-admin';
import { z } from "zod";
import { doc, getDoc, setDoc, collection, Timestamp } from 'firebase/firestore';
import { nanoid } from 'nanoid';
import { revalidatePath } from 'next/cache';
import { updateDoc } from 'firebase/firestore';

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
    // 1. Securely get the user's session on the server
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
        // 2. Get the user's organization ID from their user document
        const userDocRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
            return { message: "Database error: User profile not found." };
        }
        const organizationId = userDoc.data().organizationId;

        // 3. Generate a unique ID and create the event document
        const eventId = nanoid(6).toUpperCase();
        const eventRef = doc(db, `organizations/${organizationId}/events`, eventId);

        await setDoc(eventRef, {
            id: eventId,
            title: title,
            description: description || '',
            ownerUid: userId,
            admins: [userId], // The creator is the first admin
            createdAt: Timestamp.now(),
        });

    } catch (error) {
        console.error("Event Creation Error:", error);
        return { message: "Database error: Failed to create event." };
    }

    // 4. On success, revalidate the events page and redirect the user there.
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



// --- Invite creation ---
export async function createInvite(eventId : String) {
    return console.log("Invite created");
}



// 1. Define the state for the delete action
export type DeleteEventState = {
    message: string | null;
    errors: {}; // Kept for consistency, can be expanded later
};

// 2. Define the Zod schema for validation
const DeleteEventSchema = z.object({
    eventId: z.string().min(1, { message: 'Event ID is missing.' }),
});


// 3. Create the placeholder server action
export async function deleteEvent(
    prevState: DeleteEventState,
    formData: FormData,
): Promise<DeleteEventState> {
    // Validate form data
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

    try {
        console.log(`Placeholder: Attempting to delete event with ID: ${eventId}`);

        //
        // TODO: Add your actual Firebase deletion logic here when ready.
        // Example:
        // const eventRef = doc(db, `path/to/events/${eventId}`);
        // await deleteDoc(eventRef);
        // console.log(`Successfully deleted event: ${eventId}`);
        //

    } catch (error) {
        console.error('Deletion Error:', error);
        return {
            message: 'An error occurred while trying to delete the event. Please try again.',
            errors: {},
        };
    }

    // On successful deletion, revalidate the cache and redirect
    revalidatePath('/dashboard/events');
    redirect('/dashboard/events');
}
