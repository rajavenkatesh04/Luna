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

        // --- THIS IS THE FIX ---
        // We must first 'await' the cookies() function to get the cookie store.
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('session')?.value;

        if (!sessionCookie) return null;

        // Verify the cookie is valid and not expired.
        const decodedClaims = await getAuth().verifySessionCookie(sessionCookie, true);
        return decodedClaims;
    } catch (error) {
        // Session cookie is invalid, expired, or an error occurred.
        return null;
    }
}

export const auth = { getSession };
