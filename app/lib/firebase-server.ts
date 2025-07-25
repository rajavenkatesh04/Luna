import admin from 'firebase-admin';

export function initFirebaseAdminApp(): admin.app.App {
    const alreadyCreated = admin.apps;
    if (alreadyCreated.length > 0) {
        return alreadyCreated[0] as admin.app.App;
    }

    const serviceAccount = {
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID, // Safe to use NEXT_PUBLIC_ here if it's consistent
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    return admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}