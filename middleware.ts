// middleware.ts
import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const sessionCookie = request.cookies.get('session')?.value;
    const url = request.nextUrl;

    // Only protect routes that start with /dashboard
    if (url.pathname.startsWith('/dashboard')) {
        // If there's no session cookie, redirect to the login page
        if (!sessionCookie) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // For all other routes, allow the request to proceed
    return NextResponse.next();
}

export const config = {
    // This matcher applies the middleware to all routes except for API, static files, etc.
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
