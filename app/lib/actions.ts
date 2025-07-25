// app/lib/actions.ts
"use server"

import { signOut } from 'firebase/auth';
import { auth } from '@/app/lib/firebase';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

/**
 * Handles the complete user logout process.
 */
export async function logout() {
    try {
        // This is less critical but good practice
        await signOut(auth);

        // --- THIS IS THE FIX ---
        // We must first 'await' the cookies() function to get the cookie store,
        // then we can call .set() on it.
        const cookieStore = await cookies();
        cookieStore.set('session', '', { maxAge: -1 });

    } catch (error) {
        console.error('Logout Error:', error);
    }

    // Always redirect to login after attempting to log out
    redirect('/login');
}
