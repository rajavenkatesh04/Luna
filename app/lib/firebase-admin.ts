import { getAuth } from 'firebase-admin/auth';
import { initFirebaseAdminApp } from './firebase-server';
import { cookies } from 'next/headers';

/**
 * Securely gets the user's session from the session cookie.
 * This function runs ONLY on the server.
 * @returns The decoded user claims if the session is valid, otherwise null.
 */
async function getSession() {
    try {
        initFirebaseAdminApp();

        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('session')?.value;

        if (!sessionCookie) return null;

        const decodedClaims = await getAuth().verifySessionCookie(sessionCookie, true);
        return decodedClaims;
    } catch (error) {
        return null;
    }
}

// This export remains for any other part of your app that uses it.
export const  auth = { getSession };

// NEW: Export the full Firebase Admin Auth service for your server action.
initFirebaseAdminApp(); // Ensure the app is initialized before exporting.
export const masterAuth = getAuth();