"use client"

import {useEffect, useState} from "react";
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { collection, query, onSnapshot, getDoc, doc, DocumentData } from 'firebase/firestore';
import {auth, db} from "@/app/lib/firebase";
import {useRouter} from "next/navigation";
import CreateForm from "@/app/ui/events/create-form";
import Link from "next/link";

export default function DashboardPage() {
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [organizationName, setOrganizationName] = useState('');
    const [events, setEvents] = useState<DocumentData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if( currentUser) {
                setUser(currentUser);

                //Fetch user's organization details
                const userDocRef = doc(db, 'users', currentUser.uid);
                const userDoc = await getDoc(userDocRef);

                if(userDoc.exists()) {
                    const orgId = userDoc.data().organizationId;
                    const orgDocRef = doc(db, 'organizations', orgId);
                    const orgDoc = await getDoc(orgDocRef);
                    if(orgDoc.exists()) {
                        setOrganizationName(orgDoc.data().name);
                    }

                    // Listen to real-time updates to events
                    const eventsQuery = query(
                        collection(db, `organizations/${orgId}/events`)
                    );

                    const unsubEvents = onSnapshot(eventsQuery, (snapshot) => {
                        const eventsData = snapshot.docs.map(doc => ({ ...doc.data(), docId: doc.id }));
                        setEvents(eventsData);
                        setIsLoading(false);
                    })

                    return () => {
                        unsubEvents();
                    } // cleanup event listener
                } else {
                    setIsLoading(false);
                }
            } else {
                router.push('/login');
            }
        })

        return () => {
            unsubscribe();
        }
    }, [router]);

    if(isLoading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>
    }

    return (
        <div className={`min-h-screen p-4`}>
            <header className={`mb-8 text-center`}>
                <h1 className={`text-2xl`}>Welcome, <span className={`text-gray-500`}>{user?.displayName || 'User'}!</span></h1>
                <p>{organizationName}</p>
            </header>

            <main className={`border border-gray-700 rounded-md `}>
                <div className={`p-4`}>
                    <div className={`flex justify-between border-b border-b-gray-700 mb-2 `}>
                        <h2 className="text-2xl font-semibold ">Your Events</h2>
                        <CreateForm/>
                    </div>

                    <div className={`grid grid-cols-1 md:grid-cols-2 lg-grid-cols-3 gap-6`}>
                        {events.length > 0 ? (
                            events.map(event => (
                                <Link
                                    href={`/dashboard/events/${event.docId}`}
                                    key={event.docId}
                                    className={`block p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow`}
                                >
                                    <h3>{event.title}</h3>
                                    <p>{event.description || 'No description'}</p>
                                    <p>{event.id}</p>

                                </Link>
                            ))
                        ) : (
                            <p>No events yet. Create one!</p>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}