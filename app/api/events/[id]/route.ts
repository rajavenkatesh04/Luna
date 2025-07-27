import { collectionGroup, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const eventId = params.id;

        if (!eventId) {
            return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
        }

        const eventsQuery = query(
            collectionGroup(db, 'events'),
            where('id', '==', eventId),
            limit(1)
        );

        const querySnapshot = await getDocs(eventsQuery);

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