import { NextResponse } from 'next/server';
import { fetchAllUsers } from '@/app/lib/data';

export async function GET(request: Request) {
    try {
        // Bypassing all security checks as requested.
        // This will return all users to whoever calls this endpoint.
        const users = await fetchAllUsers();
        return NextResponse.json({ users });

    } catch (error) {
        console.error("API Error fetching all users:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}