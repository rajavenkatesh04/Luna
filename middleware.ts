import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    const sessionCookie = request.cookies.get('session');

    // If user is logged in, redirect them away from the login page to the dashboard
    if (sessionCookie && request.nextUrl.pathname.startsWith('/login')) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // If user is not logged in, protect the dashboard and complete-profile pages
    if (!sessionCookie && (request.nextUrl.pathname.startsWith('/dashboard') || request.nextUrl.pathname.startsWith('/complete-profile'))) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/login', '/complete-profile'],
}