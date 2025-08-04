// app/api/auth/check-status/route.ts

import { type NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
// REMOVE client SDK imports: import { doc, getDoc } from 'firebase/firestore';
import { adminDb } from '@/app/lib/firebase-server';

// No need to call initFirebaseAdminApp() here as it's called once in firebase-server.ts

export async function GET(request: NextRequest) {
    const sessionCookie = request.cookies.get('session')?.value;

    if (!sessionCookie) {
        return NextResponse.json({ isAuthenticated: false, isProfileComplete: false });
    }

    try {
        const decodedToken = await getAuth().verifySessionCookie(sessionCookie, true);

        // CORRECT WAY to reference a doc with the Admin SDK
        const userDocRef = adminDb.doc(`users/${decodedToken.uid}`);

        // CORRECT WAY to get the doc snapshot with the Admin SDK
        const userDoc = await userDocRef.get();

        if (!userDoc.exists) {
            // User is authenticated but hasn't completed their profile
            return NextResponse.json({ isAuthenticated: true, isProfileComplete: false });
        }

        // User is fully authenticated and has a profile
        return NextResponse.json({ isAuthenticated: true, isProfileComplete: true });

    } catch (error) {
        console.error("Check-status error:", error);
        // Session cookie is invalid or expired
        return NextResponse.json({ isAuthenticated: false, isProfileComplete: false });
    }
}