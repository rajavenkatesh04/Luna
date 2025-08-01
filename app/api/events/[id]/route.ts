import { adminDb } from '@/app/lib/firebase-server';
import { type NextRequest, NextResponse } from 'next/server';

// This is the only method we want to allow for this route.
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: eventId } = await params;

        if (!eventId) {
            return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
        }

        const eventsQuery = adminDb.collectionGroup('events')
            .where('id', '==', eventId)
            .limit(1);

        const querySnapshot = await eventsQuery.get();

        if (querySnapshot.empty) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }

        const eventDoc = querySnapshot.docs[0];
        const eventData = eventDoc.data();
        const eventPath = eventDoc.ref.path;

        return NextResponse.json({ eventData, eventPath });

    } catch (error) {
        console.error('API Error fetching event:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// We can define a single handler for all other disallowed methods.
async function methodNotAllowed() {
    return NextResponse.json({ error: 'Method Not Allowed. Bruh, you can\'t perform this action.' }, { status: 405 });
}

// Export the handler for POST, PUT, DELETE, etc.
// This tells Next.js to use this function for these request types.
export { methodNotAllowed as POST, methodNotAllowed as DELETE, methodNotAllowed as PUT, methodNotAllowed as PATCH };