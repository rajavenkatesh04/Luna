// middleware.ts
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    const sessionCookie = request.cookies.get('session')?.value;
    const url = request.nextUrl.clone();

    // The base URL for your app, required for the internal fetch
    const appBaseUrl = request.nextUrl.origin;

    // A helper function to check session validity via our new API route
    const isSessionValid = async (): Promise<boolean> => {
        if (!sessionCookie) return false;
        try {
            // Fetch from our internal API route
            const response = await fetch(`${appBaseUrl}/api/auth/verify-session`, {
                headers: {
                    Cookie: `session=${sessionCookie}`
                }
            });
            return response.ok;
        } catch (error) {
            console.error('Error verifying session:', error);
            return false;
        }
    };

    const hasValidSession = await isSessionValid();

    // If trying to access the login page with a valid session, redirect to dashboard
    if (url.pathname.startsWith('/login')) {
        if (hasValidSession) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
        return NextResponse.next();
    }

    // If trying to access a protected route without a valid session, redirect to login
    if (url.pathname.startsWith('/dashboard')) {
        if (!hasValidSession) {
            url.pathname = '/login';
            url.searchParams.set('error', 'session_expired');
            return NextResponse.redirect(url);
        }
    }

    return NextResponse.next();
}

// Config remains the same
export const config = {
    matcher: ['/dashboard/:path*', '/login'],
};