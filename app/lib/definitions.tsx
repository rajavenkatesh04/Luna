export interface User {
    uid: string;
    email: string;
    displayName: string;
    organisationId: string;
    role: 'user' | 'admin' | 'owner' | 'master' ;
}

export interface Organisation {
    id: string;
    name: string;
    ownerUid: string;
    subscriptionTier: 'free' | 'pro' | 'enterprise';
}


// This is the blueprint for a single Event document in Firestore.
export type Event = {
    docId: string; // The unique ID from Firestore
    id: string; // The short, shareable ID
    title: string;
    description: string;
    ownerUid: string;
    admins: string[];
    createdAt: {
        seconds: number;
        nanoseconds: number;
    };
};


export interface Announcement {
    id: string;
    title: string;
    content: string;
    isPinned?: boolean;
    eventId: string;
    creatorUid: string;
    timeStamp: Date;
}

export interface Poll {
    id: string;
    question: string;
    options: { [optionText: string]: number};
    voters?: string[];
    isPinned?: boolean;
    eventId: string;
    creatorUid: string;
    timeStamp: Date;
}



