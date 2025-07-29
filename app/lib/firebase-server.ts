// app/lib/firebase-server.ts

import admin from 'firebase-admin';
import { getMessaging } from 'firebase-admin/messaging';

/**
 * Initializes the Firebase Admin App if it hasn't been already.
 * This function can be safely called multiple times.
 */
export function initFirebaseAdminApp(): admin.app.App {
    // If the app is already initialized, return the existing app.
    if (admin.apps.length > 0) {
        return admin.apps[0] as admin.app.App;
    }

    // If not initialized, create it.
    const serviceAccount = {
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    const app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });

    return app;
}

// Ensure the app is initialized when this module is loaded.
const adminApp = initFirebaseAdminApp();

// This single line gets the messaging service from the initialized app
// and exports it as a constant. This fixes the error.
export const adminMessaging = getMessaging(adminApp);