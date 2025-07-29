import admin from 'firebase-admin';
import { getMessaging } from 'firebase-admin/messaging';
import { getFirestore } from 'firebase-admin/firestore'; // Import admin getFirestore

export function initFirebaseAdminApp(): admin.app.App {
    if (admin.apps.length > 0) {
        return admin.apps[0] as admin.app.App;
    }
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

const adminApp = initFirebaseAdminApp();

// Export all the admin services we need
export const adminMessaging = getMessaging(adminApp);
export const adminDb = getFirestore(adminApp);