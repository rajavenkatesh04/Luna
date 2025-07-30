// app/api/auth/verify-session/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initFirebaseAdminApp } from '@/app/lib/firebase-server';

// Initialize the Firebase Admin App
initFirebaseAdminApp();

export async function GET(request: NextRequest) {
    const sessionCookie = request.cookies.get('session')?.value;

    if (!sessionCookie) {
        return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    try {
        // Use firebase-admin to verify the cookie
        await getAuth().verifySessionCookie(sessionCookie, true);

        // If verification is successful, return a 200 OK response
        return new NextResponse(JSON.stringify({ status: 'success' }), { status: 200 });
    } catch (error) {
        // If verification fails, return a 401 Unauthorized response
        return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }
}