"use server"

import { z } from "zod";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { doc, collection, query, where, getDocs, writeBatch, getDoc } from 'firebase/firestore';
import { auth, db } from '@/app/lib/firebase';
import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";

const SignupFormSchema = z.object({
    displayName: z.string().min(2, { message: "Name must be at least 2 characters." }),
    organizationName: z.string().min(2, { message: "Organization name must be at least 2 characters"}),
    email: z.string().email(),
    password: z.string().min(6, { message: "Password must be at least 6 characters"}),
})

export type State = {
    errors?: z.inferFlattenedErrors<typeof SignupFormSchema>;
    message?: string | null;
};

// Ignore list of public domains from "claim domain"
const PUBLIC_EMAIL_DOMAINS = new Set([
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'icloud.com'
]);

export async function signup(prevState: State, formData: FormData) {
    // 1. Validate the form data
    const validatedFields = SignupFormSchema.safeParse({
        displayName: formData.get('displayName'),
        organizationName: formData.get('organizationName'),
        email: formData.get('email'),
        password: formData.get('password'),
    });

    if(!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten(),
            message: 'Missing or invalid fields. Failed to Sign Up.',
        }
    }

    const { displayName, organizationName, email, password } = validatedFields.data;

    // 2. Extract the domain and check if it's a public domain
    const emailDomain = email.split('@')[1];

    if(!PUBLIC_EMAIL_DOMAINS.has(emailDomain)) {
        // This will be a private/company/college domain, so we check if already claimed.
        const orgsRef = collection(db, 'organizations');
        const q = query(orgsRef, where("claimedDomain", "==", emailDomain));

        const querySnapshot = await getDocs(q);

        if(!querySnapshot.empty) {
            // Domain already claimed, stop the sign-up!
            return {
                message: `An organization with the domain "${emailDomain}" already exists. Please ask the owner for invitation.`
            };
        }
    }

    // If public domain, or domain not claimed, proceed with sign-up.
    try{
        // 3. Create the user in Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await updateProfile(user, {
            displayName: displayName
        });

        // Use a firebase batch write to make the operation atomic (all or nothing)
        const batch = writeBatch(db);

        // 4. Create the organization in Firestore
        const orgRef = doc(collection(db, 'organizations'));
        batch.set(orgRef, {
            name: organizationName,
            ownerUid: user.uid,
            subscriptionTier: 'free',
            // Add the claimed domain if it's not a public one
            ...(!PUBLIC_EMAIL_DOMAINS.has(emailDomain) && { claimedDomain: emailDomain })
        });

        // 5. Create our own User record in Firestore
        const userRef = doc(db, 'users', user.uid);
        batch.set(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: displayName,
            organizationId: orgRef.id,
            role: 'owner',
        });

        // commit the batch write
        await batch.commit();

    } catch (error: unknown) {
        if (typeof error === 'object' && error !== null && 'code' in error) {
            const firebaseError = error as { code: string };
            if (firebaseError.code === 'auth/email-already-in-use') {
                return { message: 'This email address is already in use.' };
            }
        }
        // If it's not a known Firebase error, log it and return a generic message.
        console.error("Signup Error:", error);
        return { message: 'An unexpected error occurred. Please try again.' };
    }

    // 6. Revalidate and redirect
    revalidatePath('/dashboard');
    redirect('/dashboard');
}



//Login

export type LoginState = {
    message?: string | null;
}

export async function login(prevState: LoginState, formData: FormData): Promise<LoginState> {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if(!email || !password) {
        return {
            message: 'Email and password are required.',
        }
    }

    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error: unknown) {
        // Firebase provides specific error codes for login failures.
        if (typeof error === 'object' && error !== null && 'code' in error) {
            const firebaseError = error as { code: string };
            switch (firebaseError.code) {
                case 'auth/invalid-credential':
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                    return {
                        message: 'Invalid email or password.',
                    }
                default: return { message: 'An unexpected error occurred. Please try again.'}
            }
        }

        console.error("Login Error:", error);
        return { message: 'An unexpected error occurred. Please try again.'}
    }

    // On successful login, redirect to dashboard
    revalidatePath('/dashboard');
    redirect('/dashboard');
}

export async function logout() {
    await signOut(auth);
    // On successful logout, redirect to login
    revalidatePath('/login');
    redirect('/login');
}



// --- Google Sign-In Action ---


export async function handleGoogleSignIn(user: { uid: string, email: string | null, displayName: string }) {
    if(!user.email) {
        throw new Error('Google sign-in failed: No email address provided.');
    }

    // 1. Check if user document already exists in our Firebase 'users' collection.
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    if(userDoc.exists()) {
        // 2. If user already exists, they're just loggin in. Redirect to dashboard
        revalidatePath('/dashboard');
        redirect('/dashboard');
    } else {
        // 3. If user doesn't exist, this is their first time signing in.
        // We need to run the "claim domain" check and create their organization.

        const emailDomain = user.email.split('@')[1];
        const organizationName = user.displayName ? `${user.displayName}'s Workspace` : "My Workspace";

        if(!PUBLIC_EMAIL_DOMAINS.has(emailDomain)) {
            // check if the domain already claimed
            const orgsRef = collection(db, 'organizations');
            const q = query(orgsRef, where("claimedDomain", "==", emailDomain));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                // If the domain already claimed, we can't create a new organisation.
                // We'll redirect to login with an error message.
                // In future, an "request to join" feature will be added.
                redirect(`/login?error=domain_claimed&domain=${emailDomain}`);
            }
        }

        // 4. If the domain is available, create the new user and organization.
        try{
            const batch = writeBatch(db);
            const orgRef = doc(collection(db, 'organizations'));
            batch.set(orgRef, {
                name: organizationName,
                ownerUid: user.uid,
                subscriptionTier: 'free',
                ...(!PUBLIC_EMAIL_DOMAINS.has(emailDomain) && { claimedDomain: emailDomain })
            })

            // we use the userRef we defined earlier
            batch.set(userRef, {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || "User",
                organizationId: orgRef.id,
                role: 'owner',
            });

            await batch.commit();

        } catch (error) {
            console.error("Google Sign-In DB Error:", error);

            // Redirect with  generic error if the database write fails.
            redirect('/login?error=google_signup_failed');
        }

        // 5. Sucess! Redirect to dashboard
        revalidatePath('/dashboard');
        redirect('/dashboard');
    }
}