// scripts/migrate-events.js

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
const dotenv = require('dotenv');
const path = require('path');

/**
 * Loads environment variables from the .env.local file in the project root.
 */
function loadEnv() {
    const envPath = path.resolve(process.cwd(), '.env.local');
    dotenv.config({ path: envPath });
}

/**
 * Initializes the Firebase Admin SDK using credentials from environment variables.
 */
function initializeFirebaseAdmin() {
    const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // The private key needs to have its escaped newlines replaced
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };

    if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
        throw new Error('Firebase Admin credentials are not set in the environment variables.');
    }

    initializeApp({
        credential: cert(serviceAccount),
    });

    console.log('Firebase Admin SDK initialized successfully.');
}

/**
 * Main function to find and update old event documents.
 */
async function migrateEvents() {
    console.log('🚀 Starting event migration...');

    const db = getFirestore();

    // 1. Use a collectionGroup query to find all 'events' documents
    //    where the 'startsAt' field is missing.
    const eventsRef = db.collectionGroup('events');
    const snapshot = await eventsRef.where('startsAt', '==', null).get();

    if (snapshot.empty) {
        console.log('✅ No events found that need migration. All documents are up to date!');
        return;
    }

    console.log(`🔍 Found ${snapshot.size} events to migrate.`);

    // 2. Create a batch to update all documents efficiently.
    const batch = db.batch();
    snapshot.docs.forEach(doc => {
        const eventData = doc.data();

        // 3. Use the event's `createdAt` time as a default value.
        const defaultStartTime = eventData.createdAt;

        // Create an end time 1 hour after the start time.
        const defaultEndTime = new Timestamp(defaultStartTime.seconds + 3600, defaultStartTime.nanoseconds);

        console.log(`  - Preparing to update event ${doc.id}...`);

        // 4. Add the update operation to the batch.
        batch.update(doc.ref, {
            startsAt: defaultStartTime,
            endsAt: defaultEndTime
        });
    });

    // 5. Commit the batch to the database.
    await batch.commit();
    console.log(`✅ Successfully migrated ${snapshot.size} events.`);
}

// --- EXECUTE SCRIPT ---
async function run() {
    try {
        loadEnv();
        initializeFirebaseAdmin();
        await migrateEvents();
    } catch (error) {
        console.error('❌ Migration script failed:', error);
        process.exit(1);
    }
}

run();