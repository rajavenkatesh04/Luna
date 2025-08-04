// middleware.ts

import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    const sessionCookie = request.cookies.get('session')?.value;
    const url = request.nextUrl;

    // If there's no session, they can only access public pages
    if (!sessionCookie) {
        // FIX: Allow access to the homepage, login, AND public event pages.
        const isPublicPage = url.pathname === '/' || url.pathname.startsWith('/login') || url.pathname.startsWith('/e/');

        return isPublicPage
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
            const res = NextResponse.redirect(new URL('/login', url));
            res.cookies.set('session', '', { maxAge: -1 });
            return res;
        }

        if (isProfileComplete) {
            // If profile is complete, don't let them see login/onboarding pages
            if (url.pathname.startsWith('/login') || url.pathname.startsWith('/complete-profile')) {
                return NextResponse.redirect(new URL('/dashboard', url));
            }
        } else {
            // If profile is incomplete, force them to the complete-profile page
            // Allow access to /dashboard/invitations if profile is incomplete
            const isAllowedOnboardingRoute = url.pathname.startsWith('/complete-profile') || url.pathname.startsWith('/dashboard/invitations');
            if (!isAllowedOnboardingRoute) {
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
    // This matcher applies the middleware to all routes except for API, static files, etc.
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
