// app/lib/firebase-admin.ts
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { cookies } from 'next/headers';

// Initialize Firebase Admin SDK
export function initFirebaseAdminApp() {
    if (getApps().length === 0) {
        initializeApp({
            credential: cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
        });
    }
}

// Create auth helper that can verify sessions
export const auth = {
    async getSession() {
        initFirebaseAdminApp();

        try {
            const cookieStore = await cookies();
            const sessionCookie = cookieStore.get('session')?.value;

            if (!sessionCookie) {
                return null;
            }

            // Verify the session cookie and return user info
            const decodedClaims = await getAuth().verifySessionCookie(sessionCookie);
            return {
                uid: decodedClaims.uid,
                email: decodedClaims.email,
                name: decodedClaims.name,
                picture: decodedClaims.picture,
            };
        } catch (error) {
            console.error('Session verification error:', error);
            return null;
        }
    }
};