import { NextResponse } from 'next/server';
import { fetchPublicEventByCode } from '@/app/lib/data';

export async function GET(
    request: Request,
    { params }: { params: { code: string } }
) {
    const code = params.code;
    if (!code) {
        return NextResponse.json({ error: 'Event code is required.' }, { status: 400 });
    }

    try {
        const eventDetails = await fetchPublicEventByCode(code);

        if (!eventDetails) {
            return NextResponse.json({ error: 'Event not found.' }, { status: 404 });
        }

        return NextResponse.json(eventDetails);

    } catch (error) {
        console.error(`API Error fetching event ${code}:`, error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
