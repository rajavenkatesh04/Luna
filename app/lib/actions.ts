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
        // This is less critical with session cookies but good practice
        await signOut(auth);

        // This is the correct way to delete the session cookie on the server
        cookies().delete('session');

    } catch (error) {
        console.error('Logout Error:', error);
    }

    // Always redirect to login after attempting to log out
    redirect('/login');
}

// Note: We will add the createEvent action back later.
