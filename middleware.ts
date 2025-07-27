import {NextRequest, NextResponse} from "next/server";

export async function middleware(request: NextRequest ) {
    const sessionCookie = request.cookies.get('session');

    // If user is logged in, redirect them away from the login page to the dashboard
    if (sessionCookie && request.nextUrl.pathname.startsWith('/login')) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // If user is not logged in, protect the dashboard and complete-profile pages
    if (!sessionCookie && (request.nextUrl.pathname.startsWith('/dashboard'))) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // If neither of the above conditions are met, allow the request to proceed.
    return NextResponse.next();
}

// This configures the middleware to run ONLY on the specified paths.
export const config = {
    matcher: ['/dashboard/:path*', '/login'],
}