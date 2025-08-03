// middleware.ts

import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    const sessionCookie = request.cookies.get('session')?.value;
    const url = request.nextUrl;

    // If there's no session, they can only access the login page
    if (!sessionCookie) {
        return url.pathname.startsWith('/login')
            ? NextResponse.next()
            : NextResponse.redirect(new URL('/login', url));
    }

    // If a session exists, verify its status
    try {
        const response = await fetch(`${url.origin}/api/auth/check-status`, {
            headers: { 'Cookie': `session=${sessionCookie}` }
        });
        const { isAuthenticated, isProfileComplete } = await response.json();

        if (!isAuthenticated) {
            // The cookie is invalid/expired, so clear it and send to login
            const res = NextResponse.redirect(new URL('/login', url));
            res.cookies.set('session', '', { maxAge: -1 });
            return res;
        }

        // === User is Authenticated, Now Route Based on Profile Status ===

        if (isProfileComplete) {
            // If the profile is complete, they should NOT be on login or complete-profile
            if (url.pathname.startsWith('/login') || url.pathname.startsWith('/complete-profile')) {
                return NextResponse.redirect(new URL('/dashboard', url));
            }
        } else {
            // If the profile is INCOMPLETE, they MUST be on the complete-profile page
            if (!url.pathname.startsWith('/complete-profile')) {
                return NextResponse.redirect(new URL('/complete-profile', url));
            }
        }

    } catch (error) {
        console.error('Middleware check failed:', error);
        return NextResponse.redirect(new URL('/login', url));
    }

    // If all checks pass, allow the request to proceed
    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};